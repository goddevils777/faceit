// Маршруты аутентификации
const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');
const User = require('../models/User');

// Регистрация пользователя
router.post('/register', 
    ValidationMiddleware.validateRegister,
    AuthMiddleware.rateLimitAuth(),
    async (req, res) => {
        console.log('=== REGISTRATION ATTEMPT ===');
        console.log('Request body:', req.body);
        
        try {
            const { username, email, password, region } = req.body;
            console.log('Extracted data:', { username, email, region, passwordLength: password?.length });

            // Проверка на существующего пользователя
            const existingUser = await User.findOne({
                where: {
                    [require('sequelize').Op.or]: [
                        { username },
                        { email }
                    ]
                }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: existingUser.username === username ? 
                        'Пользователь с таким именем уже существует' : 
                        'Пользователь с таким email уже существует',
                    code: 'USER_EXISTS'
                });
            }

            // Создание пользователя в БД
            const newUser = await User.create({
                username,
                email,
                password,
                region
            });

            console.log('User created successfully:', newUser.id);

            // Генерация токенов
            const tokens = AuthMiddleware.generateTokenPair(newUser.id, newUser.role);

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
            const { login, password } = req.body;

            // Поиск пользователя по email или username
            const user = await User.findOne({
                where: {
                    [require('sequelize').Op.or]: [
                        { username: login },
                        { email: login }
                    ]
                }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Неверные данные входа',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Проверка пароля БЕЗ дополнительного хеширования
            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: 'Неверные данные входа',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Генерация токенов
            const tokens = AuthMiddleware.generateTokenPair(user.id, user.role);

            if (req.clearFailedAttempts) {
                req.clearFailedAttempts();
            }

            res.json({
                success: true,
                message: 'Вход выполнен успешно',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    region: user.region,
                    elo: user.elo,
                    level: user.level
                },
                ...tokens
            });

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

// Валидация токена
// Валидация токена
router.get('/validate', AuthMiddleware.authenticate, async (req, res) => {
    try {
        // Ищем пользователя в БД
        const user = await User.findByPk(req.user.userId);
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                valid: false,
                error: 'Пользователь не найден'
            });
        }

        res.json({
            valid: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                region: user.region,
                elo: user.elo,
                level: user.level
            }
        });

    } catch (error) {
        console.error('Token validation error:', error);
        res.status(500).json({
            valid: false,
            error: 'Ошибка валидации токена'
        });
    }
});

module.exports = router;