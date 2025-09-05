// Маршруты игр
const express = require('express');
const router = express.Router();
const ValidationMiddleware = require('../middleware/validation');

// Получение списка активных игр
router.get('/', (req, res) => {
    const mockGames = [
        {
            id: 'game1',
            map: 'province',
            gameMode: 'competitive',
            region: 'europe',
            players: 8,
            maxPlayers: 10,
            status: 'waiting',
            createdBy: 'ProGamer'
        },
        {
            id: 'game2',
            map: 'rust',
            gameMode: 'casual',
            region: 'russia',
            players: 6,
            maxPlayers: 8,
            status: 'in-progress',
            createdBy: 'CyberNinja'
        }
    ];

    res.json({
        success: true,
        games: mockGames,
        total: mockGames.length
    });
});

// Создание новой игры
router.post('/',
    ValidationMiddleware.validateCreateGame,
    (req, res) => {
        const newGame = {
            id: 'game_' + Date.now(),
            ...req.body,
            createdBy: req.user.id,
            players: 1,
            status: 'waiting',
            createdAt: new Date().toISOString()
        };

        res.status(201).json({
            success: true,
            message: 'Игра успешно создана',
            game: newGame
        });
    }
);

// Присоединение к игре
router.post('/join',
    ValidationMiddleware.validateJoinGame,
    (req, res) => {
        res.json({
            success: true,
            message: 'Вы успешно присоединились к игре',
            gameId: req.body.gameId
        });
    }
);

// Лидерборд
router.get('/leaderboard', (req, res) => {
    const mockLeaderboard = [
        { rank: 1, username: 'LegendPlayer', elo: 2150, wins: 127, losses: 23 },
        { rank: 2, username: 'ProMaster', elo: 2089, wins: 98, losses: 34 },
        { rank: 3, username: 'CyberAce', elo: 1967, wins: 156, losses: 67 }
    ];

    res.json({
        success: true,
        leaderboard: mockLeaderboard
    });
});

module.exports = router;