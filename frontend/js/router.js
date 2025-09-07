// Роутер приложения
class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.init();
    }

    // Инициализация роутера
    init() {
        // Регистрация маршрутов
        this.addRoute('/', () => this.loadOnboarding());
        this.addRoute('/auth', () => this.loadAuth());
        this.addRoute('/main', () => this.loadMainMenu());
        this.addRoute('/matchmaking', () => this.loadMatchmaking());
        this.addRoute('/leaderboard', () => this.loadLeaderboard());
        this.addRoute('/news', () => this.loadNews());
        this.addRoute('/settings', () => this.loadSettings());

        // Обработка изменения URL
        window.addEventListener('popstate', () => this.handleRoute());

        // Загрузка начального маршрута
        this.handleRoute();
    }

    // Добавление маршрута
    addRoute(path, handler) {
        this.routes.set(path, handler);
    }

    // Навигация к маршруту
    navigate(path) {
        if (this.currentRoute !== path) {
            window.history.pushState({}, '', path);
            this.handleRoute();
        }
    }

    // Обработка маршрута
    handleRoute() {
        const path = window.location.pathname;
        const handler = this.routes.get(path);

        if (handler) {
            this.currentRoute = path;
            handler();
        } else {
            // Redirect на главную если маршрут не найден
            this.navigate('/');
        }
    }

    // Загрузка компонентов
    async loadOnboarding() {
        const onboarding = new OnboardingComponent();
        await onboarding.render();
    }

    async loadAuth() {
        const auth = new AuthComponent();
        await auth.render();
    }

    async loadMainMenu() {
        // Ждем готовности AuthService
        if (!window.AuthService || !window.AuthService.isAuthenticated()) {
            this.navigate('/auth');
            return;
        }

        const mainMenu = new MainMenuComponent();
        await mainMenu.render();
    }

    async loadMatchmaking() {
        if (!window.AuthService.isAuthenticated()) {
            this.navigate('/auth');
            return;
        }

        const matchmaking = new MatchmakingComponent();
        await matchmaking.render();
    }

    async loadLeaderboard() {
        const leaderboard = new LeaderboardComponent();
        await leaderboard.render();
    }

    async loadNews() {
        const news = new NewsComponent();
        await news.render();
    }
    async loadSettings() {
        if (!window.AuthService.isAuthenticated()) {
            this.navigate('/auth');
            return;
        }

        const settings = new SettingsComponent();
        await settings.render();
    }
}

// Создание глобального экземпляра роутера
window.Router = Router;