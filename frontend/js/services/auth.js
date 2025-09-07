// Сервис авторизации
class AuthService {
    constructor() {
        this.user = null;
        this.token = localStorage.getItem(CONFIG.SECURITY.TOKEN_KEY);
    }

    // Инициализация сервиса
async init() {
    if (this.token) {
        try {
            const userData = localStorage.getItem('user_data');
            if (userData) {
                this.user = JSON.parse(userData); // Вот тут устанавливается user
            }
            apiService.setToken(this.token);
        } catch (error) {
            console.error('Auth init error:', error);
        }
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
    // Авторизация пользователя  
    async login(credentials) {
        try {
            // Валидация данных
            if (!credentials.login || !credentials.password) {
                throw new Error('Все поля обязательны для заполнения');
            }

            // НЕ хешируем пароль - отправляем как есть
            const loginData = {
                login: credentials.login.trim(),
                password: credentials.password // Отправляем оригинальный пароль
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
// Выход из системы
logout() {
    this.user = null;
    this.token = null;
    apiService.removeToken();
    localStorage.removeItem(CONFIG.SECURITY.TOKEN_KEY);
    localStorage.removeItem('user_data');
    
    // Проверяем, что router существует перед использованием
    if (window.router) {
        window.router.navigate('/');
    }
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
        
        // Токен невалидный - тихо очищаем данные без редиректа
        this.user = null;
        this.token = null;
        apiService.removeToken();
        localStorage.removeItem(CONFIG.SECURITY.TOKEN_KEY);
        localStorage.removeItem('user_data');
        return false;
        
    } catch (error) {
        console.log('Token validation failed:', error.message);
        // Токен невалидный - тихо очищаем данные
        this.user = null;
        this.token = null;
        apiService.removeToken();
        localStorage.removeItem(CONFIG.SECURITY.TOKEN_KEY);
        localStorage.removeItem('user_data');
        return false;
    }
}

    // Установка данных авторизации
// Установка данных авторизации
setAuthData(token, user) {
    console.log('Setting auth data:', { token: token?.substring(0, 20) + '...', user });
    
    this.token = token;
    this.user = user;
    
    // Сохраняем токен и данные пользователя
    localStorage.setItem(CONFIG.SECURITY.TOKEN_KEY, token);
    localStorage.setItem('user_data', JSON.stringify(user));
    
    // Устанавливаем токен в API сервис
    apiService.setToken(token);
    
    console.log('Auth data saved to localStorage');
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

