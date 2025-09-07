// Компонент авторизации
class AuthComponent {
    constructor() {
        this.container = null;
        this.currentStep = 'selection'; // 'selection' или 'form'
        this.currentForm = null; // 'register', 'login', 'google', 'vk'
        this.isLoading = false;
        this.rateLimiter = SecurityUtils.createRateLimiter(5, 60000);
    }

    // Рендер компонента
    async render() {
        this.container = document.querySelector('#app') || document.body;
        this.container.innerHTML = '';

        if (this.currentStep === 'selection') {
            this.container.innerHTML = this.getSelectionHTML();
            this.bindSelectionEvents();
        } else {
            this.container.innerHTML = this.getAuthHTML();
            this.bindEvents();
            this.showForm(this.currentForm);
        }
    }

    // HTML экрана выбора способа входа

    // HTML экрана выбора способа входа
    getSelectionHTML() {
        return `
        <div class="auth-wrapper">
            <div class="auth-container">
                <div class="auth-header">
                    <img src="assets/images/logo.png" alt="Smart Gaming" class="auth-logo-img">
                    <h1 class="auth-logo">Smart Gaming</h1>
                    <p class="auth-subtitle">Играй и тренируйся вместе с киберспортсменами!</p>
                </div>

                <div class="auth-selection">
                    <button class="selection-button primary-btn" data-type="register">
                        Регистрация
                    </button>
                    <button class="selection-button primary-btn" data-type="login">
                        Вход
                    </button>

                                    <div class="auth-divider">
                    <span>или</span>
                </div>
                    <div class="social-buttons-row">
                        <button class="selection-button social-btn google-btn" data-type="google">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="social-logo">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            </svg>
                            Google
                        </button>
                        <button class="selection-button social-btn vk-btn" data-type="vk">
                            <img src="assets/images/vk_icon.svg" alt="VK" class="social-logo">
                            VKontakte
                        </button>
                    </div>
                    <button class="selection-button forgot-btn" data-type="forgot">
                        Забыли пароль?
                    </button>
                </div>

                <div class="auth-links">
                    <a href="#" class="back-link" data-route="/">← Назад к онбордингу</a>
                </div>
            </div>
        </div>
    `;
    }


    // Привязка событий экрана выбора
    bindSelectionEvents() {
        const selectionButtons = document.querySelectorAll('.selection-button');

        selectionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.handleSelectionChoice(type);
            });
        });

        // Назад к онбордингу
        const backLink = document.querySelector('.back-link');
        if (backLink) {
            backLink.addEventListener('click', (e) => {
                e.preventDefault();
                router.navigate('/');
            });
        }
    }

    // Обработка выбора способа входа
    // Обработка выбора способа входа
    handleSelectionChoice(type) {
        if (type === 'google' || type === 'vk') {
            this.handleSocialAuth(type === 'google' ? 'google' : 'vk');
        } else if (type === 'forgot') {
            this.handleForgotPassword();
        } else {
            this.currentForm = type;
            this.currentStep = 'form';
            this.render();
        }
    }

    // Получение HTML структуры
    // Получение HTML структуры формы
    // HTML экрана выбора способа входа
    getSelectionHTML() {
        return `
        <div class="auth-wrapper">
            <div class="auth-container">
                <div class="auth-header">
                    <img src="assets/images/logo.png" alt="Smart Gaming" class="auth-logo-img">
                    <h1 class="auth-logo">Smart Gaming</h1>
                    <p class="auth-subtitle">Играй и тренируйся вместе с киберспортсменами!</p>
                </div>

                <div class="auth-selection">
                    <button class="selection-button primary-btn" data-type="register">
                        Регистрация
                    </button>
                    <button class="selection-button primary-btn" data-type="login">
                        Вход
                    </button>
                            <div class="auth-divider">
                    <span>или</span>
                </div>
                    <div class="social-buttons-row">
                        <button class="selection-button social-btn google-btn" data-type="google">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="social-logo">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            </svg>
                            Google
                        </button>
                        <button class="selection-button social-btn vk-btn" data-type="vk">
                            <img src="assets/images/vk_icon.svg" alt="VK" class="social-logo">
                            VKontakte
                        </button>
                    </div>
                    <button class="selection-button forgot-btn" data-type="forgot">
                        Забыли пароль?
                    </button>
                </div>

                <div class="auth-links">
                    <a href="#" class="back-link" data-route="/">← Назад к онбордингу</a>
                </div>
            </div>
        </div>
    `;
    }

    // Получение HTML структуры формы
    getAuthHTML() {
        return `
        <div class="auth-wrapper">
            <div class="auth-container">
                <div class="auth-header">
                    <img src="assets/images/logo.png" alt="Smart Gaming" class="auth-logo-img">
                    <h1 class="auth-logo">Smart Gaming</h1>
                    <p class="auth-subtitle">Играй и тренируйся вместе с киберспортсменами!</p>
                </div>

                <div class="auth-tabs">
                    <button class="auth-tab ${this.currentForm === 'register' ? 'active' : ''}" 
                            data-form="register">Регистрация</button>
                    <button class="auth-tab ${this.currentForm === 'login' ? 'active' : ''}" 
                            data-form="login">Вход</button>
                </div>

                        <div class="auth-divider">
                    <span>или</span>
                </div>

                <div class="form-social-auth">
                    <div class="social-buttons-row">
                        <button class="social-button google-btn" data-provider="google">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="social-logo">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            </svg>
                            <span>Google</span>
                        </button>
                        <button class="social-button vk-btn" data-provider="vk">
                            <img src="assets/images/vk_icon.svg" alt="VK" class="social-logo">
                            <span>VKontakte</span>
                        </button>
                    </div>
                    <button class="social-button forgot-btn" id="forgot-password-btn">
                        Забыли пароль?
                    </button>
                </div>

        

                <div class="auth-form-container">
                    <form class="auth-form" id="auth-form" autocomplete="off">
                        <!-- Форма загружается динамически -->
                    </form>
                </div>

                <div class="auth-links">
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

        // Социальная авторизация (исключаем кнопку забыли пароль)
        const socialButtons = document.querySelectorAll('.social-button:not(.forgot-btn)');
        socialButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const provider = e.currentTarget.dataset.provider;
                this.handleSocialAuth(provider);
            });
        });

        // Забыли пароль (правильный ID)
        const forgotPasswordBtn = document.getElementById('forgot-password-btn');
        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }

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
                result = await window.AuthService.register(formData);
            } else {
                result = await window.AuthService.login(formData);
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