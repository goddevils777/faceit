// Компонент авторизации
class AuthComponent {
    constructor() {
        this.container = null;
        this.currentForm = 'register'; // 'register' или 'login'
        this.isLoading = false;
        this.rateLimiter = SecurityUtils.createRateLimiter(5, 60000); // 5 попыток в минуту
    }

    // Рендер компонента
    async render() {
        this.container = document.querySelector('#app') || document.body;
        this.container.innerHTML = '';
        
        const authHTML = this.getAuthHTML();
        this.container.innerHTML = authHTML;
        
        this.bindEvents();
        this.showForm(this.currentForm);
    }

    // Получение HTML структуры
    getAuthHTML() {
        return `
            <div class="auth-wrapper">
                <div class="auth-container">
                    <div class="auth-header">
                        <h1 class="auth-logo">Smart Faceit</h1>
                        <p class="auth-subtitle">Киберспортивная платформа</p>
                    </div>

                    <div class="auth-tabs">
                        <button class="auth-tab ${this.currentForm === 'register' ? 'active' : ''}" 
                                data-form="register">Регистрация</button>
                        <button class="auth-tab ${this.currentForm === 'login' ? 'active' : ''}" 
                                data-form="login">Вход</button>
                    </div>

                    <div class="social-auth">
                        <button class="social-button google-btn" data-provider="google">
                            <img src="frontend/assets/images/google-logo.png" alt="Google" class="social-logo">
                            <span>Google</span>
                        </button>
                        <button class="social-button vk-btn" data-provider="vk">
                            <img src="frontend/assets/images/vk-logo.png" alt="VK" class="social-logo">
                            <span>VKontakte</span>
                        </button>
                    </div>

                    <div class="auth-divider">
                        <span>или</span>
                    </div>

                    <div class="auth-form-container">
                        <form class="auth-form" id="auth-form" autocomplete="off">
                            <!-- Форма загружается динамически -->
                        </form>
                    </div>

                    <div class="auth-links">
                        <a href="#" class="forgot-password" id="forgot-password">Забыли пароль?</a>
                        <a href="#" class="back-link" data-route="/">← Назад к онбордингу</a>
                    </div>

                    <div class="auth-footer">
                        <p class="terms-text">
                            Продолжая, вы соглашаетесь с 
                            <a href="#" class="terms-link">условиями использования</a> и 
                            <a href="#" class="privacy-link">политикой конфиденциальности</a>
                        </p>
                    </div>
                </div>

                <!-- Лоадер -->
                <div class="auth-loader hidden" id="auth-loader">
                    <div class="loader"></div>
                    <p>Обработка запроса...</p>
                </div>
            </div>
        `;
    }

    // Привязка событий
    bindEvents() {
        // Переключение между табами
        const tabs = document.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const formType = e.target.dataset.form;
                this.switchForm(formType);
            });
        });

        // Социальная авторизация
        const socialButtons = document.querySelectorAll('.social-button');
        socialButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const provider = e.currentTarget.dataset.provider;
                this.handleSocialAuth(provider);
            });
        });

        // Забыли пароль
        const forgotPassword = document.getElementById('forgot-password');
        forgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });

        // Отправка формы
        const form = document.getElementById('auth-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
    }

    // Переключение формы
    switchForm(formType) {
        if (this.isLoading) return;
        
        this.currentForm = formType;
        this.updateTabs();
        this.showForm(formType);
    }

    // Обновление активного таба
    updateTabs() {
        const tabs = document.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            const isActive = tab.dataset.form === this.currentForm;
            tab.classList.toggle('active', isActive);
        });
    }

    // Показ формы
    showForm(formType) {
        const formContainer = document.getElementById('auth-form');
        
        if (formType === 'register') {
            formContainer.innerHTML = this.getRegisterFormHTML();
        } else {
            formContainer.innerHTML = this.getLoginFormHTML();
        }

        this.bindFormEvents();
    }

    // HTML формы регистрации
    getRegisterFormHTML() {
        return `
            <div class="form-group">
                <input type="text" 
                       class="form-input" 
                       id="username" 
                       name="username"
                       placeholder="Ваш никнейм" 
                       maxlength="20" 
                       required
                       autocomplete="username">
                <div class="input-error" id="username-error"></div>
            </div>

            <div class="form-group">
                <input type="email" 
                       class="form-input" 
                       id="email" 
                       name="email"
                       placeholder="Ваш Email" 
                       required
                       autocomplete="email">
                <div class="input-error" id="email-error"></div>
            </div>

            <div class="form-group">
                <div class="password-container">
                    <input type="password" 
                           class="form-input" 
                           id="password" 
                           name="password"
                           placeholder="Ваш пароль" 
                           minlength="6" 
                           required
                           autocomplete="new-password">
                    <button type="button" class="password-toggle" id="password-toggle">
                        👁️
                    </button>
                </div>
                <div class="password-strength" id="password-strength"></div>
                <div class="input-error" id="password-error"></div>
            </div>

            <div class="form-group">
                <select class="form-input region-select" id="region" name="region" required>
                    <option value="">Выберите регион</option>
                    ${CONFIG.GAME.REGIONS.map(region => 
                        `<option value="${region}">${this.getRegionName(region)}</option>`
                    ).join('')}
                </select>
                <div class="input-error" id="region-error"></div>
            </div>

            <button type="submit" class="btn btn-primary auth-submit-btn" id="submit-btn">
                Зарегистрироваться
            </button>
        `;
    }

    // HTML формы входа
    getLoginFormHTML() {
        return `
            <div class="form-group">
                <input type="text" 
                       class="form-input" 
                       id="login" 
                       name="login"
                       placeholder="Email или никнейм" 
                       required
                       autocomplete="username">
                <div class="input-error" id="login-error"></div>
            </div>

            <div class="form-group">
                <div class="password-container">
                    <input type="password" 
                           class="form-input" 
                           id="password" 
                           name="password"
                           placeholder="Ваш пароль" 
                           required
                           autocomplete="current-password">
                    <button type="button" class="password-toggle" id="password-toggle">
                        👁️
                    </button>
                </div>
                <div class="input-error" id="password-error"></div>
            </div>

            <div class="form-group">
                <label class="checkbox-container">
                    <input type="checkbox" id="remember" name="remember">
                    <span class="checkmark"></span>
                    Запомнить меня
                </label>
            </div>

            <button type="submit" class="btn btn-primary auth-submit-btn" id="submit-btn">
                Войти
            </button>
        `;
    }

    // Привязка событий формы
    bindFormEvents() {
        // Показ/скрытие пароля
        const passwordToggle = document.getElementById('password-toggle');
        if (passwordToggle) {
            passwordToggle.addEventListener('click', this.togglePassword);
        }

        // Валидация в реальном времени
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('blur', (e) => this.validateField(e.target));
            input.addEventListener('input', (e) => this.clearFieldError(e.target));
        });

        // Проверка силы пароля для регистрации
        if (this.currentForm === 'register') {
            const passwordInput = document.getElementById('password');
            passwordInput.addEventListener('input', (e) => this.updatePasswordStrength(e.target.value));
        }
    }

    // Переключение видимости пароля
    togglePassword() {
        const passwordInput = document.getElementById('password');
        const toggle = document.getElementById('password-toggle');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggle.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggle.textContent = '👁️';
        }
    }

    // Обновление индикатора силы пароля
    updatePasswordStrength(password) {
        const strengthContainer = document.getElementById('password-strength');
        if (!strengthContainer) return;

        const strength = SecurityUtils.getPasswordStrength(password);
        const strengthLevels = ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Отличный'];
        const strengthColors = ['#ff4757', '#ff6348', '#ffa502', '#2ed573', '#1dd1a1'];

        strengthContainer.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill" style="width: ${strength * 20}%; background: ${strengthColors[strength - 1] || '#ff4757'}"></div>
            </div>
            <span class="strength-text">${strengthLevels[strength - 1] || 'Введите пароль'}</span>
        `;
    }

    // Валидация поля
    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        let validation;

        switch (fieldName) {
            case 'username':
                validation = ValidationUtils.validateUsername(value);
                break;
            case 'email':
                validation = ValidationUtils.validateEmail(value);
                break;
            case 'password':
                validation = ValidationUtils.validatePassword(value);
                break;
            case 'region':
                validation = ValidationUtils.validateRegion(value);
                break;
            case 'login':
                validation = { valid: !!value, error: value ? null : 'Поле обязательно для заполнения' };
                break;
            default:
                return;
        }

        this.showFieldError(field, validation.valid ? null : validation.error);
        return validation.valid;
    }

    // Показ ошибки поля
    showFieldError(field, error) {
        const errorContainer = document.getElementById(`${field.name}-error`);
        if (errorContainer) {
            errorContainer.textContent = error || '';
            field.classList.toggle('error', !!error);
        }
    }

    // Очистка ошибки поля
    clearFieldError(field) {
        this.showFieldError(field, null);
    }

    // Обработка отправки формы
    async handleFormSubmit() {
        if (this.isLoading) return;

        // Проверка rate limiting
        const userIP = 'user_ip'; // В реальном приложении получать IP
        if (!this.rateLimiter(userIP)) {
            app.showError('Слишком много попыток. Попробуйте позже.');
            return;
        }

        const formData = this.getFormData();
        
        // Валидация формы
        const validation = this.currentForm === 'register' 
            ? ValidationUtils.validateRegistrationForm(formData)
            : ValidationUtils.validateLoginForm(formData);

        if (!validation.valid) {
            validation.errors.forEach(error => app.showError(error));
            return;
        }

        this.setLoading(true);

        try {
            let result;
            
            if (this.currentForm === 'register') {
                result = await AuthService.register(formData);
            } else {
                result = await AuthService.login(formData);
            }

            if (result.success) {
                app.showSuccess(this.currentForm === 'register' ? 'Регистрация успешна!' : 'Вход выполнен!');
                
                // Переход в главное меню после успешной авторизации
                setTimeout(() => {
                    router.navigate('/main');
                }, 1000);
            } else {
                app.showError(result.error);
            }
            
        } catch (error) {
            console.error('Auth error:', error);
            app.showError('Произошла ошибка. Попробуйте позже.');
        } finally {
            this.setLoading(false);
        }
    }

    // Получение данных формы
    getFormData() {
        const form = document.getElementById('auth-form');
        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            data[key] = SecurityUtils.sanitizeHTML(value.trim());
        }

        return data;
    }

    // Установка состояния загрузки
    setLoading(loading) {
        this.isLoading = loading;
        const loader = document.getElementById('auth-loader');
        const submitBtn = document.getElementById('submit-btn');
        
        if (loader) {
            loader.classList.toggle('hidden', !loading);
        }
        
        if (submitBtn) {
            submitBtn.disabled = loading;
            submitBtn.textContent = loading ? 'Обработка...' : 
                (this.currentForm === 'register' ? 'Зарегистрироваться' : 'Войти');
        }
    }

    // Обработка социальной авторизации
    async handleSocialAuth(provider) {
        try {
            app.showNotification(`Авторизация через ${provider}...`, 'info');
            // Здесь будет интеграция с OAuth провайдерами
            
            // Заглушка для демонстрации
            setTimeout(() => {
                app.showError('Социальная авторизация пока недоступна');
            }, 1000);
            
        } catch (error) {
            console.error('Social auth error:', error);
            app.showError('Ошибка социальной авторизации');
        }
    }

    // Обработка восстановления пароля
    handleForgotPassword() {
        app.showNotification('Функция восстановления пароля будет доступна в ближайшее время', 'info');
    }

    // Получение названия региона
    getRegionName(region) {
        const regionNames = {
            asia: 'Азия',
            russia: 'Россия',
            europe: 'Европа',
            usa: 'США',
            brazil: 'Бразилия',
            australia: 'Австралия'
        };
        
        return regionNames[region] || region;
    }

    // Уничтожение компонента
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Экспорт компонента
window.AuthComponent = AuthComponent;