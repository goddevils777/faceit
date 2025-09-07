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
        1: { min: 250, max: 400, name: 'Новичок', description: 'На 1 уровне играют самые новички нашей игры.' },
        2: { min: 401, max: 600, name: 'Начинающий', description: 'На 2 уровне играют так-же новички, но они уже имеют малейшее представление об игре.' },
        3: { min: 601, max: 800, name: 'Средний', description: 'На 3 уровне играют среднестатистические игроки нашей игры.' },
        4: { min: 801, max: 900, name: 'Выше среднего', description: '4 уровень проходится очень быстро. Если вы его получили, поздравляем, вы почти дошли до половины!' },
        5: { min: 901, max: 1000, name: 'Хороший', description: '5 уровень. Поздравляем, вы дошли до половины, это значит, что вы играете лучше большинства игроков.' },
        6: { min: 1001, max: 1200, name: 'Опытный', description: 'На 6 уровне играют уже 30% всех игроков. Не каждый может дойти до такого уровня.' },
        7: { min: 1201, max: 1400, name: 'Эксперт', description: 'На 7 уровне играют некоторые Легенды и ютуберы!' },
        8: { min: 1401, max: 1600, name: 'Мастер', description: 'До 8 уровня дойти очень тяжело, вам крупно повезло, если вы откалибровались на этот уровень!' },
        9: { min: 1601, max: 1800, name: 'Гроссмейстер', description: '9 уровень. Вы почти дошли до самого максимума!' },
        10: { min: 1801, max: 2000, name: 'Легенда', description: 'На 10 уровне играют все киберспортсмены! Поздравляю, вы дошли до максимума!' }
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