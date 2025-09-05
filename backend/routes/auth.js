// Маршруты аутентификации
const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

// Регистрация пользователя
router.post('/register', 
    ValidationMiddleware.validateRegister,
    AuthMiddleware.rateLimitAuth(),
    async (req, res) => {
        try {
            const { username, email, password, region } = req.body;

            // Временная заглушка - в реальном проекте здесь будет работа с БД
            const hashedPassword = await AuthMiddleware.hashPassword(password);

            // Симуляция создания пользователя
            const newUser = {
                id: 'user_' + Date.now(),
                username,
                email,
                region,
                elo: 1000,
                level: 1,
                createdAt: new Date()
            };

            // Генерация токенов
            const tokens = AuthMiddleware.generateTokenPair(newUser.id, 'user');

            res.status(201).json({
                success: true,
                message: 'Пользователь успешно зарегистрирован',
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    region: newUser.region,
                    elo: newUser.elo,
                    level: newUser.level
                },
                ...tokens
            });

        } catch (error) {
            console.error('Registration error:', error);
            
            if (req.recordFailedAttempt) {
                req.recordFailedAttempt();
            }

            res.status(500).json({
                success: false,
                error: 'Ошибка при регистрации пользователя',
                code: 'REGISTRATION_ERROR'
            });
        }
    }
);

// Вход пользователя
router.post('/login',
    ValidationMiddleware.validateLogin,
    AuthMiddleware.rateLimitAuth(),
    async (req, res) => {
        try {
            const { login, password, remember } = req.body;

            // Временная заглушка - в реальном проекте поиск в БД
            if (login === 'demo@smartfaceit.com' && password === 'demo123') {
                const user = {
                    id: 'demo_user_123',
                    username: 'DemoPlayer',
                    email: 'demo@smartfaceit.com',
                    region: 'europe',
                    elo: 1250,
                    level: 6
                };

                // Генерация токенов
                const tokens = AuthMiddleware.generateTokenPair(user.id, 'user');

                if (req.clearFailedAttempts) {
                    req.clearFailedAttempts();
                }

                res.json({
                    success: true,
                    message: 'Успешная авторизация',
                    user,
                    ...tokens
                });
            } else {
                if (req.recordFailedAttempt) {
                    req.recordFailedAttempt();
                }

                res.status(401).json({
                    success: false,
                    error: 'Неверные учетные данные',
                    code: 'INVALID_CREDENTIALS'
                });
            }

        } catch (error) {
            console.error('Login error:', error);
            
            if (req.recordFailedAttempt) {
                req.recordFailedAttempt();
            }

            res.status(500).json({
                success: false,
                error: 'Ошибка при входе в систему',
                code: 'LOGIN_ERROR'
            });
        }
    }
);

// Обновление токена
router.post('/refresh', AuthMiddleware.refreshToken);

// Выход из системы
router.post('/logout', AuthMiddleware.authenticate, AuthMiddleware.logout);

// Проверка токена
router.get('/validate', AuthMiddleware.authenticate, (req, res) => {
    res.json({
        valid: true,
        user: {
            id: req.user.id,
            role: req.user.role
        }
    });
});

// Забыли пароль (заглушка)
router.post('/forgot-password', (req, res) => {
    res.json({
        success: true,
        message: 'Инструкции по восстановлению пароля отправлены на email'
    });
});

module.exports = router;