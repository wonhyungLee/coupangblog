// 쿠팡파트너스 클릭 추적
function trackClick(productId) {
    // 클릭 추적 로직
    console.log('Product clicked:', productId);
    // 실제 쿠팡파트너스 링크로 이동
}

// 검색 기능
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value;
    console.log('Searching for:', searchTerm);
    // 검색 로직 구현
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
function loadCategoryProducts(category) {
    const categoryContent = document.getElementById('categoryContent');
    
    // 카테고리별 샘플 데이터
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
        ]
    };
    
    const products = categoryData[category] || [];
    
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

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 기본 카테고리 로드
    loadCategoryProducts('electronics');
    
    // 추천 상품 로드
    loadFeaturedProducts();
    
    // 모바일 드롭다운 메뉴 처리
    setupMobileDropdown();
    
    // SEO를 위한 구조화된 데이터 추가
    addStructuredData();
});

// 추천 상품 로드
function loadFeaturedProducts() {
    // 실제로는 API나 데이터베이스에서 상품 정보를 가져옵니다
    const featuredProducts = [
        {
            id: 'featured_1',
            title: '애플 에어팟 프로 2세대',
            price: '289,000원',
            rating: '4.9',
            reviews: '5,432',
            coupangUrl: 'https://link.coupang.com/...' // 실제 쿠팡파트너스 링크
        },
        {
            id: 'featured_2',
            title: '다이슨 헤어드라이어',
            price: '449,000원',
            rating: '4.8',
            reviews: '3,210',
            coupangUrl: 'https://link.coupang.com/...'
        },
        {
            id: 'featured_3',
            title: '삼성 비스포크 냉장고',
            price: '2,890,000원',
            rating: '4.7',
            reviews: '1,234',
            coupangUrl: 'https://link.coupang.com/...'
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

// 쿠팡파트너스 상품 위젯 삽입 예시
function insertCoupangWidget(elementId, productId) {
    const element = document.getElementById(elementId);
    if (element) {
        // 쿠팡파트너스에서 제공하는 실제 위젯 코드를 여기에 삽입
        element.innerHTML = `
            <script src="https://ads-partners.coupang.com/g.js"></script>
            <script>
                new PartnersCoupang.G({
                    id: ${productId},
                    template: "carousel",
                    trackingCode: "AF1234567", // 실제 트래킹 코드로 변경
                    width: "100%",
                    height: "auto"
                });
            </script>
        `;
    }
}

// 스크롤 애니메이션
window.addEventListener('scroll', function() {
    const header = document.querySelector('.main-header');
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
});

// 모바일 드롭다운 메뉴 설정
function setupMobileDropdown() {
    const dropdown = document.querySelector('.dropdown');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    
    // 모바일 환경 감지
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    if (isMobile) {
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

// 제품 검색 기능 개선
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    
    if (!searchTerm) {
        alert('검색어를 입력해주세요.');
        return;
    }
    
    // 검색 결과 페이지로 이동 (실제로는 AJAX로 처리)
    window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
}

// 엔터키로 검색
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchProducts();
    }
});

// 블로그 글 로드 (홈페이지용)
function loadBlogPosts() {
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const reviewList = document.querySelector('.review-list');
    
    if (posts.length === 0) {
        return; // 글이 없으면 기본 샘플 유지
    }
    
    // 최신 3개 글만 표시
    const recentPosts = posts.slice(0, 3);
    
    reviewList.innerHTML = recentPosts.map(post => `
        <article class="review-card">
            <h3><a href="/review/${post.slug}">${post.title}</a></h3>
            <p class="review-excerpt">${post.excerpt}</p>
            <div class="review-meta">
                <span class="date">${new Date(post.createdAt).toLocaleDateString()}</span>
                <span class="category">${getCategoryName(post.category)}</span>
            </div>
        </article>
    `).join('');
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

// 페이지 로드 시 블로그 글도 로드
document.addEventListener('DOMContentLoaded', function() {
    loadBlogPosts();
});