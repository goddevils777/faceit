// Middleware валидации
const Joi = require('joi');
const config = require('../config/config');

class ValidationMiddleware {
    // Схемы валидации
    static schemas = {
        // Регистрация пользователя
        register: Joi.object({
            username: Joi.string()
                .min(config.VALIDATION.USERNAME.MIN_LENGTH)
                .max(config.VALIDATION.USERNAME.MAX_LENGTH)
                .pattern(config.VALIDATION.USERNAME.PATTERN)
                .required()
                .messages({
                    'string.min': `Имя пользователя должно содержать минимум ${config.VALIDATION.USERNAME.MIN_LENGTH} символа`,
                    'string.max': `Имя пользователя не должно превышать ${config.VALIDATION.USERNAME.MAX_LENGTH} символов`,
                    'string.pattern.base': 'Имя пользователя может содержать только буквы, цифры, _ и -',
                    'any.required': 'Имя пользователя обязательно для заполнения'
                }),

            email: Joi.string()
                .email()
                .required()
                .messages({
                    'string.email': 'Введите корректный email адрес',
                    'any.required': 'Email обязателен для заполнения'
                }),

            password: Joi.string()
                .min(config.SECURITY.PASSWORD_MIN_LENGTH)
                .max(config.SECURITY.PASSWORD_MAX_LENGTH)
                .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
                .required()
                .messages({
                    'string.min': `Пароль должен содержать минимум ${config.SECURITY.PASSWORD_MIN_LENGTH} символов`,
                    'string.max': `Пароль не должен превышать ${config.SECURITY.PASSWORD_MAX_LENGTH} символов`,
                    'string.pattern.base': 'Пароль должен содержать буквы верхнего и нижнего регистра, а также цифры',
                    'any.required': 'Пароль обязателен для заполнения'
                }),

            region: Joi.string()
                .valid(...config.GAME.REGIONS)
                .required()
                .messages({
                    'any.only': 'Выберите корректный регион',
                    'any.required': 'Регион обязателен для выбора'
                })
        }),

        // Вход пользователя
        login: Joi.object({
            login: Joi.string()
                .required()
                .messages({
                    'any.required': 'Email или имя пользователя обязательны для заполнения'
                }),

            password: Joi.string()
                .required()
                .messages({
                    'any.required': 'Пароль обязателен для заполнения'
                }),

            remember: Joi.boolean().optional()
        }),

        // Обновление профиля
        updateProfile: Joi.object({
            username: Joi.string()
                .min(config.VALIDATION.USERNAME.MIN_LENGTH)
                .max(config.VALIDATION.USERNAME.MAX_LENGTH)
                .pattern(config.VALIDATION.USERNAME.PATTERN)
                .optional()
                .messages({
                    'string.min': `Имя пользователя должно содержать минимум ${config.VALIDATION.USERNAME.MIN_LENGTH} символа`,
                    'string.max': `Имя пользователя не должно превышать ${config.VALIDATION.USERNAME.MAX_LENGTH} символов`,
                    'string.pattern.base': 'Имя пользователя может содержать только буквы, цифры, _ и -'
                }),

            email: Joi.string()
                .email()
                .optional()
                .messages({
                    'string.email': 'Введите корректный email адрес'
                }),

            region: Joi.string()
                .valid(...config.GAME.REGIONS)
                .optional()
                .messages({
                    'any.only': 'Выберите корректный регион'
                }),

            avatar: Joi.string()
                .uri()
                .optional()
                .messages({
                    'string.uri': 'Некорректная ссылка на аватар'
                })
        }),

        // Смена пароля
        changePassword: Joi.object({
            currentPassword: Joi.string()
                .required()
                .messages({
                    'any.required': 'Введите текущий пароль'
                }),

            newPassword: Joi.string()
                .min(config.SECURITY.PASSWORD_MIN_LENGTH)
                .max(config.SECURITY.PASSWORD_MAX_LENGTH)
                .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
                .required()
                .messages({
                    'string.min': `Новый пароль должен содержать минимум ${config.SECURITY.PASSWORD_MIN_LENGTH} символов`,
                    'string.max': `Новый пароль не должен превышать ${config.SECURITY.PASSWORD_MAX_LENGTH} символов`,
                    'string.pattern.base': 'Новый пароль должен содержать буквы верхнего и нижнего регистра, а также цифры',
                    'any.required': 'Новый пароль обязателен для заполнения'
                }),

            confirmPassword: Joi.string()
                .valid(Joi.ref('newPassword'))
                .required()
                .messages({
                    'any.only': 'Пароли не совпадают',
                    'any.required': 'Подтвердите новый пароль'
                })
        }),

        // Создание игры
        createGame: Joi.object({
            map: Joi.string()
                .valid(...config.GAME.MAPS)
                .required()
                .messages({
                    'any.only': 'Выберите корректную карту',
                    'any.required': 'Карта обязательна для выбора'
                }),

            gameMode: Joi.string()
                .valid(...config.GAME.GAME_MODES)
                .required()
                .messages({
                    'any.only': 'Выберите корректный режим игры',
                    'any.required': 'Режим игры обязателен для выбора'
                }),

            region: Joi.string()
                .valid(...config.GAME.REGIONS)
                .required()
                .messages({
                    'any.only': 'Выберите корректный регион',
                    'any.required': 'Регион обязателен для выбора'
                }),

            maxPlayers: Joi.number()
                .integer()
                .min(config.GAME.MIN_PLAYERS_PER_MATCH)
                .max(config.GAME.MAX_PLAYERS_PER_MATCH)
                .required()
                .messages({
                    'number.min': `Минимальное количество игроков: ${config.GAME.MIN_PLAYERS_PER_MATCH}`,
                    'number.max': `Максимальное количество игроков: ${config.GAME.MAX_PLAYERS_PER_MATCH}`,
                    'any.required': 'Количество игроков обязательно для указания'
                }),

            password: Joi.string()
                .min(4)
                .max(20)
                .optional()
                .allow('')
                .messages({
                    'string.min': 'Пароль игры должен содержать минимум 4 символа',
                    'string.max': 'Пароль игры не должен превышать 20 символов'
                })
        }),

        // Присоединение к игре
        joinGame: Joi.object({
            gameId: Joi.string()
                .uuid()
                .required()
                .messages({
                    'string.uuid': 'Некорректный ID игры',
                    'any.required': 'ID игры обязателен'
                }),

            password: Joi.string()
                .optional()
                .allow('')
        }),

        // Отчет о матче
        matchReport: Joi.object({
            gameId: Joi.string()
                .uuid()
                .required()
                .messages({
                    'string.uuid': 'Некорректный ID игры',
                    'any.required': 'ID игры обязателен'
                }),

            result: Joi.string()
                .valid('win', 'loss', 'draw')
                .required()
                .messages({
                    'any.only': 'Результат должен быть: win, loss или draw',
                    'any.required': 'Результат игры обязателен'
                }),

            score: Joi.object({
                team1: Joi.number().integer().min(0).max(30).required(),
                team2: Joi.number().integer().min(0).max(30).required()
            }).required(),

            duration: Joi.number()
                .integer()
                .min(60000) // минимум 1 минута
                .max(config.GAME.MATCH_DURATION * 2) // максимум в 2 раза больше обычной длительности
                .required()
                .messages({
                    'number.min': 'Слишком короткий матч',
                    'number.max': 'Слишком длинный матч',
                    'any.required': 'Длительность матча обязательна'
                }),

            screenshot: Joi.string()
                .uri()
                .optional()
                .messages({
                    'string.uri': 'Некорректная ссылка на скриншот'
                })
        }),

        // Поиск игроков
        searchPlayers: Joi.object({
            username: Joi.string()
                .min(1)
                .max(50)
                .optional(),

            region: Joi.string()
                .valid(...config.GAME.REGIONS)
                .optional(),

            minElo: Joi.number()
                .integer()
                .min(config.ELO.MIN_ELO)
                .max(config.ELO.MAX_ELO)
                .optional(),

            maxElo: Joi.number()
                .integer()
                .min(config.ELO.MIN_ELO)
                .max(config.ELO.MAX_ELO)
                .optional(),

            page: Joi.number()
                .integer()
                .min(1)
                .max(1000)
                .default(1),

            limit: Joi.number()
                .integer()
                .min(1)
                .max(100)
                .default(20)
        }),

        // Параметры для получения ID
        idParam: Joi.object({
            id: Joi.string()
                .uuid()
                .required()
                .messages({
                    'string.uuid': 'Некорректный формат ID',
                    'any.required': 'ID обязателен'
                })
        })
    };

    // Основная функция валидации
    static validate(schema) {
        return (req, res, next) => {
            try {
                // Определяем какие данные валидировать
                let dataToValidate = {};

                if (req.body && Object.keys(req.body).length > 0) {
                    dataToValidate = { ...dataToValidate, ...req.body };
                }

                if (req.params && Object.keys(req.params).length > 0) {
                    dataToValidate = { ...dataToValidate, ...req.params };
                }

                if (req.query && Object.keys(req.query).length > 0) {
                    dataToValidate = { ...dataToValidate, ...req.query };
                }

                // Выполняем валидацию
                const { error, value } = schema.validate(dataToValidate, {
                    abortEarly: false, // Показываем все ошибки
                    stripUnknown: true, // Удаляем неизвестные поля
                    convert: true // Автоматическое преобразование типов
                });

                if (error) {
                    console.log('=== VALIDATION ERROR ===');
                    console.log('Error details:', error.details);

                    const errors = error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message,
                        value: detail.context?.value
                    }));

                    console.log('Formatted errors:', errors);

                    return res.status(400).json({
                        error: 'Ошибка валидации данных',
                        details: errors,
                        code: 'VALIDATION_ERROR'
                    });
                }

                // Обновляем данные запроса валидированными значениями
                if (req.body) {
                    Object.keys(req.body).forEach(key => {
                        if (value.hasOwnProperty(key)) {
                            req.body[key] = value[key];
                        }
                    });
                }

                if (req.params) {
                    Object.keys(req.params).forEach(key => {
                        if (value.hasOwnProperty(key)) {
                            req.params[key] = value[key];
                        }
                    });
                }

                if (req.query) {
                    Object.keys(req.query).forEach(key => {
                        if (value.hasOwnProperty(key)) {
                            req.query[key] = value[key];
                        }
                    });
                }

                next();
            } catch (validationError) {
                console.error('Validation middleware error:', validationError);
                res.status(500).json({
                    error: 'Внутренняя ошибка валидации',
                    code: 'VALIDATION_INTERNAL_ERROR'
                });
            }
        };
    }

    // Специфичные валидаторы
    static validateRegister = this.validate(this.schemas.register);
    static validateLogin = this.validate(this.schemas.login);
    static validateUpdateProfile = this.validate(this.schemas.updateProfile);
    static validateChangePassword = this.validate(this.schemas.changePassword);
    static validateCreateGame = this.validate(this.schemas.createGame);
    static validateJoinGame = this.validate(this.schemas.joinGame);
    static validateMatchReport = this.validate(this.schemas.matchReport);
    static validateSearchPlayers = this.validate(this.schemas.searchPlayers);
    static validateIdParam = this.validate(this.schemas.idParam);

    // Кастомные валидаторы
    static validateFileUpload(allowedTypes, maxSize) {
        return (req, res, next) => {
            if (!req.file) {
                return res.status(400).json({
                    error: 'Файл не загружен',
                    code: 'FILE_REQUIRED'
                });
            }

            // Проверка типа файла
            if (!allowedTypes.includes(req.file.mimetype)) {
                return res.status(400).json({
                    error: `Разрешенные типы файлов: ${allowedTypes.join(', ')}`,
                    code: 'INVALID_FILE_TYPE'
                });
            }

            // Проверка размера файла
            if (req.file.size > maxSize) {
                const maxSizeMB = Math.round(maxSize / (1024 * 1024));
                return res.status(400).json({
                    error: `Максимальный размер файла: ${maxSizeMB}MB`,
                    code: 'FILE_TOO_LARGE'
                });
            }

            next();
        };
    }

    // Валидация даты
    static validateDateRange(startField = 'startDate', endField = 'endDate') {
        return (req, res, next) => {
            const startDate = new Date(req.query[startField] || req.body[startField]);
            const endDate = new Date(req.query[endField] || req.body[endField]);

            if (startDate && endDate && startDate >= endDate) {
                return res.status(400).json({
                    error: 'Дата начала должна быть меньше даты окончания',
                    code: 'INVALID_DATE_RANGE'
                });
            }

            next();
        };
    }

    // Валидация ELO диапазона
    static validateEloRange(req, res, next) {
        const { minElo, maxElo } = req.query;

        if (minElo && maxElo && parseInt(minElo) > parseInt(maxElo)) {
            return res.status(400).json({
                error: 'Минимальное ELO не может быть больше максимального',
                code: 'INVALID_ELO_RANGE'
            });
        }

        next();
    }

    // Создание динамической схемы валидации
    static createDynamicSchema(fields) {
        const schemaObject = {};

        for (const [fieldName, fieldSchema] of Object.entries(fields)) {
            schemaObject[fieldName] = fieldSchema;
        }

        return Joi.object(schemaObject);
    }
}

module.exports = ValidationMiddleware;