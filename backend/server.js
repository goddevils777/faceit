const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/config');

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const gameRoutes = require('./routes/game');

// Импорт middleware
const AuthMiddleware = require('./middleware/auth');
const SecurityMiddleware = require('./middleware/security');

class SmartFaceitServer {
    constructor() {
        this.app = express();
        this.port = config.PORT || 3000;
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    // Инициализация middleware
    initializeMiddleware() {
        // Безопасность
        this.app.use(helmet({
            contentSecurityPolicy: false, // Упрощаем для разработки
            crossOriginEmbedderPolicy: false
        }));

        // CORS
        this.app.use(cors({
            origin: true, // Разрешаем все для разработки
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 минут
            max: 100, // максимум 100 запросов с одного IP
            message: {
                error: 'Слишком много запросов, попробуйте позже'
            },
            standardHeaders: true,
            legacyHeaders: false,
        });

        this.app.use('/api/', limiter);

        // Логирование
        this.app.use(morgan('combined'));

        // Парсинг JSON
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Кастомные middleware безопасности
        this.app.use(SecurityMiddleware.sanitizeInput);
        this.app.use(SecurityMiddleware.detectSQLInjection);
        this.app.use(SecurityMiddleware.detectXSS);

        // Статические файлы
        this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    }

    // Инициализация маршрутов
    initializeRoutes() {
        // Health check
        this.app.get('/api/health', (req, res) => {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                version: config.VERSION || '1.0.0',
                uptime: process.uptime()
            });
        });

        // API маршруты
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/users', AuthMiddleware.authenticate, userRoutes);
        this.app.use('/api/games', AuthMiddleware.authenticate, gameRoutes);

        // Статическая раздача фронтенда
        this.app.use(express.static(path.join(__dirname, '../frontend')));

        // SPA fallback
        this.app.get('*', (req, res) => {
            if (req.path.startsWith('/api')) {
                return res.status(404).json({ error: 'API endpoint not found' });
            }
            res.sendFile(path.join(__dirname, '../frontend/index.html'));
        });
    }

    // Обработка ошибок
    initializeErrorHandling() {
        // 404 для API
        this.app.use('/api/*', (req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                path: req.path,
                method: req.method
            });
        });

        // Глобальный обработчик ошибок
        this.app.use((error, req, res, next) => {
            console.error('Server Error:', error);

            let statusCode = 500;
            let message = 'Внутренняя ошибка сервера';

            if (error.name === 'ValidationError') {
                statusCode = 400;
                message = 'Ошибка валидации данных';
            } else if (error.name === 'UnauthorizedError') {
                statusCode = 401;
                message = 'Неавторизованный доступ';
            } else if (error.message === 'Invalid JSON') {
                statusCode = 400;
                message = 'Некорректный формат JSON';
            }

            res.status(statusCode).json({
                error: message,
                ...(config.NODE_ENV === 'development' && {
                    details: error.message,
                    stack: error.stack
                })
            });
        });

        // Обработка необработанных исключений
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            this.gracefulShutdown();
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            this.gracefulShutdown();
        });
    }

    // Запуск сервера
    start() {
        this.server = this.app.listen(this.port, () => {
            console.log(`🚀 Smart Faceit Server запущен на порту ${this.port}`);
            console.log(`📝 Режим: ${config.NODE_ENV}`);
            console.log(`🌐 API: http://localhost:${this.port}/api`);
            console.log(`🎮 Frontend: http://localhost:${this.port}`);
            console.log(`💚 Health check: http://localhost:${this.port}/api/health`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => this.gracefulShutdown());
        process.on('SIGINT', () => this.gracefulShutdown());
    }

    // Graceful shutdown
    gracefulShutdown() {
        console.log('\n🛑 Получен сигнал остановки сервера...');

        if (this.server) {
            this.server.close(() => {
                console.log('✅ HTTP сервер остановлен');
                process.exit(0);
            });

            setTimeout(() => {
                console.error('⚠️ Принудительная остановка сервера');
                process.exit(1);
            }, 10000);
        } else {
            process.exit(0);
        }
    }
}

// Создание и запуск сервера
const server = new SmartFaceitServer();

// Экспорт для тестирования
module.exports = server;

// Запуск если файл вызван напрямую
if (require.main === module) {
    server.start();
}