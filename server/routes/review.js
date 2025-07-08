const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// 리뷰 목록 페이지
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find({ status: 'published' })
      .populate('author', 'username')
      .sort('-publishedAt')
      .skip(skip)
      .limit(limit);
    
    const total = await Review.countDocuments({ status: 'published' });
    
    res.render('review-list', {
      title: '전체 리뷰',
      reviews,
      category: null,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      user: req.session.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {
      title: '오류',
      error: { message: '리뷰 목록을 불러올 수 없습니다.' }
    });
  }
});

// 리뷰 목록 (API)
router.get('/api', async (req, res) => {
  try {
    const { category, tag, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { status: 'published' };
    if (category) query.category = category;
    if (tag) query.tags = tag;
    
    const reviews = await Review.find(query)
      .populate('author', 'username')
      .sort('-publishedAt')
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content');
    
    const total = await Review.countDocuments(query);
    
    res.json({
      reviews,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + reviews.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '리뷰를 불러올 수 없습니다.' });
  }
});

// 리뷰 상세 페이지
router.get('/:slug', async (req, res) => {
  try {
    const review = await Review.findOne({ 
      slug: req.params.slug,
      status: 'published'
    }).populate('author', 'username');
    
    if (!review) {
      return res.status(404).render('404', {
        title: '리뷰를 찾을 수 없습니다'
      });
    }
    
    // 조회수 증가
    review.views += 1;
    await review.save();
    
    // 관련 리뷰 가져오기
    const relatedReviews = await Review.find({
      category: review.category,
      _id: { $ne: review._id },
      status: 'published'
    })
    .limit(3)
    .select('title slug featuredImage category createdAt');
    
    res.render('review-detail', {
      title: review.metaTitle || review.title,
      metaDescription: review.metaDescription,
      review,
      relatedReviews,
      user: req.session.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {
      title: '오류',
      error: { message: '리뷰를 불러올 수 없습니다.' }
    });
  }
});

// 리뷰 좋아요
router.post('/:id/like', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: '리뷰를 찾을 수 없습니다.' });
    }
    
    review.likes += 1;
    await review.save();
    
    res.json({ likes: review.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '좋아요 처리 실패' });
  }
});

// 카테고리별 리뷰 페이지
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find({ 
      category,
      status: 'published'
    })
    .populate('author', 'username')
    .sort('-publishedAt')
    .skip(skip)
    .limit(limit);
    
    const total = await Review.countDocuments({ 
      category,
      status: 'published'
    });
    
    res.render('review-list', {
      title: `${category} 리뷰`,
      reviews,
      category,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      user: req.session.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {
      title: '오류',
      error: { message: '리뷰 목록을 불러올 수 없습니다.' }
    });
  }
});

// 검색
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.redirect('/');
    }
    
    const reviews = await Review.find({
      status: 'published',
      $or: [
        { title: new RegExp(q, 'i') },
        { content: new RegExp(q, 'i') },
        { tags: new RegExp(q, 'i') }
      ]
    })
    .populate('author', 'username')
    .sort('-publishedAt')
    .limit(20);
    
    res.render('search-results', {
      title: `"${q}" 검색 결과`,
      query: q,
      reviews,
      user: req.session.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {
      title: '오류',
      error: { message: '검색 중 오류가 발생했습니다.' }
    });
  }
});

module.exports = router;
