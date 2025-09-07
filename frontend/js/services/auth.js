// Сервис авторизации
class AuthService {
    constructor() {
        this.user = null;
        this.token = localStorage.getItem(CONFIG.SECURITY.TOKEN_KEY);
        this.init();
    }

    // Инициализация сервиса
    init() {
        // Проверка токена при загрузке
        if (this.token) {
            this.validateToken();
        }
    }

   // Регистрация пользователя
// Регистрация пользователя
async register(userData) {
    try {
        // Валидация данных
        const validation = this.validateRegistrationData(userData);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        // НЕ хешируем пароль на фронте - отправляем как есть
        const registerData = {
            username: userData.username.trim(),
            email: userData.email.trim().toLowerCase(),
            password: userData.password, // Отправляем оригинальный пароль
            region: userData.region
        };

        console.log('Sending registration data:', registerData);
        const response = await apiService.post('/auth/register', registerData);
        console.log('Registration response:', response);

        if (response.success) {
            this.setAuthData(response.accessToken || response.token, response.user);
            return { success: true, user: response.user };
        }

        throw new Error(response.error || response.message || 'Ошибка регистрации');
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

// Авторизация пользователя  
async login(credentials) {
    try {
        // Валидация данных
        if (!credentials.login || !credentials.password) {
            throw new Error('Все поля обязательны для заполнения');
        }

        // Хеширование пароля
        const hashedPassword = await this.hashPassword(credentials.password);

        const loginData = {
            login: credentials.login.trim(),
            password: hashedPassword
        };

        const response = await apiService.post('/auth/login', loginData);

        if (response.success) {
            this.setAuthData(response.accessToken || response.token, response.user);
            return { success: true, user: response.user };
        }

        throw new Error(response.error || response.message || 'Неверные данные входа');
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

    // Выход из системы
    logout() {
        this.user = null;
        this.token = null;
        apiService.removeToken();
        localStorage.removeItem('user_data');
        router.navigate('/');
    }

    // Проверка авторизации
isAuthenticated() {
    return !!this.token && !!this.user;
}

    // Получение текущего пользователя
    getCurrentUser() {
        return this.user;
    }

    // Валидация токена
    async validateToken() {
        try {
            if (!this.token) return false;

            const response = await apiService.get('/auth/validate');
            if (response.valid) {
                this.user = response.user;
                return true;
            }
            
            this.logout();
            return false;
        } catch (error) {
            this.logout();
            return false;
        }
    }

    // Установка данных авторизации
    setAuthData(token, user) {
        this.token = token;
        this.user = user;
        apiService.setToken(token);
        localStorage.setItem('user_data', JSON.stringify(user));
    }

    // Валидация данных регистрации
    validateRegistrationData(data) {
        const errors = [];

        // Проверка имени пользователя
        if (!data.username || data.username.length < CONFIG.VALIDATION.USERNAME.min) {
            errors.push(`Имя пользователя должно содержать минимум ${CONFIG.VALIDATION.USERNAME.min} символа`);
        }
        if (data.username && data.username.length > CONFIG.VALIDATION.USERNAME.max) {
            errors.push(`Имя пользователя не должно превышать ${CONFIG.VALIDATION.USERNAME.max} символов`);
        }

        // Проверка email
        if (!data.email || !CONFIG.VALIDATION.EMAIL.test(data.email)) {
            errors.push('Введите корректный email адрес');
        }

        // Проверка пароля
        if (!data.password || data.password.length < CONFIG.VALIDATION.PASSWORD.min) {
            errors.push(`Пароль должен содержать минимум ${CONFIG.VALIDATION.PASSWORD.min} символов`);
        }

        // Проверка региона
        if (!data.region || !CONFIG.GAME.REGIONS.includes(data.region)) {
            errors.push('Выберите корректный регион');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Простое хеширование пароля (в реальном проекте использовать bcrypt)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'smart_faceit_salt');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    
}

// Глобальный экземпляр сервиса авторизации
window.AuthService = new AuthService();