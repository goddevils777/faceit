// Главный класс приложения
class SmartFaceitApp {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
        this.notificationQueue = [];
    }

    // Инициализация приложения
    async init() {
        try {
            console.log('Smart Gaming успешно инициализирован');
            
            // Проверка конфигурации
            if (!window.CONFIG) {
                throw new Error('Конфигурация не загружена');
            }

            // Инициализация сервисов
            await this.initServices();
            
            // Инициализация роутера
            this.initRouter();
            
            // Проверка авторизации
            await this.checkAuth();
            
            // Установка обработчиков событий
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('Smart Faceit успешно инициализирован');
            
            // Показать уведомление о готовности
            this.showNotification('Приложение готово к работе!', 'success');
            
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showError('Ошибка загрузки приложения');
        }
    }

    // Инициализация сервисов
async initServices() {
    // Проверка доступности API
    try {
        await this.checkApiHealth();
    } catch (error) {
        console.warn('API недоступно, работаем в оффлайн режиме');
    }

    // Создаем AuthService только один раз
    window.AuthService = new AuthService();
    await window.AuthService.init();

    // Инициализация других сервисов
    this.initNotificationService();
}

    // Проверка состояния API
    async checkApiHealth() {
        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}/health`);
            if (!response.ok) {
                throw new Error('API недоступно');
            }
            return true;
        } catch (error) {
            console.warn('API health check failed:', error);
            return false;
        }
    }

    // Инициализация роутера
initRouter() {
    window.router = new Router();
}

    // Проверка авторизации при загрузке
// Проверка авторизации
async checkAuth() {
    console.log('Checking authentication...');
    console.log('window.AuthService:', window.AuthService);
    console.log('AuthService type:', typeof window.AuthService);
    
    // Проверяем, что AuthService инициализирован
    if (!window.AuthService || typeof window.AuthService.isAuthenticated !== 'function') {
        console.log('AuthService не инициализирован, пользователь не авторизован');
        this.currentUser = null;
        return false;
    }
    
    if (window.AuthService.isAuthenticated()) {
        this.currentUser = window.AuthService.getCurrentUser();
        console.log('Пользователь авторизован:', this.currentUser);
        return true;
    } else {
        console.log('Пользователь не авторизован');
        this.currentUser = null;
        return false;
    }
}
    // Установка глобальных обработчиков событий
    setupEventListeners() {
        // Обработка кликов по ссылкам
        document.addEventListener('click', this.handleLinkClick.bind(this));
        
        // Обработка изменения соединения
        window.addEventListener('online', () => {
            this.showNotification('Соединение восстановлено', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.showNotification('Соединение потеряно', 'error');
        });

        // Обработка изменения размера экрана
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Клавиатурные сокращения
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    // Обработка кликов по ссылкам
    handleLinkClick(event) {
        const link = event.target.closest('[data-route]');
        if (link) {
            event.preventDefault();
            const route = link.getAttribute('data-route');
            router.navigate(route);
        }
    }

    // Обработка изменения размера экрана
    handleResize() {
        // Обновление viewport для мобильных устройств
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // Обработка нажатий клавиш
    handleKeyPress(event) {
        // ESC - закрытие модальных окон
        if (event.key === 'Escape') {
            this.closeModals();
        }
        
        // Ctrl/Cmd + / - показать справку
        if ((event.ctrlKey || event.metaKey) && event.key === '/') {
            event.preventDefault();
            this.showHelp();
        }
    }

    // Инициализация системы уведомлений
    initNotificationService() {
        // Создание контейнера для уведомлений если его нет
        if (!document.getElementById('notifications')) {
            const container = document.createElement('div');
            container.id = 'notifications';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
    }

    // Показ уведомления
    showNotification(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notifications');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type} fade-in`;
        notification.style.pointerEvents = 'auto';
        notification.textContent = message;

        container.appendChild(notification);

        // Автоудаление
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);

        // Клик для закрытия
        notification.addEventListener('click', () => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }

    // Показ ошибки
    showError(message) {
        this.showNotification(message, 'error', 5000);
    }

    // Показ успеха
    showSuccess(message) {
        this.showNotification(message, 'success', 3000);
    }

    // Закрытие модальных окон
    closeModals() {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // Показ справки
    showHelp() {
        this.showNotification('Справка: ESC - закрыть, Ctrl+/ - эта справка', 'info', 5000);
    }

    // Logout пользователя
    logout() {
        if (this.currentUser) {
            AuthService.logout();
            this.currentUser = null;
            this.showNotification('Вы вышли из системы', 'info');
            router.navigate('/');
        }
    }

    // Получение текущего пользователя
    getCurrentUser() {
        return this.currentUser;
    }

    // Проверка инициализации
    isReady() {
        return this.isInitialized;
    }
}

// Создание глобального экземпляра приложения
window.app = new SmartFaceitApp();

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.app.init();
});

// Экспорт для использования в других модулях
window.SmartFaceitApp = SmartFaceitApp;