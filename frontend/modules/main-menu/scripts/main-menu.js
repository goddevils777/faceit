// Компонент главного меню
class MainMenuComponent {
    constructor() {
        this.container = null;
        this.currentUser = window.AuthService.getCurrentUser()
    }

    // Рендер компонента
    async render() {
        this.container = document.querySelector('#app') || document.body;
        this.container.innerHTML = '';
        
        const mainMenuHTML = this.getMainMenuHTML();
        this.container.innerHTML = mainMenuHTML;
        
        this.bindEvents();
    }

    // Получение HTML структуры главного меню
    getMainMenuHTML() {
        return `
            <div class="main-menu-wrapper">
                <!-- Заголовок с профилем -->
                <header class="main-header">
                    <div class="header-content">
                        <div class="user-info">
                            <div class="user-avatar">
                                <img src="assets/images/logo.png" alt="Avatar" class="avatar-img">
                            </div>
                            <div class="user-details">
                                <h3 class="username">${this.currentUser?.username || 'Player'}</h3>
                                <div class="user-stats">
                                    <span class="elo">ELO: ${this.currentUser?.elo || 1000}</span>
                                    <span class="level">Уровень: ${this.currentUser?.level || 1}</span>
                                </div>
                            </div>
                        </div>
                        <div class="header-actions">
                        
                            <button class="logout-btn" id="logout-btn">Выход</button>
                        </div>
                    </div>
                </header>

                <!-- Основной контент -->
                <main class="main-content">
                    <div class="content-container">
                        <!-- О платформе -->
                        <section class="platform-info">
                            <h2>Smart Gaming</h2>
                            <p class="platform-description">
                                Smart Gaming - это новая голова для киберспортсменов. На нашей платформе играют и тренируются 
                                лучшие игроки со всего мира! Всего у нас - 4 лиги: Default League; Qualification League; 
                                Cyber League; Pro League. В Default League есть 10 уровней, которые поднимаются, в зависимости 
                                от ELO, имеющегося у вас. В отличии от наших конкурентов, мы разработали собственную кастомную систему ELO.
                            </p>
                        </section>

                        <!-- Система уровней -->
                        <section class="levels-system">
                            <h3>Система уровней</h3>
                            <p class="levels-intro">
                                Всего на нашем фейсите есть 10 уровней:
                            </p>
                            
                            <div class="levels-grid">
                                ${this.generateLevelsHTML()}
                            </div>
                        </section>
                    </div>
                </main>

                <!-- Нижняя навигация -->
// В файле frontend/modules/main-menu/scripts/main-menu.js найти секцию:
<!-- Нижняя навигация -->
<nav class="bottom-navigation">
    <div class="nav-container">
        <div class="nav-item active" data-route="/main">
            <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="m9 22V12h6v10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </span>
            <span class="nav-label">Главная</span>
        </div>
<div class="nav-item" data-route="/matchmaking">
    <span class="nav-icon">
        <img src="modules/main-menu/assets/icon2.png" alt="Матчи" style="width: 100%; height: 100%; object-fit: contain;">
    </span>
    <span class="nav-label">Матчи</span>
</div>
<div class="nav-item" data-route="/leaderboard">
    <span class="nav-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l8 4.5v11L12 22l-8-4.5v-11L12 2z" stroke="currentColor" stroke-width="2"/>
            <path d="M12 22V12" stroke="currentColor" stroke-width="2"/>
            <path d="M20 6.5L12 12L4 6.5" stroke="currentColor" stroke-width="2"/>
        </svg>
    </span>
    <span class="nav-label">Топ</span>
</div>
        <div class="nav-item" data-route="/news">
            <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6 18h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6 14h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 6h2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 10h2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 14h2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </span>
            <span class="nav-label">Новости</span>
        </div>
        <div class="nav-item" data-route="/settings">
            <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2"/>
                </svg>
            </span>
            <span class="nav-label">Настройки</span>
        </div>
    </div>
</nav>
            </div>
        `;
    }

    // Генерация HTML для уровней
    generateLevelsHTML() {
        const levels = [
            { level: 1, eloMin: 250, eloMax: 400, description: "На 1 уровне играют самые новички нашей игры." },
            { level: 2, eloMin: 401, eloMax: 600, description: "На 2 уровне играют так-же новички, но они уже имеют малейшее представление об игре." },
            { level: 3, eloMin: 601, eloMax: 800, description: "На 3 уровне играют среднестатистические игроки нашей игры." },
            { level: 4, eloMin: 801, eloMax: 900, description: "4 уровень проходится очень быстро. Если вы его получили, поздравляем, вы почти дошли до половины!" },
            { level: 5, eloMin: 901, eloMax: 1000, description: "5 уровень. Поздравляем, вы дошли до половины, это значит, что вы играете лучше большинства игроков." },
            { level: 6, eloMin: 1001, eloMax: 1200, description: "На 6 уровне играют уже 30% всех игроков. Не каждый может дойти до такого уровня." },
            { level: 7, eloMin: 1201, eloMax: 1400, description: "На 7 уровне играют некоторые Легенды и ютуберы!" },
            { level: 8, eloMin: 1401, eloMax: 1600, description: "До 8 уровня дойти очень тяжело, вам крупно повезло, если вы откалибровались на этот уровень!" },
            { level: 9, eloMin: 1601, eloMax: 1800, description: "9 уровень. Вы почти дошли до самого максимума!" },
            { level: 10, eloMin: 1801, eloMax: 2000, description: "На 10 уровне играют все киберспортсмены! Поздравляю, вы дошли до максимума!" }
        ];

        return levels.map(levelData => {
            const isCurrentLevel = this.currentUser?.elo >= levelData.eloMin && this.currentUser?.elo <= levelData.eloMax;
            
            return `
                <div class="level-card ${isCurrentLevel ? 'current-level' : ''}">
                    <div class="level-header">
                        <span class="level-number">${levelData.level} LVL</span>
                        <span class="level-elo">${levelData.eloMin} - ${levelData.eloMax} ELO</span>
                    </div>
                    <p class="level-description">${levelData.description}</p>
                    ${isCurrentLevel ? '<div class="current-level-badge">Ваш уровень</div>' : ''}
                </div>
            `;
        }).join('');
    }

    // Привязка событий
    bindEvents() {
        // Навигация
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const route = e.currentTarget.dataset.route;
                if (route) {
                    this.updateActiveNavItem(e.currentTarget);
                    router.navigate(route);
                }
            });
        });

        // Настройки
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                router.navigate('/settings');
            });
        }

        // Выход
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    // Обновление активного элемента навигации
    updateActiveNavItem(activeItem) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');
    }

handleLogout() {
    window.AuthService.logout();
    app.showNotification('Вы вышли из системы', 'info');
    router.navigate('/auth');
}

    // Уничтожение компонента
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Экспорт компонента
window.MainMenuComponent = MainMenuComponent;