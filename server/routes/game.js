const express = require('express');
const router = express.Router();

// 게임 목록 페이지
router.get('/', (req, res) => {
  res.render('games/index', {
    title: '게임',
    user: req.session.user,
    games: [
      {
        name: '테트리스',
        description: '클래식 테트리스 게임',
        url: '/game/tetris',
        thumbnail: '/images/tetris-thumb.svg'
      }
    ]
  });
});

// 테트리스 게임 페이지
router.get('/tetris', (req, res) => {
  res.render('games/tetris', {
    title: '테트리스 게임',
    user: req.session.user,
    googleAdsenseClient: process.env.GOOGLE_ADSENSE_CLIENT
  });
});

// 게임 점수 저장 (API)
router.post('/score', async (req, res) => {
  try {
    const { game, playerName, score, level, lines } = req.body;
    
    if (!game || !score) {
      return res.status(400).json({ error: '게임과 점수는 필수입니다.' });
    }
    
    // 간단한 메모리 저장 (실제로는 데이터베이스에 저장해야 함)
    if (!global.gameScores) {
      global.gameScores = {};
    }
    if (!global.gameScores[game]) {
      global.gameScores[game] = [];
    }
    
    global.gameScores[game].push({
      playerName: playerName || '익명',
      score,
      level,
      lines,
      timestamp: new Date()
    });
    
    // 상위 100개만 유지
    global.gameScores[game] = global.gameScores[game]
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);
    
    res.json({ success: true, message: '점수가 저장되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '점수 저장 실패' });
  }
});

// 게임 랭킹 조회 (API)
router.get('/rankings', (req, res) => {
  try {
    const { game = 'tetris', limit = 10 } = req.query;
    
    if (!global.gameScores || !global.gameScores[game]) {
      return res.json([]);
    }
    
    const rankings = global.gameScores[game]
      .slice(0, parseInt(limit))
      .map((score, index) => ({
        rank: index + 1,
        ...score
      }));
    
    res.json(rankings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '랭킹 조회 실패' });
  }
});

module.exports = router;
