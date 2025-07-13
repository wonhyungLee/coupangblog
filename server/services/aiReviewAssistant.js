const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIReviewAssistant {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // AI 설정
        this.model = this.genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", // 또는 "gemini-1.5-pro"
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        });
    }

    // 제품 정보 기반 리뷰 개요 생성
    async generateReviewOutline(productData) {
        try {
            const prompt = this.createReviewOutlinePrompt(productData);
            
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return {
                success: true,
                outline: text,
                usage: {
                    promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
                    completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
                    totalTokens: result.response.usageMetadata?.totalTokenCount || 0
                }
            };
        } catch (error) {
            console.error('AI 리뷰 개요 생성 오류:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 제품 비교 분석 생성
    async generateProductComparison(products) {
        try {
            const prompt = this.createComparisonPrompt(products);
            
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return {
                success: true,
                comparison: text,
                usage: {
                    promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
                    completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
                    totalTokens: result.response.usageMetadata?.totalTokenCount || 0
                }
            };
        } catch (error) {
            console.error('AI 제품 비교 생성 오류:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 리뷰 내용 개선 제안
    async improveReviewContent(reviewContent) {
        try {
            const prompt = this.createImprovementPrompt(reviewContent);
            
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return {
                success: true,
                suggestions: text,
                usage: {
                    promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
                    completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
                    totalTokens: result.response.usageMetadata?.totalTokenCount || 0
                }
            };
        } catch (error) {
            console.error('AI 리뷰 개선 제안 오류:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // SEO 최적화 제안
    async generateSEOSuggestions(title, content, category) {
        try {
            const prompt = this.createSEOPrompt(title, content, category);
            
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return {
                success: true,
                seoSuggestions: text,
                usage: {
                    promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
                    completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
                    totalTokens: result.response.usageMetadata?.totalTokenCount || 0
                }
            };
        } catch (error) {
            console.error('AI SEO 제안 생성 오류:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 태그 및 카테고리 제안
    async suggestTagsAndCategories(productData, content) {
        try {
            const prompt = this.createTagsPrompt(productData, content);
            
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // JSON 형태로 파싱 시도
            try {
                const parsed = JSON.parse(text);
                return {
                    success: true,
                    tags: parsed.tags || [],
                    categories: parsed.categories || [],
                    usage: {
                        promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
                        completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
                        totalTokens: result.response.usageMetadata?.totalTokenCount || 0
                    }
                };
            } catch {
                // JSON 파싱 실패 시 텍스트 그대로 반환
                return {
                    success: true,
                    raw: text,
                    usage: {
                        promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
                        completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
                        totalTokens: result.response.usageMetadata?.totalTokenCount || 0
                    }
                };
            }
        } catch (error) {
            console.error('AI 태그 제안 생성 오류:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 프롬프트 생성 함수들
    createReviewOutlinePrompt(productData) {
        return `당신은 전문 제품 리뷰어입니다. 제품 정보를 바탕으로 상세하고 유용한 리뷰 개요를 작성해주세요.

제품 정보:
- 이름: ${productData.name}
- 카테고리: ${productData.category}
- 가격: ${productData.price}원
- 주요 특징: ${productData.features || '정보 없음'}
- 용도: ${productData.usage || '정보 없음'}

다음 구조로 리뷰 개요를 작성해주세요:

1. 제품 소개 (2-3문단)
2. 주요 특징 분석 (3-4개 포인트)
3. 장점 (3-5개)
4. 단점 (2-3개)
5. 사용 후기 (실제 사용 상황별)
6. 가격 대비 만족도
7. 추천 대상
8. 결론 및 평점

각 섹션별로 구체적인 내용과 검토 포인트를 포함해주세요.
쿠팡에서 구매를 고려하는 소비자에게 도움이 되는 실용적인 정보 위주로 작성해주세요.`;
    }

    createComparisonPrompt(products) {
        const productList = products.map((p, index) => 
            `제품 ${index + 1}: ${p.name} (${p.price}원)\n특징: ${p.features || '정보 없음'}`
        ).join('\n\n');

        return `당신은 제품 비교 전문가입니다. 여러 제품을 객관적으로 비교 분석하여 소비자에게 도움이 되는 정보를 제공해주세요.

비교할 제품들:
${productList}

다음 항목들을 비교 분석해주세요:

1. 가격 대비 성능
2. 품질 및 내구성
3. 사용 편의성
4. 디자인 및 외관
5. 브랜드 신뢰도
6. A/S 및 보증
7. 사용자 후기 종합

각 제품의 장단점을 객관적으로 분석하고,
어떤 소비자에게 어떤 제품이 적합한지 구체적인 추천을 해주세요.
표 형태로 정리된 비교도 포함해주세요.`;
    }

    createImprovementPrompt(reviewContent) {
        return `당신은 전문 에디터입니다. 리뷰 내용을 더 읽기 쉽고 유용하게 개선하는 제안을 해주세요.

다음 리뷰 내용을 검토하고 개선 제안을 해주세요:

${reviewContent}

개선 영역:
1. 가독성 향상
2. 정보의 구체성
3. 객관성 확보
4. 실용성 증대
5. SEO 최적화

각 영역별로 구체적인 개선 방안을 제시하고,
수정 예시도 함께 제공해주세요.`;
    }

    createSEOPrompt(title, content, category) {
        return `당신은 SEO 전문가입니다. 블로그 포스트의 검색엔진 최적화를 위한 구체적인 제안을 해주세요.

블로그 포스트 정보:
- 제목: ${title}
- 카테고리: ${category}
- 내용 일부: ${content.substring(0, 500)}...

SEO 최적화를 위한 제안을 해주세요:

1. 메타 제목 개선안 (60자 이내)
2. 메타 설명 개선안 (160자 이내)
3. 키워드 제안 (주요 키워드 5-10개)
4. 헤딩 구조 제안 (H1, H2, H3)
5. 내부 링크 전략
6. 이미지 alt 태그 제안
7. URL 구조 개선안

검색엔진에서 상위 노출되기 위한 구체적인 방법을 제시해주세요.`;
    }

    createTagsPrompt(productData, content) {
        return `당신은 콘텐츠 분류 전문가입니다. 제품과 리뷰 내용을 분석하여 적절한 태그와 카테고리를 제안해주세요.

제품 정보:
- 이름: ${productData.name}
- 카테고리: ${productData.category}

리뷰 내용 요약: ${content.substring(0, 300)}...

JSON 형태로 태그와 카테고리를 제안해주세요:

{
    "tags": ["태그1", "태그2", "태그3"],
    "categories": ["카테고리1", "카테고리2"]
}

태그는 10개 이내, 카테고리는 3개 이내로 제안해주세요.
검색에 도움이 되는 실용적인 태그를 위주로 선정해주세요.`;
    }

    // API 사용량 체크
    async checkAPIUsage() {
        try {
            // Gemini API 사용량 확인
            return {
                success: true,
                message: 'API 사용량 확인 기능은 Google AI Studio에서 확인 가능합니다.'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = AIReviewAssistant;