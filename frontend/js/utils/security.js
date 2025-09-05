// Утилиты безопасности
class SecurityUtils {
    // Генерация случайной строки
    static generateRandomString(length = 16) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        // Используем криптографически стойкий генератор
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        
        for (let i = 0; i < length; i++) {
            result += chars[array[i] % chars.length];
        }
        
        return result;
    }

    // Хеширование данных SHA-256
    static async hashData(data, salt = '') {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data + salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Хеширование пароля с солью
    static async hashPassword(password) {
        const salt = this.generateRandomString(16);
        const hash = await this.hashData(password, salt);
        return `${salt}:${hash}`;
    }

    // Проверка пароля
    static async verifyPassword(password, hashedPassword) {
        try {
            const [salt, hash] = hashedPassword.split(':');
            const newHash = await this.hashData(password, salt);
            return newHash === hash;
        } catch (error) {
            return false;
        }
    }

    // Шифрование данных (простое AES-GCM)
    static async encryptData(data, password) {
        try {
            const encoder = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                'PBKDF2',
                false,
                ['deriveBits', 'deriveKey']
            );

            const salt = crypto.getRandomValues(new Uint8Array(16));
            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );

            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encodedData = encoder.encode(data);
            
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encodedData
            );

            // Объединяем соль, IV и зашифрованные данные
            const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
            result.set(salt, 0);
            result.set(iv, salt.length);
            result.set(new Uint8Array(encrypted), salt.length + iv.length);

            return btoa(String.fromCharCode(...result));
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    }

    // Расшифровка данных
    static async decryptData(encryptedData, password) {
        try {
            const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
            
            const salt = data.slice(0, 16);
            const iv = data.slice(16, 28);
            const encrypted = data.slice(28);

            const encoder = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                'PBKDF2',
                false,
                ['deriveBits', 'deriveKey']
            );

            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encrypted
            );

            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }

    // Безопасное хранение в localStorage
    static secureSetItem(key, value, password = null) {
        try {
            const data = JSON.stringify(value);
            
            if (password) {
                // Шифруем данные
                this.encryptData(data, password).then(encrypted => {
                    if (encrypted) {
                        localStorage.setItem(key, encrypted);
                    }
                });
            } else {
                localStorage.setItem(key, data);
            }
            
            return true;
        } catch (error) {
            console.error('Secure storage error:', error);
            return false;
        }
    }

    // Безопасное получение из localStorage
    static async secureGetItem(key, password = null) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return null;

            if (password) {
                // Расшифровываем данные
                const decrypted = await this.decryptData(data, password);
                return decrypted ? JSON.parse(decrypted) : null;
            } else {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Secure retrieval error:', error);
            return null;
        }
    }

    // Проверка силы пароля
    static getPasswordStrength(password) {
        if (!password) return 0;

        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            longLength: password.length >= 12
        };

        // Подсчет баллов
        Object.values(checks).forEach(check => {
            if (check) score += 1;
        });

        // Дополнительные проверки
        if (password.length >= 16) score += 1;
        if (!/(.)\1{2,}/.test(password)) score += 1; // Нет повторяющихся символов

        return Math.min(score, 5); // Максимум 5 баллов
    }

    // Защита от CSRF
    static generateCSRFToken() {
        const token = this.generateRandomString(32);
        sessionStorage.setItem('csrf_token', token);
        return token;
    }

    // Проверка CSRF токена
    static verifyCSRFToken(token) {
        const storedToken = sessionStorage.getItem('csrf_token');
        return storedToken && storedToken === token;
    }

    // Проверка безопасности URL
    static isValidURL(url) {
        try {
            const urlObj = new URL(url);
            
            // Разрешаем только HTTPS (кроме localhost для разработки)
            if (urlObj.protocol !== 'https:' && !urlObj.hostname.includes('localhost')) {
                return false;
            }

            // Блокируем подозрительные домены
            const blockedDomains = ['bit.ly', 'tinyurl.com', 'short.link'];
            if (blockedDomains.some(domain => urlObj.hostname.includes(domain))) {
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    // Очистка HTML от опасных тегов
    static sanitizeHTML(html) {
        if (typeof html !== 'string') return '';

        // Разрешенные теги
        const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'span'];
        
        // Удаляем все теги, кроме разрешенных
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/<(?!\/?(?:b|i|em|strong|p|br|span)\b)[^>]*>/gi, '');
    }

    // Ограничение частоты запросов (Rate Limiting)
    static createRateLimiter(maxRequests = 10, timeWindow = 60000) {
        const requests = new Map();

        return function(identifier) {
            const now = Date.now();
            const userRequests = requests.get(identifier) || [];
            
            // Удаляем старые запросы
            const validRequests = userRequests.filter(time => now - time < timeWindow);
            
            if (validRequests.length >= maxRequests) {
                return false; // Превышен лимит
            }
            
            validRequests.push(now);
            requests.set(identifier, validRequests);
            
            return true; // Запрос разрешен
        };
    }

    // Защита от Clickjacking
    static preventClickjacking() {
        if (window.top !== window.self) {
            // Если страница загружена в iframe
            document.body.style.display = 'none';
            throw new Error('Clickjacking attempt detected');
        }
    }

    // Генерация безопасного ID сессии
    static generateSessionId() {
        const timestamp = Date.now().toString(36);
        const randomPart = this.generateRandomString(16);
        return `${timestamp}_${randomPart}`;
    }

    // Проверка целостности данных
    static async verifyDataIntegrity(data, signature, publicKey) {
        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);
            const signatureBuffer = new Uint8Array(atob(signature).split('').map(c => c.charCodeAt(0)));

            const result = await crypto.subtle.verify(
                'RSASSA-PKCS1-v1_5',
                publicKey,
                signatureBuffer,
                dataBuffer
            );

            return result;
        } catch (error) {
            console.error('Data integrity verification failed:', error);
            return false;
        }
    }
}

// Инициализация защиты при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Защита от Clickjacking
    SecurityUtils.preventClickjacking();
    
    // Генерация CSRF токена
    SecurityUtils.generateCSRFToken();
});

// Экспорт утилит
window.SecurityUtils = SecurityUtils;