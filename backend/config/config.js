// Конфигурация бэкенда
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = {
    // Основные настройки
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    VERSION: '1.0.0',

    // URL фронтенда
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:8080',

    // База данных
    DATABASE: {
        HOST: process.env.DB_HOST || 'localhost',
        PORT: process.env.DB_PORT || 5432,
        NAME: process.env.DB_NAME || 'smart_faceit',
        USER: process.env.DB_USER || 'postgres',
        PASSWORD: process.env.DB_PASSWORD || 'password',
        SSL: process.env.DB_SSL === 'true',
        POOL: {
            MIN: parseInt(process.env.DB_POOL_MIN) || 2,
            MAX: parseInt(process.env.DB_POOL_MAX) || 10,
            IDLE_TIMEOUT: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
            ACQUIRE_TIMEOUT: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000
        }
    },

    // JWT настройки
    JWT: {
        SECRET: process.env.JWT_SECRET || 'smart_faceit_super_secret_key_2025',
        EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
        REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'smart_faceit_refresh_secret_2025',
        REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },

    // Шифрование
    ENCRYPTION: {
        ALGORITHM: 'aes-256-gcm',
        PASSWORD_SALT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
        SECRET_KEY: process.env.ENCRYPTION_SECRET || 'smart_faceit_encryption_key_2025'
    },

    // Безопасность
    SECURITY: {
        CSRF_SECRET: process.env.CSRF_SECRET || 'smart_faceit_csrf_secret_2025',
        SESSION_SECRET: process.env.SESSION_SECRET || 'smart_faceit_session_secret_2025',
        MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
        LOCKOUT_TIME: parseInt(process.env.LOCKOUT_TIME) || 900000, // 15 минут
        PASSWORD_MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH) || 6,
        PASSWORD_MAX_LENGTH: parseInt(process.env.PASSWORD_MAX_LENGTH) || 128
    },

    // Rate Limiting
    RATE_LIMIT: {
        WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 минут
        MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX) || 100,
        AUTH_WINDOW_MS: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW) || 900000,
        AUTH_MAX_REQUESTS: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5
    },

    // Файлы
    UPLOAD: {
        MAX_SIZE: parseInt(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        UPLOAD_PATH: process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads'),
        AVATAR_MAX_SIZE: parseInt(process.env.AVATAR_MAX_SIZE) || 1 * 1024 * 1024 // 1MB
    },

    // Email настройки
    EMAIL: {
        SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
        SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
        SMTP_SECURE: process.env.SMTP_SECURE === 'true',
        SMTP_USER: process.env.SMTP_USER || '',
        SMTP_PASS: process.env.SMTP_PASS || '',
        FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@smartfaceit.com',
        FROM_NAME: process.env.FROM_NAME || 'Smart Faceit'
    },

    // ELO система
    ELO: {
        DEFAULT_ELO: parseInt(process.env.DEFAULT_ELO) || 1000,
        MIN_ELO: parseInt(process.env.MIN_ELO) || 100,
        MAX_ELO: parseInt(process.env.MAX_ELO) || 3000,
        K_FACTOR: parseFloat(process.env.ELO_K_FACTOR) || 32,
        CALIBRATION_GAMES: parseInt(process.env.CALIBRATION_GAMES) || 10
    },

    // Игровые настройки
    GAME: {
        MATCH_DURATION: parseInt(process.env.MATCH_DURATION) || 1800000, // 30 минут
        MAX_PLAYERS_PER_MATCH: parseInt(process.env.MAX_PLAYERS_PER_MATCH) || 10,
        MIN_PLAYERS_PER_MATCH: parseInt(process.env.MIN_PLAYERS_PER_MATCH) || 2,
        QUEUE_TIMEOUT: parseInt(process.env.QUEUE_TIMEOUT) || 300000, // 5 минут
        REGIONS: ['asia', 'russia', 'europe', 'usa', 'brazil', 'australia'],
        MAPS: ['province', 'hanami', 'rust', 'sandstone'],
        GAME_MODES: ['competitive', 'casual', 'tournament']
    },

    // Кэширование
    CACHE: {
        REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
        DEFAULT_TTL: parseInt(process.env.CACHE_TTL) || 3600, // 1 час
        SESSIONS_TTL: parseInt(process.env.SESSIONS_TTL) || 86400 // 24 часа
    },

    // Логирование
    LOGGING: {
        LEVEL: process.env.LOG_LEVEL || 'info',
        FILE_PATH: process.env.LOG_FILE_PATH || path.join(__dirname, '../../logs'),
        MAX_SIZE: process.env.LOG_MAX_SIZE || '10m',
        MAX_FILES: parseInt(process.env.LOG_MAX_FILES) || 5
    },

    // Мониторинг
    MONITORING: {
        SENTRY_DSN: process.env.SENTRY_DSN || '',
        METRICS_ENABLED: process.env.METRICS_ENABLED === 'true',
        HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000
    },

    // Социальная авторизация
    OAUTH: {
        GOOGLE: {
            CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
            CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
            REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || ''
        },
        VK: {
            CLIENT_ID: process.env.VK_CLIENT_ID || '',
            CLIENT_SECRET: process.env.VK_CLIENT_SECRET || '',
            REDIRECT_URI: process.env.VK_REDIRECT_URI || ''
        }
    },

    // Валидация
    VALIDATION: {
        USERNAME: {
            MIN_LENGTH: 3,
            MAX_LENGTH: 20,
            PATTERN: /^[a-zA-Z0-9_-]+$/
        },
        EMAIL: {
            PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        }
    }
};

// Валидация критических настроек
function validateConfig() {
    const requiredFields = [
        'JWT.SECRET',
        'ENCRYPTION.SECRET_KEY',
        'SECURITY.CSRF_SECRET'
    ];

    const missingFields = [];

    requiredFields.forEach(field => {
        const keys = field.split('.');
        let value = config;
        
        for (const key of keys) {
            value = value[key];
            if (value === undefined || value === '') {
                missingFields.push(field);
                break;
            }
        }
    });

    if (missingFields.length > 0) {
        console.error('❌ Отсутствуют обязательные настройки:', missingFields);
        if (config.NODE_ENV === 'production') {
            process.exit(1);
        }
    }

    // Предупреждения о небезопасных настройках в продакшене
    if (config.NODE_ENV === 'production') {
        const warnings = [];

        if (config.JWT.SECRET.includes('smart_faceit')) {
            warnings.push('JWT_SECRET использует значение по умолчанию');
        }

        if (config.ENCRYPTION.SECRET_KEY.includes('smart_faceit')) {
            warnings.push('ENCRYPTION_SECRET использует значение по умолчанию');
        }

        if (warnings.length > 0) {
            console.warn('⚠️ Предупреждения безопасности:', warnings);
        }
    }
}

// Запуск валидации
validateConfig();

module.exports = config;