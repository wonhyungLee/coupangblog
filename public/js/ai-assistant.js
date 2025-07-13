// AI 리뷰 어시스턴트 클라이언트
class AIReviewAssistant {
    constructor() {
        this.apiBase = '/admin/ai';
        this.isLoading = false;
        this.cache = new Map();
        this.init();
    }

    init() {
        this.setupUI();
        this.bindEvents();
        this.loadAssistantPanel();
    }

    // UI 설정
    setupUI() {
        // AI 어시스턴트 패널이 없으면 생성
        if (!document.getElementById('ai-assistant-panel')) {
            this.createAssistantPanel();
        }
    }

    // AI 어시스턴트 패널 생성
    createAssistantPanel() {
        const panel = document.createElement('div');
        panel.id = 'ai-assistant-panel';
        panel.innerHTML = `
            <div class="ai-panel">
                <div class="ai-header">
                    <h3>🤖 AI 리뷰 어시스턴트</h3>
                    <button class="ai-toggle-btn" onclick="aiAssistant.togglePanel()">
                        <span class="toggle-icon">−</span>
                    </button>
                </div>
                <div class="ai-content">
                    <div class="ai-tabs">
                        <button class="ai-tab active" data-tab="outline">개요 생성</button>
                        <button class="ai-tab" data-tab="compare">제품 비교</button>
                        <button class="ai-tab" data-tab="improve">내용 개선</button>
                        <button class="ai-tab" data-tab="seo">SEO 최적화</button>
                        <button class="ai-tab" data-tab="tags">태그 제안</button>
                    </div>
                    
                    <!-- 개요 생성 탭 -->
                    <div class="ai-tab-content active" id="outline-tab">
                        <h4>리뷰 개요 생성</h4>
                        <div class="ai-form">
                            <input type="text" id="product-name" placeholder="제품명" required>
                            <input type="text" id="product-category" placeholder="카테고리" required>
                            <input type="number" id="product-price" placeholder="가격" required>
                            <textarea id="product-features" placeholder="주요 특징 (선택사항)" rows="3"></textarea>
                            <button onclick="aiAssistant.generateOutline()" class="ai-btn">개요 생성</button>
                        </div>
                        <div id="outline-result" class="ai-result"></div>
                    </div>
                    
                    <!-- 제품 비교 탭 -->
                    <div class="ai-tab-content" id="compare-tab">
                        <h4>제품 비교 분석</h4>
                        <div class="ai-form">
                            <div id="products-list">
                                <div class="product-item">
                                    <input type="text" placeholder="제품명 1" class="product-name">
                                    <input type="number" placeholder="가격 1" class="product-price">
                                    <input type="text" placeholder="특징 1" class="product-features">
                                </div>
                                <div class="product-item">
                                    <input type="text" placeholder="제품명 2" class="product-name">
                                    <input type="number" placeholder="가격 2" class="product-price">
                                    <input type="text" placeholder="특징 2" class="product-features">
                                </div>
                            </div>
                            <button onclick="aiAssistant.addProductField()" class="ai-btn-small">+ 제품 추가</button>
                            <button onclick="aiAssistant.generateComparison()" class="ai-btn">비교 분석</button>
                        </div>
                        <div id="compare-result" class="ai-result"></div>
                    </div>
                    
                    <!-- 내용 개선 탭 -->
                    <div class="ai-tab-content" id="improve-tab">
                        <h4>리뷰 내용 개선</h4>
                        <div class="ai-form">
                            <textarea id="review-content" placeholder="개선할 리뷰 내용을 입력하세요..." rows="8" required></textarea>
                            <button onclick="aiAssistant.improveContent()" class="ai-btn">개선 제안</button>
                        </div>
                        <div id="improve-result" class="ai-result"></div>
                    </div>
                    
                    <!-- SEO 최적화 탭 -->
                    <div class="ai-tab-content" id="seo-tab">
                        <h4>SEO 최적화 제안</h4>
                        <div class="ai-form">
                            <input type="text" id="seo-title" placeholder="리뷰 제목" required>
                            <input type="text" id="seo-category" placeholder="카테고리" required>
                            <textarea id="seo-content" placeholder="리뷰 내용 일부..." rows="5" required></textarea>
                            <button onclick="aiAssistant.generateSEO()" class="ai-btn">SEO 제안</button>
                        </div>
                        <div id="seo-result" class="ai-result"></div>
                    </div>
                    
                    <!-- 태그 제안 탭 -->
                    <div class="ai-tab-content" id="tags-tab">
                        <h4>태그 및 카테고리 제안</h4>
                        <div class="ai-form">
                            <input type="text" id="tags-product-name" placeholder="제품명" required>
                            <input type="text" id="tags-category" placeholder="카테고리" required>
                            <textarea id="tags-content" placeholder="리뷰 내용 요약..." rows="4" required></textarea>
                            <button onclick="aiAssistant.suggestTags()" class="ai-btn">태그 제안</button>
                        </div>
                        <div id="tags-result" class="ai-result"></div>
                    </div>
                    
                    <!-- 빠른 도움말 -->
                    <div class="ai-quick-help">
                        <h4>💡 빠른 도움말</h4>
                        <input type="text" id="quick-question" placeholder="질문을 입력하세요...">
                        <button onclick="aiAssistant.quickHelp()" class="ai-btn-small">질문하기</button>
                        <div id="quick-help-result"></div>
                    </div>
                </div>
            </div>
        `;

        // 패널을 페이지에 추가
        document.body.appendChild(panel);
        
        // CSS 스타일 추가
        this.addAssistantStyles();
    }

    // AI 어시스턴트 스타일 추가
    addAssistantStyles() {
        if (document.getElementById('ai-assistant-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ai-assistant-styles';
        styles.textContent = `
            #ai-assistant-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                max-height: 80vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 9999;
                color: white;
                overflow: hidden;
                transition: all 0.3s ease;
            }

            .ai-panel {
                height: 100%;
                display: flex;
                flex-direction: column;
            }

            .ai-header {
                padding: 15px 20px;
                background: rgba(0,0,0,0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }

            .ai-header h3 {
                margin: 0;
                font-size: 1.1rem;
            }

            .ai-toggle-btn {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.2rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ai-content {
                padding: 20px;
                flex: 1;
                overflow-y: auto;
                max-height: calc(80vh - 60px);
            }

            .ai-tabs {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-bottom: 20px;
            }

            .ai-tab {
                background: rgba(255,255,255,0.1);
                border: none;
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 0.85rem;
                transition: all 0.2s ease;
            }

            .ai-tab.active {
                background: rgba(255,255,255,0.3);
                font-weight: bold;
            }

            .ai-tab:hover {
                background: rgba(255,255,255,0.2);
            }

            .ai-tab-content {
                display: none;
            }

            .ai-tab-content.active {
                display: block;
            }

            .ai-tab-content h4 {
                margin: 0 0 15px 0;
                font-size: 1rem;
                opacity: 0.9;
            }

            .ai-form {
                margin-bottom: 15px;
            }

            .ai-form input,
            .ai-form textarea {
                width: 100%;
                margin-bottom: 10px;
                padding: 10px;
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 8px;
                background: rgba(255,255,255,0.1);
                color: white;
                font-size: 0.9rem;
            }

            .ai-form input::placeholder,
            .ai-form textarea::placeholder {
                color: rgba(255,255,255,0.6);
            }

            .ai-btn {
                width: 100%;
                padding: 12px;
                background: linear-gradient(45deg, #4CAF50, #45a049);
                border: none;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .ai-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
            }

            .ai-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .ai-btn-small {
                padding: 8px 16px;
                background: rgba(255,255,255,0.2);
                border: none;
                border-radius: 6px;
                color: white;
                cursor: pointer;
                font-size: 0.85rem;
                margin-right: 10px;
                margin-bottom: 10px;
            }

            .ai-result {
                margin-top: 15px;
                padding: 15px;
                background: rgba(255,255,255,0.1);
                border-radius: 8px;
                white-space: pre-wrap;
                max-height: 300px;
                overflow-y: auto;
                font-size: 0.9rem;
                line-height: 1.5;
                display: none;
            }

            .ai-result.show {
                display: block;
            }

            .product-item {
                margin-bottom: 15px;
                padding: 10px;
                background: rgba(255,255,255,0.05);
                border-radius: 8px;
            }

            .ai-quick-help {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid rgba(255,255,255,0.1);
            }

            .ai-quick-help h4 {
                margin: 0 0 10px 0;
                font-size: 0.95rem;
            }

            .ai-quick-help input {
                margin-bottom: 10px;
            }

            #quick-help-result {
                margin-top: 10px;
                padding: 10px;
                background: rgba(255,255,255,0.05);
                border-radius: 6px;
                font-size: 0.85rem;
                display: none;
            }

            .ai-loading {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s ease-in-out infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .ai-error {
                color: #ff6b6b;
                background: rgba(255, 107, 107, 0.1);
                padding: 10px;
                border-radius: 6px;
                margin-top: 10px;
            }

            .ai-success {
                color: #51cf66;
                background: rgba(81, 207, 102, 0.1);
                padding: 10px;
                border-radius: 6px;
                margin-top: 10px;
            }

            /* 모바일 반응형 */
            @media (max-width: 768px) {
                #ai-assistant-panel {
                    width: calc(100vw - 40px);
                    right: 20px;
                    left: 20px;
                    max-height: 70vh;
                }
                
                .ai-tabs {
                    justify-content: center;
                }
                
                .ai-tab {
                    font-size: 0.8rem;
                    padding: 6px 10px;
                }
            }

            /* 패널 숨김 상태 */
            #ai-assistant-panel.collapsed {
                height: 60px;
                overflow: hidden;
            }

            #ai-assistant-panel.collapsed .ai-content {
                display: none;
            }
        `;

        document.head.appendChild(styles);
    }

    // 이벤트 바인딩
    bindEvents() {
        // 탭 클릭 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('ai-tab')) {
                this.switchTab(e.target.dataset.tab);
            }
        });

        // 엔터키 이벤트
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.id === 'quick-question') {
                this.quickHelp();
            }
        });
    }

    // 패널 토글
    togglePanel() {
        const panel = document.getElementById('ai-assistant-panel');
        panel.classList.toggle('collapsed');
        
        const icon = panel.querySelector('.toggle-icon');
        icon.textContent = panel.classList.contains('collapsed') ? '+' : '−';
    }

    // 탭 전환
    switchTab(tabName) {
        // 모든 탭 비활성화
        document.querySelectorAll('.ai-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.ai-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // 선택된 탭 활성화
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    // 로딩 상태 표시
    showLoading(buttonElement, show = true) {
        if (show) {
            buttonElement.disabled = true;
            buttonElement.innerHTML = '<span class="ai-loading"></span> 생성 중...';
        } else {
            buttonElement.disabled = false;
            buttonElement.innerHTML = buttonElement.dataset.originalText || '생성';
        }
    }

    // API 호출 공통 함수
    async callAPI(endpoint, data) {
        try {
            this.isLoading = true;
            
            const response = await fetch(`${this.apiBase}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'API 호출 실패');
            }

            return result;
        } catch (error) {
            console.error('AI API 호출 오류:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    // 결과 표시 공통 함수
    showResult(containerId, content, type = 'success') {
        const container = document.getElementById(containerId);
        container.className = `ai-result show ${type}`;
        
        if (typeof content === 'object') {
            container.innerHTML = `<pre>${JSON.stringify(content, null, 2)}</pre>`;
        } else {
            container.innerHTML = content.replace(/\n/g, '<br>');
        }
        
        container.scrollTop = 0;
    }

    // 오류 표시
    showError(containerId, message) {
        this.showResult(containerId, `❌ 오류: ${message}`, 'ai-error');
    }

    // 1. 리뷰 개요 생성
    async generateOutline() {
        const button = event.target;
        const originalText = button.textContent;
        button.dataset.originalText = originalText;

        try {
            this.showLoading(button);

            const productData = {
                name: document.getElementById('product-name').value,
                category: document.getElementById('product-category').value,
                price: document.getElementById('product-price').value,
                features: document.getElementById('product-features').value
            };

            if (!productData.name || !productData.category || !productData.price) {
                throw new Error('제품명, 카테고리, 가격은 필수입니다.');
            }

            const result = await this.callAPI('/generate-outline', { productData });
            this.showResult('outline-result', result.outline);

        } catch (error) {
            this.showError('outline-result', error.message);
        } finally {
            this.showLoading(button, false);
        }
    }

    // 2. 제품 비교 분석
    async generateComparison() {
        const button = event.target;
        const originalText = button.textContent;
        button.dataset.originalText = originalText;

        try {
            this.showLoading(button);

            const products = [];
            document.querySelectorAll('.product-item').forEach(item => {
                const name = item.querySelector('.product-name').value;
                const price = item.querySelector('.product-price').value;
                const features = item.querySelector('.product-features').value;

                if (name && price) {
                    products.push({ name, price: Number(price), features });
                }
            });

            if (products.length < 2) {
                throw new Error('비교할 제품을 최소 2개 이상 입력해주세요.');
            }

            const result = await this.callAPI('/generate-comparison', { products });
            this.showResult('compare-result', result.comparison);

        } catch (error) {
            this.showError('compare-result', error.message);
        } finally {
            this.showLoading(button, false);
        }
    }

    // 3. 리뷰 내용 개선
    async improveContent() {
        const button = event.target;
        const originalText = button.textContent;
        button.dataset.originalText = originalText;

        try {
            this.showLoading(button);

            const content = document.getElementById('review-content').value;

            if (!content || content.trim().length < 50) {
                throw new Error('분석할 리뷰 내용이 너무 짧습니다. (최소 50자)');
            }

            const result = await this.callAPI('/improve-content', { content });
            this.showResult('improve-result', result.suggestions);

        } catch (error) {
            this.showError('improve-result', error.message);
        } finally {
            this.showLoading(button, false);
        }
    }

    // 4. SEO 최적화 제안
    async generateSEO() {
        const button = event.target;
        const originalText = button.textContent;
        button.dataset.originalText = originalText;

        try {
            this.showLoading(button);

            const title = document.getElementById('seo-title').value;
            const category = document.getElementById('seo-category').value;
            const content = document.getElementById('seo-content').value;

            if (!title || !category || !content) {
                throw new Error('제목, 카테고리, 내용은 필수입니다.');
            }

            const result = await this.callAPI('/seo-suggestions', { title, category, content });
            this.showResult('seo-result', result.seoSuggestions);

        } catch (error) {
            this.showError('seo-result', error.message);
        } finally {
            this.showLoading(button, false);
        }
    }

    // 5. 태그 제안
    async suggestTags() {
        const button = event.target;
        const originalText = button.textContent;
        button.dataset.originalText = originalText;

        try {
            this.showLoading(button);

            const productData = {
                name: document.getElementById('tags-product-name').value,
                category: document.getElementById('tags-category').value
            };
            const content = document.getElementById('tags-content').value;

            if (!productData.name || !productData.category || !content) {
                throw new Error('제품명, 카테고리, 내용은 필수입니다.');
            }

            const result = await this.callAPI('/suggest-tags', { productData, content });
            
            let displayContent;
            if (result.tags && result.categories) {
                displayContent = `🏷️ 추천 태그:\n${result.tags.join(', ')}\n\n📁 추천 카테고리:\n${result.categories.join(', ')}`;
            } else {
                displayContent = result.raw || '태그 제안을 생성했습니다.';
            }
            
            this.showResult('tags-result', displayContent);

        } catch (error) {
            this.showError('tags-result', error.message);
        } finally {
            this.showLoading(button, false);
        }
    }

    // 제품 필드 추가
    addProductField() {
        const productsList = document.getElementById('products-list');
        const count = productsList.children.length + 1;
        
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <input type="text" placeholder="제품명 ${count}" class="product-name">
            <input type="number" placeholder="가격 ${count}" class="product-price">
            <input type="text" placeholder="특징 ${count}" class="product-features">
            <button onclick="this.parentElement.remove()" class="ai-btn-small" style="background: #e74c3c;">삭제</button>
        `;
        
        productsList.appendChild(productItem);
    }

    // 빠른 도움말
    async quickHelp() {
        const question = document.getElementById('quick-question').value;
        if (!question) return;

        try {
            const result = await this.callAPI('/quick-help', { question });
            
            const helpResult = document.getElementById('quick-help-result');
            helpResult.style.display = 'block';
            helpResult.innerHTML = `
                <strong>Q: ${result.question}</strong><br><br>
                <strong>A:</strong> ${result.answer}<br><br>
                ${result.suggestions ? `<strong>💡 추천:</strong><br>${result.suggestions.join('<br>')}` : ''}
            `;

        } catch (error) {
            const helpResult = document.getElementById('quick-help-result');
            helpResult.style.display = 'block';
            helpResult.innerHTML = `❌ 오류: ${error.message}`;
        }
    }

    // 기존 폼 데이터로 자동 채우기
    autoFillFromForm() {
        // 리뷰 에디터에서 데이터 가져오기
        const titleElement = document.querySelector('input[name="title"]');
        const categoryElement = document.querySelector('select[name="category"]');
        const contentElement = document.querySelector('textarea[name="content"]');

        if (titleElement && titleElement.value) {
            // SEO 탭 자동 채우기
            document.getElementById('seo-title').value = titleElement.value;
        }

        if (categoryElement && categoryElement.value) {
            document.getElementById('seo-category').value = categoryElement.value;
            document.getElementById('tags-category').value = categoryElement.value;
        }

        if (contentElement && contentElement.value) {
            document.getElementById('seo-content').value = contentElement.value.substring(0, 500);
            document.getElementById('review-content').value = contentElement.value;
            document.getElementById('tags-content').value = contentElement.value.substring(0, 300);
        }
    }

    // 결과를 폼에 적용
    applyToForm(type, data) {
        switch (type) {
            case 'outline':
                const contentTextarea = document.querySelector('textarea[name="content"]');
                if (contentTextarea) {
                    contentTextarea.value = data;
                }
                break;
                
            case 'seo':
                const metaTitleInput = document.querySelector('input[name="metaTitle"]');
                const metaDescInput = document.querySelector('input[name="metaDescription"]');
                
                // SEO 데이터에서 메타 제목과 설명 추출 (정규식 사용)
                const titleMatch = data.match(/메타 제목[:\s]*([^\n]+)/);
                const descMatch = data.match(/메타 설명[:\s]*([^\n]+)/);
                
                if (metaTitleInput && titleMatch) {
                    metaTitleInput.value = titleMatch[1].trim();
                }
                if (metaDescInput && descMatch) {
                    metaDescInput.value = descMatch[1].trim();
                }
                break;
                
            case 'tags':
                const tagsInput = document.querySelector('input[name="tags"]');
                if (tagsInput && data.tags) {
                    tagsInput.value = data.tags.join(', ');
                }
                break;
        }
    }
}

// AI 어시스턴트 초기화
let aiAssistant;

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 관리자 페이지에서만 로드
    if (window.location.pathname.includes('/admin')) {
        aiAssistant = new AIReviewAssistant();
        
        // 기존 폼이 있으면 자동 채우기
        setTimeout(() => {
            if (aiAssistant) {
                aiAssistant.autoFillFromForm();
            }
        }, 1000);
    }
});

// 전역 접근 가능하도록 설정
window.aiAssistant = aiAssistant;
