// Конфигурация фронтенда
const CONFIG = {
    // API настройки
    API: {
        BASE_URL: 'http://localhost:3000/api',
        ENDPOINTS: {
            AUTH: '/auth',
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            USERS: '/users',
            GAMES: '/games',
            ELO: '/elo',
            LEADERBOARD: '/leaderboard'
        }
    },

    // Настройки игры
    GAME: {
        SLIDES_COUNT: 5,
        REGIONS: ['asia', 'russia', 'europe', 'usa', 'brazil', 'australia'],
        MAPS: ['province', 'hanami', 'rust', 'sandstone'],
        LEAGUES: ['Default League', 'Qualification League', 'Cyber League', 'Pro League']
    },

    // ELO система
    ELO_LEVELS: {
        1: { min: 250, max: 400, name: 'Новичок' },
        2: { min: 401, max: 600, name: 'Начинающий' },
        3: { min: 601, max: 800, name: 'Средний' },
        4: { min: 801, max: 900, name: 'Выше среднего' },
        5: { min: 901, max: 1000, name: 'Хороший' },
        6: { min: 1001, max: 1200, name: 'Опытный' },
        7: { min: 1201, max: 1400, name: 'Эксперт' },
        8: { min: 1401, max: 1600, name: 'Мастер' },
        9: { min: 1601, max: 1800, name: 'Гроссмейстер' },
        10: { min: 1801, max: 2000, name: 'Легенда' }
    },

    // Валидация
    VALIDATION: {
        USERNAME: { min: 3, max: 20 },
        PASSWORD: { min: 6, max: 50 },
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    // Безопасность
    SECURITY: {
        TOKEN_KEY: 'smart_faceit_token',
        SESSION_TIMEOUT: 3600000 // 1 час
    }
};

// Экспорт
window.CONFIG = CONFIG;