// Middleware безопасности
const rateLimit = require('express-rate-limit');
const config = require('../config/config');

// Санитизация входящих данных
const sanitizeInput = (req, res, next) => {
    try {
        // Рекурсивная функция для очистки объектов
        const sanitizeObject = (obj) => {
            if (typeof obj === 'string') {
                return obj
                    .trim()
                    .replace(/[<>]/g, '') // Удаление потенциально опасных символов
                    .substring(0, 10000); // Ограничение длины
            }
            
            if (Array.isArray(obj)) {
                return obj.map(item => sanitizeObject(item));
            }
            
            if (typeof obj === 'object' && obj !== null) {
                const sanitized = {};
                for (const [key, value] of Object.entries(obj)) {
                    // Санитизация ключей
                    const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '');
                    if (cleanKey && cleanKey.length <= 50) {
                        sanitized[cleanKey] = sanitizeObject(value);
                    }
                }
                return sanitized;
            }
            
            return obj;
        };

        // Применение санитизации к телу запроса
        if (req.body) {
            req.body = sanitizeObject(req.body);
        }

        // Применение санитизации к query параметрам
        if (req.query) {
            req.query = sanitizeObject(req.query);
        }

        // Применение санитизации к параметрам маршрута
        if (req.params) {
            req.params = sanitizeObject(req.params);
        }

        next();
    } catch (error) {
        console.error('Sanitization error:', error);
        res.status(400).json({ error: 'Некорректные данные запроса' });
    }
};

// Обнаружение SQL-инъекций
const detectSQLInjection = (req, res, next) => {
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
        /(UNION[\s\w]*SELECT)/i,
        /(OR|AND)\s+\d+\s*=\s*\d+/i,
        /['";][\s\S]*--/,
        /\/\*[\s\S]*\*\//,
        /(\bor\b|\band\b)\s+['"]\w+['"]?\s*=\s*['"]\w+['"]?/i,
        /0x[0-9A-Fa-f]+/,
        /\b(waitfor|delay)\b/i,
        /\b(sp_|xp_)\w+/i
    ];

    const checkForSQLInjection = (obj, path = '') => {
        if (typeof obj === 'string') {
            for (const pattern of sqlPatterns) {
                if (pattern.test(obj)) {
                    console.warn(`SQL Injection attempt detected at ${path}:`, obj);
                    return true;
                }
            }
        } else if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                if (checkForSQLInjection(value, `${path}.${key}`)) {
                    return true;
                }
            }
        }
        return false;
    };

    // Проверка всех входящих данных
    const dataToCheck = [
        { data: req.body, name: 'body' },
        { data: req.query, name: 'query' },
        { data: req.params, name: 'params' }
    ];

    for (const { data, name } of dataToCheck) {
        if (data && checkForSQLInjection(data, name)) {
            return res.status(400).json({ 
                error: 'Обнаружена подозрительная активность',
                code: 'SECURITY_VIOLATION'
            });
        }
    }

    next();
};

// Обнаружение XSS атак
const detectXSS = (req, res, next) => {
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /<link/i,
        /<meta/i,
        /expression\s*\(/i,
        /vbscript:/i,
        /<img[^>]+src[^>]*>/i,
        /eval\s*\(/i,
        /document\.(write|writeln|cookie)/i
    ];

    const checkForXSS = (obj, path = '') => {
        if (typeof obj === 'string') {
            for (const pattern of xssPatterns) {
                if (pattern.test(obj)) {
                    console.warn(`XSS attempt detected at ${path}:`, obj);
                    return true;
                }
            }
        } else if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                if (checkForXSS(value, `${path}.${key}`)) {
                    return true;
                }
            }
        }
        return false;
    };

    // Проверка всех входящих данных
    const dataToCheck = [
        { data: req.body, name: 'body' },
        { data: req.query, name: 'query' },
        { data: req.params, name: 'params' }
    ];

    for (const { data, name } of dataToCheck) {
        if (data && checkForXSS(data, name)) {
            return res.status(400).json({ 
                error: 'Обнаружена попытка XSS атаки',
                code: 'XSS_DETECTED'
            });
        }
    }

    next();
};

module.exports = {
    sanitizeInput,
    detectSQLInjection,
    detectXSS
};