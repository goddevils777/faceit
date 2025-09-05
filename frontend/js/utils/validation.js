// Утилиты для валидации данных
class ValidationUtils {
    // Валидация email
    static validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { valid: false, error: 'Email обязателен для заполнения' };
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return { valid: false, error: 'Введите корректный email адрес' };
        }
        
        return { valid: true };
    }

    // Валидация имени пользователя
    static validateUsername(username) {
        if (!username || typeof username !== 'string') {
            return { valid: false, error: 'Имя пользователя обязательно для заполнения' };
        }

        const trimmed = username.trim();
        
        if (trimmed.length < CONFIG.VALIDATION.USERNAME.min) {
            return { 
                valid: false, 
                error: `Имя пользователя должно содержать минимум ${CONFIG.VALIDATION.USERNAME.min} символа` 
            };
        }
        
        if (trimmed.length > CONFIG.VALIDATION.USERNAME.max) {
            return { 
                valid: false, 
                error: `Имя пользователя не должно превышать ${CONFIG.VALIDATION.USERNAME.max} символов` 
            };
        }

        // Проверка на запрещенные символы
        const allowedChars = /^[a-zA-Z0-9_-]+$/;
        if (!allowedChars.test(trimmed)) {
            return { 
                valid: false, 
                error: 'Имя пользователя может содержать только буквы, цифры, _ и -' 
            };
        }

        // Проверка на запрещенные слова
        const forbiddenWords = ['admin', 'root', 'system', 'faceit', 'smart'];
        if (forbiddenWords.some(word => trimmed.toLowerCase().includes(word))) {
            return { valid: false, error: 'Имя пользователя содержит запрещенные слова' };
        }

        return { valid: true };
    }

    // Валидация пароля
    static validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return { valid: false, error: 'Пароль обязателен для заполнения' };
        }

        if (password.length < CONFIG.VALIDATION.PASSWORD.min) {
            return { 
                valid: false, 
                error: `Пароль должен содержать минимум ${CONFIG.VALIDATION.PASSWORD.min} символов` 
            };
        }

        // Проверка на сложность пароля
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

        if (strength < 2) {
            return { 
                valid: false, 
                error: 'Пароль должен содержать буквы разного регистра, цифры или специальные символы' 
            };
        }

        return { valid: true, strength };
    }

    // Валидация региона
    static validateRegion(region) {
        if (!region || typeof region !== 'string') {
            return { valid: false, error: 'Выберите регион' };
        }

        if (!CONFIG.GAME.REGIONS.includes(region)) {
            return { valid: false, error: 'Выбран некорректный регион' };
        }

        return { valid: true };
    }

    // Валидация формы регистрации
    static validateRegistrationForm(formData) {
        const errors = [];

        const usernameValidation = this.validateUsername(formData.username);
        if (!usernameValidation.valid) {
            errors.push(usernameValidation.error);
        }

        const emailValidation = this.validateEmail(formData.email);
        if (!emailValidation.valid) {
            errors.push(emailValidation.error);
        }

        const passwordValidation = this.validatePassword(formData.password);
        if (!passwordValidation.valid) {
            errors.push(passwordValidation.error);
        }

        const regionValidation = this.validateRegion(formData.region);
        if (!regionValidation.valid) {
            errors.push(regionValidation.error);
        }

        return {
            valid: errors.length === 0,
            errors,
            passwordStrength: passwordValidation.strength || 0
        };
    }

    // Валидация формы входа
    static validateLoginForm(formData) {
        const errors = [];

        if (!formData.login || !formData.login.trim()) {
            errors.push('Email или имя пользователя обязательны для заполнения');
        }

        if (!formData.password) {
            errors.push('Пароль обязателен для заполнения');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Валидация файлов
    static validateFile(file, allowedTypes = [], maxSize = 5 * 1024 * 1024) {
        if (!file) {
            return { valid: false, error: 'Файл не выбран' };
        }

        // Проверка типа файла
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            return { 
                valid: false, 
                error: `Разрешены только файлы: ${allowedTypes.join(', ')}` 
            };
        }

        // Проверка размера файла
        if (file.size > maxSize) {
            const maxSizeMB = Math.round(maxSize / (1024 * 1024));
            return { 
                valid: false, 
                error: `Размер файла не должен превышать ${maxSizeMB}MB` 
            };
        }

        return { valid: true };
    }

    // Очистка строки от потенциально опасных символов
    static sanitizeString(str) {
        if (typeof str !== 'string') return '';
        
        return str
            .trim()
            .replace(/[<>'"]/g, '') // Удаление потенциально опасных символов
            .substring(0, 1000); // Ограничение длины
    }

    // Проверка на SQL инъекции
    static checkSQLInjection(input) {
        if (typeof input !== 'string') return false;
        
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b)/i,
            /(UNION|OR|AND)\s+\d+\s*=\s*\d+/i,
            /['";][\s\S]*--/,
            /\/\*[\s\S]*\*\//
        ];

        return sqlPatterns.some(pattern => pattern.test(input));
    }

    // Проверка на XSS
    static checkXSS(input) {
        if (typeof input !== 'string') return false;
        
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i
        ];

        return xssPatterns.some(pattern => pattern.test(input));
    }
}

// Экспорт утилит
window.ValidationUtils = ValidationUtils;