// Middleware аутентификации и авторизации
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

class AuthMiddleware {
    // Приватные статические свойства
    static #blacklistedTokens = new Set();
    static #loginAttempts = new Map();

    // Генерация JWT токена
    static generateToken(payload, type = 'access') {
        const secret = type === 'refresh' ? config.JWT.REFRESH_SECRET : config.JWT.SECRET;
        const expiresIn = type === 'refresh' ? config.JWT.REFRESH_EXPIRES_IN : config.JWT.EXPIRES_IN;

        return jwt.sign(payload, secret, {
            expiresIn,
            issuer: 'smart-faceit',
            audience: 'smart-faceit-users'
        });
    }

    // Генерация пары токенов
    static generateTokenPair(userId, userRole = 'user') {
        const payload = {
            userId,
            role: userRole,
            timestamp: Date.now()
        };

        const accessToken = this.generateToken(payload, 'access');
        const refreshToken = this.generateToken({ userId }, 'refresh');

        return {
            accessToken,
            refreshToken,
            expiresIn: config.JWT.EXPIRES_IN
        };
    }

    // Верификация токена
    static verifyToken(token, type = 'access') {
        const secret = type === 'refresh' ? config.JWT.REFRESH_SECRET : config.JWT.SECRET;

        try {
            return jwt.verify(token, secret, {
                issuer: 'smart-faceit',
                audience: 'smart-faceit-users'
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('TOKEN_EXPIRED');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('TOKEN_INVALID');
            } else {
                throw new Error('TOKEN_ERROR');
            }
        }
    }

    // Middleware аутентификации - ОСНОВНОЙ МЕТОД
    static authenticate = (req, res, next) => {
        try {
            // Получение токена из заголовка или query параметра
            let token = req.headers.authorization;
            
            if (!token && req.query.token) {
                token = `Bearer ${req.query.token}`;
            }

            if (!token || !token.startsWith('Bearer ')) {
                return res.status(401).json({
                    error: 'Токен доступа не предоставлен',
                    code: 'NO_TOKEN'
                });
            }

            // Извлечение токена
            token = token.slice(7); // Убираем 'Bearer '

            // Верификация токена
            const decoded = AuthMiddleware.verifyToken(token);

            // Проверка на blacklist
            if (AuthMiddleware.#blacklistedTokens.has(token)) {
                return res.status(401).json({
                    error: 'Токен заблокирован',
                    code: 'TOKEN_BLACKLISTED'
                });
            }

            // Добавление данных пользователя в запрос
            req.user = {
                id: decoded.userId,
                role: decoded.role,
                tokenTimestamp: decoded.timestamp
            };

            req.token = token;

            next();
        } catch (error) {
            console.error('Authentication error:', error.message);

            let statusCode = 401;
            let errorCode = 'AUTH_ERROR';
            let errorMessage = 'Ошибка аутентификации';

            switch (error.message) {
                case 'TOKEN_EXPIRED':
                    errorMessage = 'Токен истек';
                    errorCode = 'TOKEN_EXPIRED';
                    break;
                case 'TOKEN_INVALID':
                    errorMessage = 'Недействительный токен';
                    errorCode = 'TOKEN_INVALID';
                    break;
                default:
                    errorMessage = 'Ошибка проверки токена';
            }

            res.status(statusCode).json({
                error: errorMessage,
                code: errorCode
            });
        }
    }

    // Middleware авторизации по ролям
    static authorize(allowedRoles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Пользователь не аутентифицирован',
                    code: 'NOT_AUTHENTICATED'
                });
            }

            const userRole = req.user.role;

            // Если роли не указаны, разрешаем всем аутентифицированным
            if (!allowedRoles || allowedRoles.length === 0) {
                return next();
            }

            // Проверка роли пользователя
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    error: 'Недостаточно прав доступа',
                    code: 'INSUFFICIENT_PERMISSIONS',
                    requiredRoles: allowedRoles,
                    userRole: userRole
                });
            }

            next();
        };
    }

    // Хеширование пароля
    static async hashPassword(password) {
        try {
            const saltRounds = config.ENCRYPTION.PASSWORD_SALT_ROUNDS;
            return await bcrypt.hash(password, saltRounds);
        } catch (error) {
            console.error('Password hashing error:', error);
            throw new Error('Ошибка хеширования пароля');
        }
    }

    // Проверка пароля
    static async verifyPassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            console.error('Password verification error:', error);
            throw new Error('Ошибка проверки пароля');
        }
    }

    // Rate limiting для аутентификации
    static rateLimitAuth() {
        return (req, res, next) => {
            const identifier = req.ip + (req.body.login || req.body.email || '');
            const now = Date.now();
            const windowMs = config.SECURITY.LOCKOUT_TIME;
            const maxAttempts = config.SECURITY.MAX_LOGIN_ATTEMPTS;

            let userAttempts = AuthMiddleware.#loginAttempts.get(identifier) || [];
            
            // Удаляем старые попытки
            userAttempts = userAttempts.filter(time => now - time < windowMs);

            if (userAttempts.length >= maxAttempts) {
                const timeLeft = Math.ceil((windowMs - (now - userAttempts[0])) / 1000);
                return res.status(429).json({
                    error: `Слишком много попыток входа. Попробуйте через ${timeLeft} секунд`,
                    code: 'TOO_MANY_ATTEMPTS',
                    retryAfter: timeLeft
                });
            }

            // Добавляем методы для управления попытками
            req.recordFailedAttempt = () => {
                userAttempts.push(now);
                AuthMiddleware.#loginAttempts.set(identifier, userAttempts);
            };

            req.clearFailedAttempts = () => {
                AuthMiddleware.#loginAttempts.delete(identifier);
            };

            next();
        };
    }

    // Добавление токена в blacklist
    static addToBlacklist(token) {
        this.#blacklistedTokens.add(token);
        
        // Автоматическая очистка через время жизни токена
        setTimeout(() => {
            this.#blacklistedTokens.delete(token);
        }, 24 * 60 * 60 * 1000); // 24 часа
    }

    // Проверка токена в blacklist
    static isTokenBlacklisted(token) {
        return this.#blacklistedTokens.has(token);
    }

    // Обновление токена
    static refreshToken = async (req, res, next) => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    error: 'Refresh token не предоставлен',
                    code: 'NO_REFRESH_TOKEN'
                });
            }

            // Верификация refresh токена
            const decoded = AuthMiddleware.verifyToken(refreshToken, 'refresh');

            // Генерация новой пары токенов
            const newTokens = AuthMiddleware.generateTokenPair(decoded.userId);

            // Добавление старого refresh токена в blacklist
            AuthMiddleware.addToBlacklist(refreshToken);

            res.json({
                success: true,
                ...newTokens
            });
        } catch (error) {
            console.error('Token refresh error:', error);

            let errorMessage = 'Ошибка обновления токена';
            let errorCode = 'REFRESH_ERROR';

            switch (error.message) {
                case 'TOKEN_EXPIRED':
                    errorMessage = 'Refresh token истек';
                    errorCode = 'REFRESH_TOKEN_EXPIRED';
                    break;
                case 'TOKEN_INVALID':
                    errorMessage = 'Недействительный refresh token';
                    errorCode = 'REFRESH_TOKEN_INVALID';
                    break;
            }

            res.status(401).json({
                error: errorMessage,
                code: errorCode
            });
        }
    }

    // Выход из системы
    static logout = (req, res, next) => {
        try {
            const token = req.token;
            const { refreshToken } = req.body;

            // Добавление токенов в blacklist
            if (token) {
                AuthMiddleware.addToBlacklist(token);
            }
            
            if (refreshToken) {
                AuthMiddleware.addToBlacklist(refreshToken);
            }

            res.json({
                success: true,
                message: 'Успешный выход из системы'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                error: 'Ошибка при выходе из системы',
                code: 'LOGOUT_ERROR'
            });
        }
    }
}

module.exports = AuthMiddleware;