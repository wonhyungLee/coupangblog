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

// 더미 리뷰 데이터
const dummyReviews = [
  {
    _id: 'dummy1',
    title: '삼성 갤럭시 북4 프로 리뷰 - 성능과 휴대성의 완벽한 조화',
    slug: 'samsung-galaxy-book4-pro-review',
    category: '전자제품',
    metaDescription: '삼성 갤럭시 북4 프로의 실사용 후기입니다. 인텔 13세대 프로세서와 AMOLED 디스플레이의 조합이 인상적이었습니다.',
    featuredImage: '/images/default-review.svg',
    author: { username: '테크리뷰어' },
    publishedAt: new Date(Date.now() - 86400000), // 1일 전
    views: 1247,
    likes: 23
  },
  {
    _id: 'dummy2',
    title: '다이슨 V15 무선청소기 6개월 사용 후기',
    slug: 'dyson-v15-review',
    category: '생활용품',
    metaDescription: '다이슨 V15 무선청소기를 6개월간 사용해본 솔직한 후기입니다. 레이저 기술과 강력한 흡입력이 정말 인상적이었어요.',
    featuredImage: '/images/default-review.svg',
    author: { username: '생활리뷰' },
    publishedAt: new Date(Date.now() - 172800000), // 2일 전
    views: 892,
    likes: 18
  },
  {
    _id: 'dummy3',
    title: '나이키 에어맥스 270 착용 후기 - 편안함과 스타일',
    slug: 'nike-airmax-270-review',
    category: '패션',
    metaDescription: '나이키 에어맥스 270을 3개월간 착용해본 후기입니다. 쿠션감과 디자인 모두 만족스러웠습니다.',
    featuredImage: '/images/default-review.svg',
    author: { username: '패션블로거' },
    publishedAt: new Date(Date.now() - 259200000), // 3일 전
    views: 654,
    likes: 15
  },
  {
    _id: 'dummy4',
    title: '홍삼정 제품 비교 리뷰 - 건강을 위한 선택',
    slug: 'red-ginseng-products-review',
    category: '식품',
    metaDescription: '다양한 홍삼정 제품을 비교 체험해본 후기입니다. 가격대비 효과가 좋은 제품들을 추천드려요.',
    featuredImage: '/images/default-review.svg',
    author: { username: '건강리뷰' },
    publishedAt: new Date(Date.now() - 345600000), // 4일 전
    views: 567,
    likes: 12
  },
  {
    _id: 'dummy5',
    title: 'LG 그램 17인치 노트북 장기 사용기',
    slug: 'lg-gram-17-long-term-review',
    category: '전자제품',
    metaDescription: 'LG 그램 17인치 노트북을 1년간 사용해본 장기 후기입니다. 가벼운 무게와 긴 배터리 수명이 최고였어요.',
    featuredImage: '/images/default-review.svg',
    author: { username: '노트북전문가' },
    publishedAt: new Date(Date.now() - 432000000), // 5일 전
    views: 723,
    likes: 19
  },
  {
    _id: 'dummy6',
    title: '아이폰 15 프로 카메라 성능 심층 리뷰',
    slug: 'iphone-15-pro-camera-review',
    category: '전자제품',
    metaDescription: '아이폰 15 프로의 카메라 성능을 다양한 환경에서 테스트해본 결과입니다. 특히 야간 촬영 성능이 놀라웠어요.',
    featuredImage: '/images/default-review.svg',
    author: { username: '사진작가' },
    publishedAt: new Date(Date.now() - 518400000), // 6일 전
    views: 1156,
    likes: 31
  }
];

// 리뷰 목록 (API)
router.get('/api', async (req, res) => {
  try {
    const { category, tag, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { status: 'published' };
    if (category) query.category = category;
    if (tag) query.tags = tag;
    
    let reviews = [];
    let total = 0;
    
    try {
      // 실제 데이터베이스에서 조회 시도
      reviews = await Review.find(query)
        .populate('author', 'username')
        .sort('-publishedAt')
        .skip(skip)
        .limit(parseInt(limit))
        .select('-content');
      
      total = await Review.countDocuments(query);
    } catch (dbError) {
      console.warn('데이터베이스 연결 실패, 더미 데이터 사용:', dbError.message);
      
      // 더미 데이터 사용
      let filteredReviews = dummyReviews;
      if (category) {
        filteredReviews = dummyReviews.filter(review => review.category === category);
      }
      
      total = filteredReviews.length;
      reviews = filteredReviews.slice(skip, skip + parseInt(limit));
    }
    
    // 실제 데이터가 없으면 더미 데이터 사용
    if (reviews.length === 0 && !category && !tag) {
      reviews = dummyReviews.slice(skip, skip + parseInt(limit));
      total = dummyReviews.length;
    }
    
    res.json({
      reviews,
      total,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + reviews.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('API 에러:', error);
    
    // 최종 백업: 더미 데이터 반환
    const filteredReviews = category ? 
      dummyReviews.filter(review => review.category === category) : 
      dummyReviews;
    
    res.json({
      reviews: filteredReviews.slice(0, parseInt(limit)),
      total: filteredReviews.length,
      pagination: {
        current: 1,
        total: Math.ceil(filteredReviews.length / limit),
        hasNext: filteredReviews.length > limit,
        hasPrev: false
      }
    });
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
