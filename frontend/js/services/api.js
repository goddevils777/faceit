// API сервис для работы с бэкендом
class ApiService {
    constructor() {
        this.baseUrl = CONFIG.API.BASE_URL;
        this.token = localStorage.getItem(CONFIG.SECURITY.TOKEN_KEY);
    }

    // Базовый метод для HTTP запросов
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Добавление токена авторизации
        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        // Безопасность - санитизация данных
        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(this.sanitizeData(config.body));
        }

        try {
            const response = await fetch(url, config);
            
            // Проверка статуса ответа
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error(`API Error: ${error.message}`);
            throw error;
        }
    }

    // GET запрос
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST запрос
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: data
        });
    }

    // PUT запрос
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data
        });
    }

    // DELETE запрос
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Установка токена
    setToken(token) {
        this.token = token;
        localStorage.setItem(CONFIG.SECURITY.TOKEN_KEY, token);
    }

    // Удаление токена
    removeToken() {
        this.token = null;
        localStorage.removeItem(CONFIG.SECURITY.TOKEN_KEY);
    }

    // Санитизация данных от XSS
    sanitizeData(data) {
        if (typeof data === 'string') {
            return data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }
        
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                sanitized[key] = this.sanitizeData(value);
            }
            return sanitized;
        }
        
        return data;
    }
}

// Глобальный экземпляр API сервиса
window.apiService = new ApiService();