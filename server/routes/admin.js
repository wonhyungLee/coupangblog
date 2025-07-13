const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const Review = require('../models/Review');
const User = require('../models/User');

// Admin 미들웨어 적용
router.use(isAdmin);

// Admin 대시보드
router.get('/', async (req, res) => {
  try {
    const stats = {
      totalReviews: await Review.countDocuments(),
      publishedReviews: await Review.countDocuments({ status: 'published' }),
      totalUsers: await User.countDocuments(),
      totalViews: await Review.aggregate([
        { $group: { _id: null, total: { $sum: "$views" } } }
      ])
    };
    
    const recentReviews = await Review.find()
      .populate('author', 'username')
      .sort('-createdAt')
      .limit(5);
    
    res.render('admin/dashboard', {
      title: '관리자 대시보드',
      user: req.session.user,
      stats,
      recentReviews
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {
      title: '오류',
      error: { message: '대시보드를 불러올 수 없습니다.' }
    });
  }
});

// 리뷰 작성 페이지
router.get('/reviews/new', (req, res) => {
  res.render('admin/review-editor', {
    title: '새 리뷰 작성',
    user: req.session.user,
    review: null,
    action: '/admin/reviews'
  });
});

// 리뷰 작성 처리
router.post('/reviews', async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      products,
      tags,
      metaTitle,
      metaDescription,
      status
    } = req.body;
    
    // 제품 정보 파싱
    const parsedProducts = JSON.parse(products || '[]');
    
    const review = new Review({
      title,
      content,
      category,
      products: parsedProducts,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      metaTitle,
      metaDescription,
      author: req.session.user.id,
      status,
      publishedAt: status === 'published' ? new Date() : null
    });
    
    await review.save();
    
    res.redirect('/admin/reviews');
  } catch (error) {
    console.error(error);
    res.render('admin/review-editor', {
      title: '새 리뷰 작성',
      user: req.session.user,
      review: req.body,
      action: '/admin/reviews',
      error: '리뷰 저장 중 오류가 발생했습니다.'
    });
  }
});

// 리뷰 목록
router.get('/reviews', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find()
      .populate('author', 'username')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
    
    const totalReviews = await Review.countDocuments();
    const totalPages = Math.ceil(totalReviews / limit);
    
    res.render('admin/reviews', {
      title: '리뷰 관리',
      user: req.session.user,
      reviews,
      currentPage: page,
      totalPages
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {
      title: '오류',
      error: { message: '리뷰 목록을 불러올 수 없습니다.' }
    });
  }
});

// 리뷰 수정 페이지
router.get('/reviews/:id/edit', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).render('404', {
        title: '리뷰를 찾을 수 없습니다'
      });
    }
    
    res.render('admin/review-editor', {
      title: '리뷰 수정',
      user: req.session.user,
      review,
      action: `/admin/reviews/${review._id}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {
      title: '오류',
      error: { message: '리뷰를 불러올 수 없습니다.' }
    });
  }
});

// 리뷰 수정 처리
router.post('/reviews/:id', async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      products,
      tags,
      metaTitle,
      metaDescription,
      status
    } = req.body;
    
    const parsedProducts = JSON.parse(products || '[]');
    
    const updateData = {
      title,
      content,
      category,
      products: parsedProducts,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      metaTitle,
      metaDescription,
      status
    };
    
    if (status === 'published' && !review.publishedAt) {
      updateData.publishedAt = new Date();
    }
    
    await Review.findByIdAndUpdate(req.params.id, updateData);
    
    res.redirect('/admin/reviews');
  } catch (error) {
    console.error(error);
    res.redirect('/admin/reviews');
  }
});

// 리뷰 삭제
router.delete('/reviews/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '삭제 중 오류가 발생했습니다.' });
  }
});

// 사용자 관리
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');
    
    res.render('admin/users', {
      title: '사용자 관리',
      user: req.session.user,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {
      title: '오류',
      error: { message: '사용자 목록을 불러올 수 없습니다.' }
    });
  }
});

// 사용자 권한 변경
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: '유효하지 않은 권한입니다.' });
    }
    
    await User.findByIdAndUpdate(req.params.id, { role });
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '권한 변경 실패' });
  }
});

// SEO 설정
router.get('/seo', (req, res) => {
  res.render('admin/seo', {
    title: 'SEO 설정',
    user: req.session.user
  });
});

// Sitemap 생성
router.post('/generate-sitemap', async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'published' })
      .select('slug updatedAt');
    
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // 홈페이지
    sitemap += `  <url>
    <loc>${process.env.SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>\n`;
    
    // 게임 페이지
    sitemap += `  <url>
    <loc>${process.env.SITE_URL}/game/tetris</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    
    // 리뷰 페이지들
    reviews.forEach(review => {
      sitemap += `  <url>
    <loc>${process.env.SITE_URL}/reviews/${review.slug}</loc>
    <lastmod>${review.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>\n`;
    });
    
    sitemap += '</urlset>';
    
    // sitemap.xml 파일로 저장
    const fs = require('fs').promises;
    await fs.writeFile('./public/sitemap.xml', sitemap);
    
    res.json({ success: true, message: 'Sitemap이 생성되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sitemap 생성 실패' });
  }
});

module.exports = router;
