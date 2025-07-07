// 쿠팡파트너스 상품 데이터 관리

// 쿠팡파트너스 설정
const COUPANG_CONFIG = {
    trackingCode: 'AF1234567', // 실제 트래킹 코드로 변경 필요
    subId: 'wongram-shop'
};

// 상품 데이터베이스 (실제로는 서버에서 관리하는 것이 좋습니다)
const PRODUCTS_DB = {
    // 전자제품
    electronics: {
        'airpods-pro-2': {
            name: '애플 에어팟 프로 2세대',
            coupangUrl: 'https://link.coupang.com/re/AFFSDP?lptag=AF1234567&pageKey=123456789&itemId=123456789',
            price: '289,000원',
            rating: 4.8,
            reviews: 5432,
            image: 'https://thumbnail.coupang.com/...',
            category: 'electronics',
            subcategory: '무선이어폰'
        },
        'galaxy-buds2-pro': {
            name: '삼성 갤럭시 버즈2 프로',
            coupangUrl: 'https://link.coupang.com/re/AFFSDP?lptag=AF1234567&pageKey=234567890&itemId=234567890',
            price: '159,000원',
            rating: 4.6,
            reviews: 3210,
            image: 'https://thumbnail.coupang.com/...',
            category: 'electronics',
            subcategory: '무선이어폰'
        }
    },
    // 뷰티
    beauty: {
        'sulwhasoo-essence': {
            name: '설화수 자음생 에센스',
            coupangUrl: 'https://link.coupang.com/re/AFFSDP?lptag=AF1234567&pageKey=345678901&itemId=345678901',
            price: '189,000원',
            rating: 4.7,
            reviews: 3456,
            image: 'https://thumbnail.coupang.com/...',
            category: 'beauty',
            subcategory: '스킨케어'
        }
    }
};

// 쿠팡파트너스 상품 위젯 생성 함수
function createCoupangWidget(productId, template = 'carousel') {
    const config = {
        id: productId,
        template: template,
        trackingCode: COUPANG_CONFIG.trackingCode,
        subId: COUPANG_CONFIG.subId,
        width: '100%',
        height: 'auto'
    };
    
    return `
        <script src="https://ads-partners.coupang.com/g.js"></script>
        <script>
            new PartnersCoupang.G(${JSON.stringify(config)});
        </script>
    `;
}

// 상품 카드 HTML 생성 함수
function createProductCard(product) {
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image || 'https://via.placeholder.com/300x300'}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    <span class="stars">${'★'.repeat(Math.floor(product.rating))}</span>
                    <span class="rating-count">(${product.reviews.toLocaleString()})</span>
                </div>
                <p class="product-price">${product.price}</p>
                <a href="${product.coupangUrl}" 
                   class="coupang-link" 
                   target="_blank" 
                   onclick="trackProductClick('${product.id}')">
                    쿠팡에서 보기
                </a>
            </div>
        </div>
    `;
}

// 상품 클릭 추적 함수
function trackProductClick(productId) {
    // Google Analytics 이벤트 전송
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
            'event_category': 'coupang_product',
            'event_label': productId,
            'transport_type': 'beacon'
        });
    }
    
    // 자체 분석 서버로 데이터 전송 (옵션)
    fetch('/api/track-click', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productId: productId,
            timestamp: new Date().toISOString(),
            referrer: document.referrer
        })
    }).catch(err => console.error('Tracking error:', err));
}

// 동적으로 상품 로드하는 함수
async function loadProducts(category, options = {}) {
    const { 
        limit = 10, 
        sort = 'popular', 
        container = 'productContainer' 
    } = options;
    
    try {
        // 실제로는 API를 호출하여 상품 데이터를 가져옵니다
        // const response = await fetch(`/api/products?category=${category}&limit=${limit}&sort=${sort}`);
        // const products = await response.json();
        
        // 데모용: 로컬 데이터 사용
        const products = Object.values(PRODUCTS_DB[category] || {}).slice(0, limit);
        
        const containerElement = document.getElementById(container);
        if (!containerElement) return;
        
        let html = '<div class="product-grid">';
        products.forEach(product => {
            html += createProductCard(product);
        });
        html += '</div>';
        
        containerElement.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// 검색 기능
async function searchCoupangProducts(query) {
    try {
        // 실제로는 쿠팡 OpenAPI를 사용하여 검색
        // const response = await fetch(`/api/coupang/search?q=${encodeURIComponent(query)}`);
        // const results = await response.json();
        
        // 데모용: 간단한 필터링
        const allProducts = Object.values(PRODUCTS_DB).flatMap(category => Object.values(category));
        const results = allProducts.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase())
        );
        
        return results;
        
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

// 최근 본 상품 관리
class RecentlyViewed {
    constructor() {
        this.storageKey = 'recentlyViewedProducts';
        this.maxItems = 10;
    }
    
    add(productId) {
        let items = this.getAll();
        items = items.filter(id => id !== productId);
        items.unshift(productId);
        items = items.slice(0, this.maxItems);
        localStorage.setItem(this.storageKey, JSON.stringify(items));
    }
    
    getAll() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }
    
    clear() {
        localStorage.removeItem(this.storageKey);
    }
}

// 초기화
const recentlyViewed = new RecentlyViewed();

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 최근 본 상품 추가 (상품 상세 페이지에서)
    const productDetailElement = document.querySelector('[data-product-detail]');
    if (productDetailElement) {
        const productId = productDetailElement.dataset.productId;
        if (productId) {
            recentlyViewed.add(productId);
        }
    }
});

// Export functions for use in other scripts
window.CoupangProducts = {
    createWidget: createCoupangWidget,
    createCard: createProductCard,
    trackClick: trackProductClick,
    loadProducts: loadProducts,
    search: searchCoupangProducts,
    recentlyViewed: recentlyViewed,
    config: COUPANG_CONFIG,
    database: PRODUCTS_DB
};