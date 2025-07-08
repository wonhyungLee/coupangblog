// 쿠팡파트너스 블로그 메인 스크립트 (서버 API 연동 버전)

// API 기본 설정
const API_BASE = '/api';

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

// 쿠팡파트너스 클릭 추적
function trackClick(productId) {
    // 클릭 추적
    console.log('Product clicked:', productId);
    
    // GA 이벤트 전송 (있는 경우)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
            'event_category': 'coupang_product',
            'event_label': productId
        });
    }
}

// 검색 기능
async function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    
    if (!searchTerm) {
        alert('검색어를 입력해주세요.');
        return;
    }
    
    // 검색 결과 페이지로 이동
    window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
}

// 카테고리 표시
function showCategory(category) {
    // 모든 탭 버튼에서 active 클래스 제거
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 클릭된 탭에 active 클래스 추가
    event.target.classList.add('active');
    
    // 카테고리별 상품 로드
    loadCategoryProducts(category);
}

// 카테고리별 상품 로드
async function loadCategoryProducts(category) {
    const categoryContent = document.getElementById('categoryContent');
    
    // 로딩 표시
    categoryContent.innerHTML = '<div class="loading">상품을 불러오는 중...</div>';
    
    try {
        // 카테고리별 리뷰 가져오기
        const result = await apiRequest('GET', `/reviews?category=${category}&limit=6`);
        const reviews = result.data;
        
        if (reviews.length === 0) {
            // 리뷰가 없으면 샘플 데이터 표시
            showSampleProducts(category);
            return;
        }
        
        let html = '<div class="product-grid">';
        reviews.forEach(review => {
            html += `
                <div class="product-card">
                    <div class="product-image">
                        <img src="https://via.placeholder.com/300x300" alt="${review.title}">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">
                            <a href="/review/${review.slug}">${review.title}</a>
                        </h3>
                        <p class="product-excerpt">${review.excerpt || ''}</p>
                        <div class="product-meta">
                            <span class="views">조회 ${review.views || 0}</span>
                            <span class="date">${new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        <a href="/review/${review.slug}" class="read-more">리뷰 보기</a>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        categoryContent.innerHTML = html;
    } catch (error) {
        console.error('카테고리 로드 오류:', error);
        showSampleProducts(category);
    }
}

// 샘플 상품 표시
function showSampleProducts(category) {
    const categoryData = {
        electronics: [
            {
                title: '삼성 갤럭시 워치6',
                price: '299,000원',
                rating: '4.8',
                reviews: '2,341'
            },
            {
                title: 'LG 그램 노트북',
                price: '1,590,000원',
                rating: '4.9',
                reviews: '1,234'
            }
        ],
        beauty: [
            {
                title: '설화수 자음생 에센스',
                price: '189,000원',
                rating: '4.7',
                reviews: '3,456'
            },
            {
                title: '이니스프리 그린티 세트',
                price: '45,000원',
                rating: '4.6',
                reviews: '5,678'
            }
        ],
        fashion: [
            {
                title: '나이키 에어맥스',
                price: '139,000원',
                rating: '4.8',
                reviews: '4,321'
            },
            {
                title: '아디다스 트랙 재킷',
                price: '89,000원',
                rating: '4.5',
                reviews: '2,109'
            }
        ],
        home: [
            {
                title: '다이슨 무선청소기',
                price: '699,000원',
                rating: '4.9',
                reviews: '1,876'
            },
            {
                title: '쿠쿠 전기압력밥솥',
                price: '289,000원',
                rating: '4.7',
                reviews: '3,210'
            }
        ],
        food: [
            {
                title: '비비고 왕교자',
                price: '15,900원',
                rating: '4.8',
                reviews: '5,432'
            },
            {
                title: '오뚜기 진라면',
                price: '4,980원',
                rating: '4.9',
                reviews: '8,765'
            }
        ]
    };
    
    const products = categoryData[category] || [];
    const categoryContent = document.getElementById('categoryContent');
    
    let html = '<div class="product-grid">';
    products.forEach((product, index) => {
        html += `
            <div class="product-card">
                <div class="product-image">
                    <img src="https://via.placeholder.com/300x300" alt="${product.title}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-rating">
                        <span class="stars">★★★★★</span>
                        <span class="rating-count">(${product.reviews})</span>
                    </div>
                    <p class="product-price">${product.price}</p>
                    <a href="#" class="coupang-link" onclick="trackClick('${category}_${index}')">쿠팡에서 보기</a>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    categoryContent.innerHTML = html;
}

// 추천 상품 로드
async function loadFeaturedProducts() {
    try {
        // 추천 리뷰 가져오기
        const result = await apiRequest('GET', '/reviews?featured=true&limit=3');
        const featuredReviews = result.data;
        
        if (featuredReviews.length > 0) {
            const container = document.getElementById('featuredProducts');
            let html = '';
            
            featuredReviews.forEach(review => {
                html += `
                    <div class="product-card featured-card">
                        <div class="featured-badge">추천</div>
                        <div class="product-image">
                            <img src="https://via.placeholder.com/300x300" alt="${review.title}">
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">
                                <a href="/review/${review.slug}">${review.title}</a>
                            </h3>
                            <p class="product-excerpt">${review.excerpt || ''}</p>
                            <a href="/review/${review.slug}" class="coupang-link">리뷰 보기</a>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        } else {
            // 샘플 데이터 표시
            showSampleFeaturedProducts();
        }
    } catch (error) {
        console.error('추천 상품 로드 오류:', error);
        showSampleFeaturedProducts();
    }
}

// 샘플 추천 상품 표시
function showSampleFeaturedProducts() {
    const featuredProducts = [
        {
            id: 'featured_1',
            title: '애플 에어팟 프로 2세대',
            price: '289,000원',
            rating: '4.9',
            reviews: '5,432',
            coupangUrl: '#'
        },
        {
            id: 'featured_2',
            title: '다이슨 헤어드라이어',
            price: '449,000원',
            rating: '4.8',
            reviews: '3,210',
            coupangUrl: '#'
        },
        {
            id: 'featured_3',
            title: '삼성 비스포크 냉장고',
            price: '2,890,000원',
            rating: '4.7',
            reviews: '1,234',
            coupangUrl: '#'
        }
    ];
    
    const container = document.getElementById('featuredProducts');
    let html = '';
    
    featuredProducts.forEach(product => {
        html += `
            <div class="product-card">
                <div class="product-image">
                    <img src="https://via.placeholder.com/300x300" alt="${product.title}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-rating">
                        <span class="stars">★★★★★</span>
                        <span class="rating-count">(${product.reviews})</span>
                    </div>
                    <p class="product-price">${product.price}</p>
                    <a href="${product.coupangUrl}" class="coupang-link" target="_blank" onclick="trackClick('${product.id}')">쿠팡에서 보기</a>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 최신 리뷰 로드
async function loadLatestReviews() {
    try {
        const result = await apiRequest('GET', '/reviews?limit=5');
        const reviews = result.data;
        
        if (reviews.length > 0) {
            const reviewList = document.querySelector('.review-list');
            
            reviewList.innerHTML = reviews.map(review => `
                <article class="review-card">
                    <h3><a href="/review/${review.slug}">${review.title}</a></h3>
                    <p class="review-excerpt">${review.excerpt || '이 제품에 대한 상세한 리뷰를 확인해보세요.'}</p>
                    <div class="review-meta">
                        <span class="date">${new Date(review.created_at).toLocaleDateString()}</span>
                        <span class="category">${getCategoryName(review.category)}</span>
                    </div>
                </article>
            `).join('');
        }
    } catch (error) {
        console.error('최신 리뷰 로드 오류:', error);
    }
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

// 테트리스 게임 팝업
function showTetrisPopup() {
    // 방문 횟수 체크
    let visitCount = parseInt(localStorage.getItem('visitCount') || '0');
    visitCount++;
    localStorage.setItem('visitCount', visitCount.toString());
    
    // 3번째 방문마다 팝업 표시
    if (visitCount % 3 === 0) {
        setTimeout(() => {
            if (confirm('🎮 잠깐! 쇼핑도 좋지만 잠시 휴식은 어떠세요?\n\n테트리스 게임으로 스트레스를 날려보세요!')) {
                window.open('/tetris-game', '_blank');
            }
        }, 5000); // 5초 후 표시
    }
}

// 페이지 하단 도달 시 테트리스 추천
function setupScrollTetrisPromotion() {
    let promoted = false;
    
    window.addEventListener('scroll', () => {
        if (promoted) return;
        
        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = document.body.offsetHeight - 200;
        
        if (scrollPosition >= threshold) {
            promoted = true;
            showFloatingTetrisButton();
        }
    });
}

// 플로팅 테트리스 버튼 표시
function showFloatingTetrisButton() {
    const button = document.createElement('div');
    button.className = 'floating-tetris-button';
    button.innerHTML = `
        <div class="tetris-icon">🎮</div>
        <div class="tetris-text">테트리스<br>한 판?</div>
    `;
    button.onclick = () => window.open('/tetris-game', '_blank');
    
    document.body.appendChild(button);
    
    // 애니메이션
    setTimeout(() => {
        button.classList.add('show');
    }, 100);
    
    // 10초 후 자동 숨김
    setTimeout(() => {
        button.classList.remove('show');
        setTimeout(() => button.remove(), 300);
    }, 10000);
}

// 스크롤 애니메이션
function setupScrollAnimation() {
    const header = document.querySelector('.main-header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        if (currentScroll > 100) {
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
        
        // 스크롤 방향에 따라 헤더 숨김/표시
        if (currentScroll > lastScroll && currentScroll > 300) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
}

// 모바일 드롭다운 메뉴 설정
function setupMobileDropdown() {
    const dropdown = document.querySelector('.dropdown');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    
    if (!dropdown || !dropdownToggle) return;
    
    dropdownToggle.addEventListener('click', function(e) {
        e.preventDefault();
        dropdown.classList.toggle('active');
    });
    
    // 다른 곳 클릭 시 메뉴 닫기
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

// SEO를 위한 구조화된 데이터 추가
function addStructuredData() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "https://wongram.shop",
        "name": "Wongram Shop",
        "description": "쿠팡 제품 리뷰와 비교 분석을 통한 스마트한 쇼핑 가이드",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://wongram.shop/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
}

// SEO 설정 로드 및 적용
async function loadSeoSettings() {
    try {
        const result = await apiRequest('GET', '/seo-settings');
        const settings = result.data;
        
        // Google Analytics 설정
        if (settings.gaId) {
            const gaScript = document.createElement('script');
            gaScript.async = true;
            gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${settings.gaId}`;
            document.head.appendChild(gaScript);
            
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', settings.gaId);
        }
        
        // 네이버 웹마스터 도구
        if (settings.naverVerification) {
            const naverMeta = document.createElement('meta');
            naverMeta.name = 'naver-site-verification';
            naverMeta.content = settings.naverVerification;
            document.head.appendChild(naverMeta);
        }
    } catch (error) {
        console.error('SEO 설정 로드 오류:', error);
    }
}

// 엔터키로 검색
document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchProducts();
    }
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async function() {
    // 기본 초기화
    setupMobileDropdown();
    setupScrollAnimation();
    addStructuredData();
    
    // 데이터 로드
    await loadSeoSettings();
    await loadFeaturedProducts();
    await loadLatestReviews();
    
    // 기본 카테고리 로드
    loadCategoryProducts('electronics');
    
    // 테트리스 게임 프로모션
    showTetrisPopup();
    setupScrollTetrisPromotion();
    
    // 관리자 버튼 표시 확인
    if (localStorage.getItem('adminAuth')) {
        const adminButton = document.getElementById('adminButton');
        if (adminButton) {
            adminButton.classList.remove('hidden');
        }
    }
});

// 플로팅 테트리스 버튼 스타일 추가
const style = document.createElement('style');
style.textContent = `
.floating-tetris-button {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    transform: translateX(100px);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    z-index: 1000;
}

.floating-tetris-button.show {
    transform: translateX(0);
}

.floating-tetris-button:hover {
    box-shadow: 0 6px 20px rgba(0,0,0,0.4);
    transform: translateX(0) scale(1.1);
}

.tetris-icon {
    font-size: 30px;
    margin-bottom: 4px;
}

.tetris-text {
    font-size: 12px;
    color: white;
    text-align: center;
    line-height: 1.2;
    font-weight: bold;
}

@media (max-width: 768px) {
    .floating-tetris-button {
        width: 60px;
        height: 60px;
        right: 15px;
        bottom: 15px;
    }
    
    .tetris-icon {
        font-size: 24px;
    }
    
    .tetris-text {
        font-size: 10px;
    }
}
`;
document.head.appendChild(style);