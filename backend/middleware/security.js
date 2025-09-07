// Middleware безопасности
const rateLimit = require('express-rate-limit');
const config = require('../config/config');

class SecurityMiddleware {
    // Санитизация входящих данных
    static sanitizeInput(req, res, next) {
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
    }

    // Обнаружение SQL-инъекций
    static detectSQLInjection(req, res, next) {
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
    }

    // Обнаружение XSS атак
    static detectXSS(req, res, next) {
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
    }

    // CSRF защита
    static csrfProtection(req, res, next) {
        // Проверяем CSRF токен для модифицирующих запросов
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            const token = req.headers['x-csrf-token'] || req.body._csrf;
            const sessionToken = req.session?.csrfToken;

            if (!token || !sessionToken || token !== sessionToken) {
                return res.status(403).json({ 
                    error: 'CSRF токен недействителен',
                    code: 'CSRF_INVALID'
                });
            }
        }

        next();
    }

    // Проверка заголовков безопасности
    static validateHeaders(req, res, next) {
        // Проверка User-Agent
        const userAgent = req.headers['user-agent'];
        if (!userAgent || userAgent.length < 10 || userAgent.length > 500) {
            return res.status(400).json({ 
                error: 'Некорректный User-Agent',
                code: 'INVALID_USER_AGENT'
            });
        }

        // Проверка на ботов (базовая)
        const suspiciousBots = [
            /curl/i,
            /wget/i,
            /python/i,
            /php/i,
            /java/i,
            /ruby/i,
            /perl/i
        ];

        if (suspiciousBots.some(pattern => pattern.test(userAgent))) {
            console.warn('Suspicious bot detected:', userAgent);
            return res.status(403).json({ 
                error: 'Доступ запрещен',
                code: 'BOT_DETECTED'
            });
        }

        // Проверка Content-Type для POST/PUT запросов
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const contentType = req.headers['content-type'];
            if (!contentType || !contentType.includes('application/json')) {
                return res.status(400).json({ 
                    error: 'Некорректный Content-Type',
                    code: 'INVALID_CONTENT_TYPE'
                });
            }
        }

        next();
    }

    // Ограничение размера запроса
    static requestSizeLimit(maxSize = 1024 * 1024) { // 1MB по умолчанию
        return (req, res, next) => {
            const contentLength = req.headers['content-length'];
            
            if (contentLength && parseInt(contentLength) > maxSize) {
                return res.status(413).json({ 
                    error: 'Запрос слишком большой',
                    code: 'REQUEST_TOO_LARGE',
                    maxSize: maxSize
                });
            }

            next();
        };
    }

    // Проверка IP адреса
    static ipWhitelist(allowedIPs = []) {
        return (req, res, next) => {
            if (allowedIPs.length === 0) {
                return next(); // Если список пуст, разрешаем всем
            }

            const clientIP = req.ip || req.connection.remoteAddress;
            
            if (!allowedIPs.includes(clientIP)) {
                console.warn('Access denied for IP:', clientIP);
                return res.status(403).json({ 
                    error: 'Доступ запрещен для вашего IP',
                    code: 'IP_BLOCKED'
                });
            }

            next();
        };
    }

    // Блокировка подозрительных IP
    static ipBlacklist(blockedIPs = []) {
        return (req, res, next) => {
            const clientIP = req.ip || req.connection.remoteAddress;
            
            if (blockedIPs.includes(clientIP)) {
                console.warn('Blocked IP attempted access:', clientIP);
                return res.status(403).json({ 
                    error: 'Ваш IP заблокирован',
                    code: 'IP_BLOCKED'
                });
            }

            next();
        };
    }

    // Логирование подозрительной активности
    static logSuspiciousActivity(req, res, next) {
        // Мониторим подозрительные паттерны
        const suspiciousPatterns = [
            /\.\.\//,  // Path traversal
            /etc\/passwd/,
            /proc\/self/,
            /phpinfo/,
            /wp-admin/,
            /admin\.php/,
            /config\.php/
        ];

        const url = req.url.toLowerCase();
        const suspicious = suspiciousPatterns.some(pattern => pattern.test(url));

        if (suspicious) {
            console.warn('Suspicious activity detected:', {
                ip: req.ip,
                url: req.url,
                method: req.method,
                userAgent: req.headers['user-agent'],
                timestamp: new Date().toISOString()
            });

            // В продакшене можно отправлять уведомления
            if (config.NODE_ENV === 'production') {
                // Отправка в систему мониторинга
            }
        }

        next();
    }

    // Middleware для проверки времени запроса
    static requestTimeout(timeout = 30000) { // 30 секунд
        return (req, res, next) => {
            req.setTimeout(timeout, () => {
                res.status(408).json({ 
                    error: 'Время ожидания запроса истекло',
                    code: 'REQUEST_TIMEOUT'
                });
            });

            next();
        };
    }

    // Генерация CSRF токена
    static generateCSRFToken(req, res, next) {
        if (!req.session.csrfToken) {
            req.session.csrfToken = require('crypto').randomBytes(32).toString('hex');
        }
        
        res.locals.csrfToken = req.session.csrfToken;
        next();
    }
}

module.exports = SecurityMiddleware;