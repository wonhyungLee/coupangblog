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
    const { game, score } = req.body;
    
    // 로그인한 사용자만 점수 저장
    if (!req.session.user) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
    
    // 여기에 점수 저장 로직 추가 가능
    // 예: GameScore 모델 생성 및 저장
    
    res.json({ success: true, message: '점수가 저장되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '점수 저장 실패' });
  }
});

module.exports = router;
