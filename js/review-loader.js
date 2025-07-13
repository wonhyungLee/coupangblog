// 리뷰 동적 로드 스크립트

// URL에서 슬러그 추출
function getSlugFromUrl() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1];
}

// 리뷰 로드
function loadReview() {
    const slug = getSlugFromUrl();
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    const post = posts.find(p => p.slug === slug);
    
    if (!post) {
        showNotFound();
        return;
    }
    
    // 메타 태그 업데이트 (SEO)
    updateMetaTags(post);
    
    // 리뷰 콘텐츠 렌더링
    renderReview(post);
    
    // 인기 리뷰 로드
    loadPopularReviews(post.category);
    
    // 조회수 증가
    incrementViews(slug);
}

// 메타 태그 업데이트
function updateMetaTags(post) {
    document.getElementById('pageTitle').textContent = `${post.title} - Wongram Shop`;
    document.getElementById('metaDescription').content = post.metaDescription || post.excerpt;
    document.getElementById('metaKeywords').content = post.keywords || '';
    
    // Open Graph 태그 추가
    addOpenGraphTags(post);
    
    // 구조화된 데이터 추가
    addArticleStructuredData(post);
}

// Open Graph 태그 추가
function addOpenGraphTags(post) {
    const ogTags = [
        { property: 'og:title', content: post.title },
        { property: 'og:description', content: post.metaDescription || post.excerpt },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: `https://wongram.shop/review/${post.slug}` },
        { property: 'article:author', content: 'Wongram' },
        { property: 'article:published_time', content: post.createdAt }
    ];
    
    ogTags.forEach(tag => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', tag.property);
        meta.content = tag.content;
        document.head.appendChild(meta);
    });
}

// 구조화된 데이터 추가
function addArticleStructuredData(post) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": post.metaDescription || post.excerpt,
        "datePublished": post.createdAt,
        "dateModified": post.updatedAt || post.createdAt,
        "author": {
            "@type": "Person",
            "name": "Wongram"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Wongram Shop",
            "logo": {
                "@type": "ImageObject",
                "url": "https://wongram.shop/logo.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://wongram.shop/review/${post.slug}`
        }
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
}

// 리뷰 렌더링
function renderReview(post) {
    const reviewContent = document.getElementById('reviewContent');
    
    // 상품 위젯 HTML 생성
    const productWidgets = post.products.map(product => `
        <div class="product-review">
            <h3>${product.name}</h3>
            <div class="coupang-widget">
                <div class="product-info-box">
                    <div class="product-details">
                        <p class="price">가격: ${product.price}</p>
                        <p class="rating">평점: ${'★'.repeat(Math.floor(product.rating))} ${product.rating}</p>
                    </div>
                    <a href="${product.url}" class="buy-button" target="_blank" onclick="trackProductClick('${product.name}')">
                        쿠팡에서 최저가 확인하기
                    </a>
                </div>
            </div>
        </div>
    `).join('');
    
    reviewContent.innerHTML = `
        <header class="review-header">
            <div class="breadcrumb">
                <a href="/">홈</a> &gt; 
                <a href="/category/${post.category}">${getCategoryName(post.category)}</a> &gt; 
                ${post.title}
            </div>
            <h1 class="review-title">${post.title}</h1>
            <div class="review-meta">
                <span class="author">작성자: Wongram</span>
                <span class="date">${new Date(post.createdAt).toLocaleDateString()}</span>
                <span class="views">조회수: ${post.views || 0}</span>
            </div>
        </header>

        <div class="review-content">
            ${post.content}
            
            <!-- 상품 정보 -->
            ${productWidgets}
            
            <!-- 쿠팡파트너스 공지 -->
            <div class="affiliate-notice">
                <p>이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
            </div>
        </div>

        <!-- 관련 리뷰 -->
        <section class="related-reviews">
            <h2>관련 리뷰</h2>
            <div class="related-grid" id="relatedReviews">
                <!-- 동적으로 로드됩니다 -->
            </div>
        </section>
    `;
    
    // 관련 리뷰 로드
    loadRelatedReviews(post.category, post.slug);
}

// 404 페이지
function showNotFound() {
    const reviewContent = document.getElementById('reviewContent');
    reviewContent.innerHTML = `
        <div class="not-found">
            <h1>404 - 페이지를 찾을 수 없습니다</h1>
            <p>요청하신 리뷰를 찾을 수 없습니다.</p>
            <a href="/" class="back-button">홈으로 돌아가기</a>
        </div>
    `;
}

// 조회수 증가
function incrementViews(slug) {
    let posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const postIndex = posts.findIndex(p => p.slug === slug);
    
    if (postIndex !== -1) {
        posts[postIndex].views = (posts[postIndex].views || 0) + 1;
        localStorage.setItem('blogPosts', JSON.stringify(posts));
    }
}

// 인기 리뷰 로드
function loadPopularReviews(currentCategory) {
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    // 같은 카테고리의 인기 글 (조회수 순)
    const popularPosts = posts
        .filter(p => p.category === currentCategory)
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);
    
    const popularReviewsList = document.getElementById('popularReviews');
    
    if (popularPosts.length === 0) {
        popularReviewsList.innerHTML = '<li>아직 리뷰가 없습니다.</li>';
        return;
    }
    
    popularReviewsList.innerHTML = popularPosts.map(post => `
        <li><a href="/review/${post.slug}">${post.title}</a></li>
    `).join('');
}

// 관련 리뷰 로드
function loadRelatedReviews(category, currentSlug) {
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    // 같은 카테고리의 다른 글들
    const relatedPosts = posts
        .filter(p => p.category === category && p.slug !== currentSlug)
        .slice(0, 3);
    
    const relatedGrid = document.getElementById('relatedReviews');
    
    if (relatedPosts.length === 0) {
        relatedGrid.innerHTML = '<p>관련 리뷰가 없습니다.</p>';
        return;
    }
    
    relatedGrid.innerHTML = relatedPosts.map(post => `
        <div class="related-item">
            <a href="/review/${post.slug}">
                <img src="/images/placeholder.jpg" alt="${post.title}">
                <h3>${post.title}</h3>
            </a>
        </div>
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

// 제품 클릭 추적
function trackProductClick(productName) {
    console.log('Product clicked:', productName);
    // Google Analytics 이벤트 전송 코드 추가
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    loadReview();
});