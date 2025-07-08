// 리뷰 페이지 동적 로더

// API 기본 설정
const API_BASE = '/api';

// 현재 리뷰 정보
let currentReview = null;

// API 요청 헬퍼
async function apiRequest(method, endpoint, data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || '요청 실패');
        }
        
        return result;
    } catch (error) {
        console.error('API 요청 오류:', error);
        throw error;
    }
}

// URL에서 slug 추출
function getSlugFromUrl() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];
}

// 카테고리 이름 변환
function getCategoryName(category) {
    const names = {
        electronics: '전자제품',
        beauty: '뷰티',
        fashion: '패션',
        home: '홈&리빙',
        food: '식품'
    };
    return names[category] || category;
}

// 리뷰 로드
async function loadReview() {
    const slug = getSlugFromUrl();
    
    if (!slug) {
        showError();
        return;
    }
    
    try {
        // 리뷰 데이터 가져오기
        const result = await apiRequest('GET', `/reviews/${slug}`);
        currentReview = result.data;
        
        // 페이지 렌더링
        renderReview(currentReview);
        
        // 관련 콘텐츠 로드
        loadRelatedReviews(currentReview.category, currentReview.id);
        loadPopularReviews();
        
        // 로딩 완료
        hideLoading();
        
    } catch (error) {
        console.error('리뷰 로드 오류:', error);
        showError();
    }
}

// 리뷰 렌더링
function renderReview(review) {
    // 페이지 제목 업데이트
    document.title = `${review.title} - Wongram Shop`;
    
    // 메타 태그 업데이트
    updateMetaTags(review);
    
    // breadcrumb 업데이트
    const categoryLink = document.getElementById('categoryLink');
    categoryLink.innerHTML = `<a href="/?category=${review.category}">${getCategoryName(review.category)}</a>`;
    document.getElementById('reviewTitle').textContent = review.title;
    
    // 헤더 정보
    document.getElementById('mainTitle').textContent = review.title;
    document.getElementById('reviewDate').textContent = new Date(review.created_at).toLocaleDateString('ko-KR');
    document.getElementById('viewCount').textContent = `조회수: ${review.views || 0}`;
    
    // 본문 내용
    const contentDiv = document.getElementById('reviewContent');
    contentDiv.innerHTML = review.content;
    
    // 상품 정보가 있으면 추가
    if (review.products && review.products.length > 0) {
        renderProducts(review.products);
    }
    
    // 구조화된 데이터 추가
    addStructuredData(review);
}

// 상품 정보 렌더링
function renderProducts(products) {
    const productHtml = products.map((product, index) => `
        <div class="product-widget">
            <h3>${product.name}</h3>
            ${product.price ? `<p class="product-price">가격: ${product.price}</p>` : ''}
            ${product.rating ? `
                <div class="product-rating">
                    <span class="stars">${'★'.repeat(Math.floor(product.rating))}</span>
                    <span class="rating-value">${product.rating}/5.0</span>
                </div>
            ` : ''}
            <a href="${product.url}" class="buy-button" target="_blank" rel="nofollow" onclick="trackProductClick('${product.name}', ${index})">
                쿠팡에서 최저가 확인하기
            </a>
        </div>
    `).join('');
    
    // 첫 번째 h2 태그 뒤에 삽입하거나 본문 시작 부분에 삽입
    const contentDiv = document.getElementById('reviewContent');
    const firstH2 = contentDiv.querySelector('h2');
    
    const productContainer = document.createElement('div');
    productContainer.className = 'products-container';
    productContainer.innerHTML = productHtml;
    
    if (firstH2) {
        firstH2.insertAdjacentElement('afterend', productContainer);
    } else {
        contentDiv.insertAdjacentElement('afterbegin', productContainer);
    }
}

// 메타 태그 업데이트
function updateMetaTags(review) {
    // 기본 메타 태그
    const metaDescription = document.querySelector('meta[name="description"]');
    metaDescription.content = review.meta_description || review.excerpt || review.title;
    
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    metaKeywords.content = review.keywords || '제품 리뷰, 쿠팡, 쇼핑 가이드';
    
    // Open Graph 태그
    const ogUrl = document.querySelector('meta[property="og:url"]');
    ogUrl.content = window.location.href;
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    ogTitle.content = review.title;
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    ogDescription.content = review.meta_description || review.excerpt || review.title;
    
    // canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
}

// 구조화된 데이터 추가
function addStructuredData(review) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": review.title,
        "description": review.meta_description || review.excerpt,
        "datePublished": review.created_at,
        "dateModified": review.updated_at,
        "author": {
            "@type": "Person",
            "name": "Wongram"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Wongram Shop",
            "logo": {
                "@type": "ImageObject",
                "url": "https://wongram.shop/images/logo.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": window.location.href
        }
    };
    
    // 상품 정보가 있으면 추가
    if (review.products && review.products.length > 0) {
        structuredData.mentions = review.products.map(product => ({
            "@type": "Product",
            "name": product.name,
            "offers": {
                "@type": "Offer",
                "price": product.price ? product.price.replace(/[^0-9]/g, '') : undefined,
                "priceCurrency": "KRW",
                "availability": "https://schema.org/InStock"
            }
        }));
    }
    
    const script = document.getElementById('structuredData');
    script.textContent = JSON.stringify(structuredData);
}

// 관련 리뷰 로드
async function loadRelatedReviews(category, currentId) {
    try {
        const result = await apiRequest('GET', `/reviews?category=${category}&limit=4`);
        const reviews = result.data.filter(r => r.id !== currentId).slice(0, 3);
        
        const relatedGrid = document.getElementById('relatedReviews');
        
        if (reviews.length > 0) {
            relatedGrid.innerHTML = reviews.map(review => `
                <div class="related-item">
                    <a href="/review/${review.slug}">
                        <img src="https://via.placeholder.com/300x200" alt="${review.title}">
                        <h3>${review.title}</h3>
                    </a>
                </div>
            `).join('');
        } else {
            // 샘플 관련 리뷰
            relatedGrid.innerHTML = `
                <div class="related-item">
                    <a href="#">
                        <img src="https://via.placeholder.com/300x200" alt="관련 리뷰">
                        <h3>이 카테고리의 다른 제품 리뷰</h3>
                    </a>
                </div>
                <div class="related-item">
                    <a href="#">
                        <img src="https://via.placeholder.com/300x200" alt="추천 리뷰">
                        <h3>비슷한 가격대 제품 비교</h3>
                    </a>
                </div>
                <div class="related-item">
                    <a href="#">
                        <img src="https://via.placeholder.com/300x200" alt="인기 리뷰">
                        <h3>이 달의 베스트 상품</h3>
                    </a>
                </div>
            `;
        }
    } catch (error) {
        console.error('관련 리뷰 로드 오류:', error);
    }
}

// 인기 리뷰 로드
async function loadPopularReviews() {
    try {
        const result = await apiRequest('GET', '/reviews?limit=5');
        const reviews = result.data;
        
        const popularList = document.getElementById('popularReviews');
        
        if (reviews.length > 0) {
            popularList.innerHTML = reviews.map(review => `
                <li><a href="/review/${review.slug}">${review.title}</a></li>
            `).join('');
        } else {
            // 샘플 인기 리뷰
            popularList.innerHTML = `
                <li><a href="#">다이슨 무선청소기 V15 vs V12 비교</a></li>
                <li><a href="#">2024년 로봇청소기 완벽 가이드</a></li>
                <li><a href="#">삼성 vs LG 공기청정기 비교</a></li>
                <li><a href="#">무선 이어폰 구매 가이드</a></li>
                <li><a href="#">홈 인테리어 필수템 TOP 10</a></li>
            `;
        }
    } catch (error) {
        console.error('인기 리뷰 로드 오류:', error);
    }
}

// 상품 클릭 추적
function trackProductClick(productName, index) {
    console.log('Product clicked:', productName, index);
    
    // GA 이벤트 전송
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
            'event_category': 'coupang_product',
            'event_label': productName,
            'value': index
        });
    }
}

// 로딩 숨기기
function hideLoading() {
    document.getElementById('loadingIndicator').style.display = 'none';
    document.getElementById('reviewMain').style.display = 'block';
}

// 오류 표시
function showError() {
    document.getElementById('loadingIndicator').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'block';
}

// 테트리스 게임 추천 타이머
function setupTetrisTimer() {
    // 페이지에 2분 이상 머문 경우 테트리스 추천
    setTimeout(() => {
        const tetrisPromo = document.querySelector('.tetris-promotion-section');
        if (tetrisPromo) {
            tetrisPromo.classList.add('highlight');
            
            // 5초 후 하이라이트 제거
            setTimeout(() => {
                tetrisPromo.classList.remove('highlight');
            }, 5000);
        }
    }, 120000); // 2분
}

// 스크롤 기반 테트리스 추천
function setupScrollTetrisPromotion() {
    let promoted = false;
    const contentHeight = document.getElementById('reviewContent').offsetHeight;
    
    window.addEventListener('scroll', () => {
        if (promoted) return;
        
        const scrollPosition = window.scrollY;
        const scrollPercentage = (scrollPosition / contentHeight) * 100;
        
        // 콘텐츠의 70% 이상 읽었을 때
        if (scrollPercentage > 70) {
            promoted = true;
            showTetrisNotification();
        }
    });
}

// 테트리스 알림 표시
function showTetrisNotification() {
    const notification = document.createElement('div');
    notification.className = 'tetris-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">🎮</span>
            <span class="notification-text">잠깐 쉬어가실래요? 테트리스 한 판!</span>
            <a href="/tetris-game" target="_blank" class="notification-button">플레이</a>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 애니메이션
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 15초 후 자동 제거
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 15000);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async function() {
    // 리뷰 로드
    await loadReview();
    
    // 테트리스 프로모션 설정
    setupTetrisTimer();
    setupScrollTetrisPromotion();
    
    // 관리자 버튼 표시 확인
    if (localStorage.getItem('adminAuth')) {
        const adminButton = document.createElement('div');
        adminButton.className = 'admin-button';
        adminButton.innerHTML = '⚙️';
        adminButton.onclick = () => window.location.href = '/admin.html';
        document.body.appendChild(adminButton);
    }
});

// 스타일 추가
const style = document.createElement('style');
style.textContent = `
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #ff6b35;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error-container {
    text-align: center;
    padding: 60px 20px;
}

.back-home-button {
    display: inline-block;
    margin-top: 20px;
    padding: 12px 24px;
    background: #ff6b35;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    transition: background 0.3s;
}

.back-home-button:hover {
    background: #e55a2b;
}

.products-container {
    margin: 30px 0;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
}

.product-widget {
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.product-widget h3 {
    margin-top: 0;
    color: #333;
}

.product-price {
    font-size: 20px;
    font-weight: bold;
    color: #ff6b35;
    margin: 10px 0;
}

.product-rating {
    margin: 10px 0;
}

.stars {
    color: #ffa500;
    font-size: 18px;
}

.buy-button {
    display: inline-block;
    padding: 12px 30px;
    background: #ff6b35;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: bold;
    transition: all 0.3s;
}

.buy-button:hover {
    background: #e55a2b;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.tetris-promotion-section {
    margin: 40px 0;
    text-align: center;
    transition: all 0.3s;
}

.tetris-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
}

.tetris-card h3 {
    margin-top: 0;
    font-size: 24px;
}

.tetris-play-button {
    display: inline-block;
    margin: 15px 0;
    padding: 15px 40px;
    background: white;
    color: #667eea;
    text-decoration: none;
    border-radius: 30px;
    font-weight: bold;
    font-size: 18px;
    transition: all 0.3s;
}

.tetris-play-button:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 20px rgba(255,255,255,0.3);
}

.tetris-promotion-section.highlight {
    animation: pulse 2s ease-in-out 3;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
}

.tetris-notification {
    position: fixed;
    bottom: 20px;
    right: -400px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    transition: right 0.3s ease;
    z-index: 1000;
    max-width: 350px;
}

.tetris-notification.show {
    right: 20px;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 15px;
}

.notification-icon {
    font-size: 30px;
}

.notification-text {
    flex: 1;
}

.notification-button {
    padding: 8px 20px;
    background: white;
    color: #667eea;
    text-decoration: none;
    border-radius: 20px;
    font-weight: bold;
}

.notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    margin-left: 10px;
}

.tetris-widget {
    margin-top: 30px;
}

.tetris-mini-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
}

.tetris-mini-banner .tetris-icon {
    font-size: 40px;
    margin-bottom: 10px;
}

.tetris-mini-banner h4 {
    margin: 10px 0;
}

.tetris-link {
    display: inline-block;
    margin-top: 10px;
    padding: 8px 20px;
    background: white;
    color: #667eea;
    text-decoration: none;
    border-radius: 20px;
    font-weight: bold;
    transition: all 0.3s;
}

.tetris-link:hover {
    transform: scale(1.05);
}

.admin-button {
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 50px;
    height: 50px;
    background: #333;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
    z-index: 1000;
    font-size: 20px;
}

.admin-button:hover {
    background: #555;
}

@media (max-width: 768px) {
    .tetris-notification {
        right: 10px;
        left: 10px;
        max-width: none;
    }
    
    .notification-content {
        flex-wrap: wrap;
    }
    
    .tetris-card {
        padding: 20px;
    }
    
    .tetris-play-button {
        padding: 12px 30px;
        font-size: 16px;
    }
}
`;
document.head.appendChild(style);