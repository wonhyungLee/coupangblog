const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const AIReviewAssistant = require('../services/aiReviewAssistant');

// AI 어시스턴트 인스턴스 생성
const aiAssistant = new AIReviewAssistant();

// 모든 AI 기능은 관리자만 사용 가능
router.use(isAdmin);

// 리뷰 개요 생성
router.post('/generate-outline', async (req, res) => {
    try {
        const { productData } = req.body;
        
        if (!productData || !productData.name || !productData.category) {
            return res.status(400).json({
                success: false,
                error: '제품 이름과 카테고리는 필수입니다.'
            });
        }

        const result = await aiAssistant.generateReviewOutline(productData);
        
        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('리뷰 개요 생성 오류:', error);
        res.status(500).json({
            success: false,
            error: '리뷰 개요 생성 중 오류가 발생했습니다.'
        });
    }
});

// 제품 비교 분석 생성
router.post('/generate-comparison', async (req, res) => {
    try {
        const { products } = req.body;
        
        if (!products || !Array.isArray(products) || products.length < 2) {
            return res.status(400).json({
                success: false,
                error: '비교할 제품을 최소 2개 이상 제공해주세요.'
            });
        }

        const result = await aiAssistant.generateProductComparison(products);
        
        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('제품 비교 생성 오류:', error);
        res.status(500).json({
            success: false,
            error: '제품 비교 분석 생성 중 오류가 발생했습니다.'
        });
    }
});

// 리뷰 내용 개선 제안
router.post('/improve-content', async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content || content.trim().length < 50) {
            return res.status(400).json({
                success: false,
                error: '분석할 리뷰 내용이 너무 짧습니다. (최소 50자)'
            });
        }

        const result = await aiAssistant.improveReviewContent(content);
        
        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('리뷰 개선 제안 오류:', error);
        res.status(500).json({
            success: false,
            error: '리뷰 개선 제안 생성 중 오류가 발생했습니다.'
        });
    }
});

// SEO 최적화 제안
router.post('/seo-suggestions', async (req, res) => {
    try {
        const { title, content, category } = req.body;
        
        if (!title || !content || !category) {
            return res.status(400).json({
                success: false,
                error: '제목, 내용, 카테고리는 필수입니다.'
            });
        }

        const result = await aiAssistant.generateSEOSuggestions(title, content, category);
        
        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('SEO 제안 생성 오류:', error);
        res.status(500).json({
            success: false,
            error: 'SEO 제안 생성 중 오류가 발생했습니다.'
        });
    }
});

// 태그 및 카테고리 제안
router.post('/suggest-tags', async (req, res) => {
    try {
        const { productData, content } = req.body;
        
        if (!productData || !content) {
            return res.status(400).json({
                success: false,
                error: '제품 정보와 리뷰 내용은 필수입니다.'
            });
        }

        const result = await aiAssistant.suggestTagsAndCategories(productData, content);
        
        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('태그 제안 생성 오류:', error);
        res.status(500).json({
            success: false,
            error: '태그 제안 생성 중 오류가 발생했습니다.'
        });
    }
});

// AI 어시스턴트 대시보드 (사용량 등)
router.get('/dashboard', async (req, res) => {
    try {
        const usage = await aiAssistant.checkAPIUsage();
        
        res.json({
            success: true,
            features: [
                {
                    name: '리뷰 개요 생성',
                    description: '제품 정보를 바탕으로 리뷰 구조와 내용 제안',
                    endpoint: '/ai/generate-outline'
                },
                {
                    name: '제품 비교 분석',
                    description: '여러 제품을 객관적으로 비교 분석',
                    endpoint: '/ai/generate-comparison'
                },
                {
                    name: '리뷰 개선 제안',
                    description: '기존 리뷰 내용의 품질 향상 제안',
                    endpoint: '/ai/improve-content'
                },
                {
                    name: 'SEO 최적화',
                    description: '검색엔진 최적화를 위한 구체적 제안',
                    endpoint: '/ai/seo-suggestions'
                },
                {
                    name: '태그 제안',
                    description: '콘텐츠에 적합한 태그와 카테고리 제안',
                    endpoint: '/ai/suggest-tags'
                }
            ],
            usage
        });
    } catch (error) {
        console.error('AI 대시보드 조회 오류:', error);
        res.status(500).json({
            success: false,
            error: 'AI 대시보드 정보를 불러올 수 없습니다.'
        });
    }
});

// 빠른 도움말 생성 (간단한 질문 답변)
router.post('/quick-help', async (req, res) => {
    try {
        const { question, context } = req.body;
        
        if (!question) {
            return res.status(400).json({
                success: false,
                error: '질문을 입력해주세요.'
            });
        }

        // 간단한 도움말 시스템
        const quickAnswers = {
            '리뷰 작성법': '좋은 리뷰 작성을 위해서는 1) 제품 기본 정보, 2) 실제 사용 경험, 3) 장단점 분석, 4) 가격 대비 만족도, 5) 구매 추천 여부를 포함하세요.',
            'SEO 최적화': 'SEO 최적화를 위해 1) 키워드가 포함된 제목, 2) 메타 설명 작성, 3) 헤딩 태그 활용, 4) 내부 링크 연결, 5) 이미지 alt 태그를 설정하세요.',
            '제품 비교': '제품 비교 시 1) 동일 카테고리 제품 선택, 2) 가격대별 분류, 3) 핵심 기능 비교표, 4) 사용자별 추천 대상을 명확히 하세요.',
            '태그 선택': '효과적인 태그는 1) 제품명, 2) 브랜드, 3) 카테고리, 4) 주요 기능, 5) 가격대, 6) 타겟 사용자를 포함하세요.'
        };

        // 키워드 매칭
        let answer = '죄송합니다. 해당 질문에 대한 답변을 찾을 수 없습니다. AI 어시스턴트 기능을 이용해보세요.';
        
        for (const [keyword, response] of Object.entries(quickAnswers)) {
            if (question.includes(keyword)) {
                answer = response;
                break;
            }
        }

        res.json({
            success: true,
            question,
            answer,
            suggestions: [
                'AI 리뷰 개요 생성 사용해보기',
                'SEO 최적화 제안 받기',
                '제품 비교 분석 요청하기'
            ]
        });
    } catch (error) {
        console.error('빠른 도움말 오류:', error);
        res.status(500).json({
            success: false,
            error: '도움말 생성 중 오류가 발생했습니다.'
        });
    }
});

// AI 피드백 수집
router.post('/feedback', async (req, res) => {
    try {
        const { feature, rating, comment, aiResponse } = req.body;
        
        // 실제로는 데이터베이스에 저장
        console.log('AI 피드백 수집:', {
            feature,
            rating,
            comment,
            aiResponse: aiResponse ? 'AI 응답 포함됨' : '없음',
            timestamp: new Date(),
            userId: req.session.user.id
        });

        res.json({
            success: true,
            message: '피드백이 성공적으로 수집되었습니다. 서비스 개선에 활용하겠습니다.'
        });
    } catch (error) {
        console.error('피드백 수집 오류:', error);
        res.status(500).json({
            success: false,
            error: '피드백 수집 중 오류가 발생했습니다.'
        });
    }
});

module.exports = router;
