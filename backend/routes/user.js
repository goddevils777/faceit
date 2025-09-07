// Маршруты пользователей
const express = require('express');
const router = express.Router();
const ValidationMiddleware = require('../middleware/validation');

// Получение профиля пользователя
router.get('/profile', (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user.id,
            username: req.user.username || 'DemoPlayer',
            email: req.user.email || 'demo@smartfaceit.com',
            region: req.user.region || 'europe',
            elo: req.user.elo || 1250,
            level: req.user.level || 6,
            wins: req.user.wins || 45,
            losses: req.user.losses || 12
        }
    });
});

// Обновление профиля
router.put('/profile', 
    ValidationMiddleware.validateUpdateProfile,
    (req, res) => {
        res.json({
            success: true,
            message: 'Профиль успешно обновлен'
        });
    }
);

// Получение статистики пользователя
router.get('/stats', (req, res) => {
    res.json({
        success: true,
        stats: {
            totalGames: 57,
            wins: 45,
            losses: 12,
            winRate: 78.9,
            avgElo: 1250,
            bestWinStreak: 8,
            currentStreak: 3
        }
    });
});

module.exports = router;