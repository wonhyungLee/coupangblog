// 관리자 페이지 스크립트

// Quill 에디터 인스턴스
let quill;

// 로그인 상태 확인
function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminAuth') === 'true';
    if (isLoggedIn) {
        showDashboard();
    } else {
        showLogin();
    }
}

// 로그인 화면 표시
function showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
}

// 대시보드 표시
function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    initializeEditor();
    loadPosts();
}

// 로그인 처리
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // 실제로는 서버에서 인증해야 합니다
    // 여기서는 데모용으로 하드코딩
    if (username === 'admin' && password === 'wongram2024') {
        localStorage.setItem('adminAuth', 'true');
        showDashboard();
    } else {
        document.getElementById('loginError').textContent = '아이디 또는 비밀번호가 올바르지 않습니다.';
    }
});

// 로그아웃
function logout() {
    localStorage.removeItem('adminAuth');
    showLogin();
}

// 섹션 전환
function showSection(section) {
    // 모든 섹션 숨기기
    document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
    
    // 모든 네비게이션 버튼 비활성화
    document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active'));
    
    // 선택된 섹션 표시
    document.getElementById(section + 'Section').classList.remove('hidden');
    
    // 선택된 버튼 활성화
    event.target.classList.add('active');
}

// Quill 에디터 초기화
function initializeEditor() {
    if (quill) return; // 이미 초기화됨
    
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image', 'video'],
                ['clean']
            ]
        }
    });
}

// 상품 추가
function addProduct() {
    const template = document.getElementById('productTemplate').content.cloneNode(true);
    document.getElementById('productList').appendChild(template);
}

// 상품 제거
function removeProduct(button) {
    button.closest('.product-item').remove();
}

// SEO 친화적 슬러그 생성
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w가-힣\s-]/g, '') // 특수문자 제거
        .replace(/\s+/g, '-') // 공백을 하이픈으로
        .replace(/-+/g, '-') // 연속된 하이픈 제거
        .replace(/^-+|-+$/g, ''); // 앞뒤 하이픈 제거
}

// 제목 입력 시 슬러그 자동 생성
document.getElementById('postTitle').addEventListener('input', function(e) {
    const slug = generateSlug(e.target.value);
    document.getElementById('postSlug').value = slug;
});

// 글 발행
document.getElementById('postForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 폼 데이터 수집
    const postData = {
        slug: document.getElementById('postSlug').value,
        title: document.getElementById('postTitle').value,
        category: document.getElementById('postCategory').value,
        excerpt: document.getElementById('postExcerpt').value,
        content: quill.root.innerHTML,
        metaDescription: document.getElementById('metaDescription').value,
        keywords: document.getElementById('keywords').value,
        publishNow: document.getElementById('publishNow').checked,
        featured: document.getElementById('featuredPost').checked,
        products: collectProducts(),
        createdAt: new Date().toISOString(),
        views: 0
    };
    
    // 글 저장 (실제로는 서버로 전송)
    savePost(postData);
    
    // 성공 메시지
    alert('글이 성공적으로 발행되었습니다!');
    
    // 글 목록으로 이동
    showSection('posts');
});

// 상품 정보 수집
function collectProducts() {
    const products = [];
    document.querySelectorAll('.product-item').forEach(item => {
        products.push({
            name: item.querySelector('.product-name').value,
            url: item.querySelector('.product-url').value,
            price: item.querySelector('.product-price').value,
            rating: parseFloat(item.querySelector('.product-rating').value) || 0
        });
    });
    return products;
}

// 글 저장 (로컬스토리지 - 실제로는 서버 API 사용)
function savePost(postData) {
    let posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    posts.unshift(postData); // 최신 글을 앞에 추가
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    
    // SEO를 위한 sitemap 업데이트 (실제로는 서버에서 처리)
    updateSitemap(postData);
}

// 임시저장
function saveAsDraft() {
    const draftData = {
        title: document.getElementById('postTitle').value,
        content: quill.root.innerHTML,
        // ... 기타 필드들
    };
    
    localStorage.setItem('draft', JSON.stringify(draftData));
    alert('임시저장되었습니다.');
}

// 글 목록 로드
function loadPosts() {
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const tbody = document.getElementById('postsList');
    
    tbody.innerHTML = posts.map((post, index) => `
        <tr>
            <td>${post.title}</td>
            <td>${getCategoryName(post.category)}</td>
            <td>${new Date(post.createdAt).toLocaleDateString()}</td>
            <td>${post.views || 0}</td>
            <td>
                <a href="#" onclick="editPost(${index})" class="edit-link">수정</a>
                <a href="#" onclick="deletePost(${index})" class="delete-link">삭제</a>
            </td>
        </tr>
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

// 글 삭제
function deletePost(index) {
    if (!confirm('정말로 삭제하시겠습니까?')) return;
    
    let posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    posts.splice(index, 1);
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    
    loadPosts();
}

// 쿠팡 상품 검색 (데모용)
function searchCoupangProduct() {
    const query = document.getElementById('coupangSearch').value;
    
    // 실제로는 쿠팡 API를 사용해야 합니다
    const demoResults = [
        {
            name: '검색된 상품 1',
            price: '50,000원',
            image: 'https://via.placeholder.com/80',
            url: 'https://link.coupang.com/...'
        },
        {
            name: '검색된 상품 2',
            price: '80,000원',
            image: 'https://via.placeholder.com/80',
            url: 'https://link.coupang.com/...'
        }
    ];
    
    displaySearchResults(demoResults);
}

// 검색 결과 표시
function displaySearchResults(results) {
    const container = document.getElementById('searchResults');
    
    container.innerHTML = results.map(product => `
        <div class="search-result-item">
            <img src="${product.image}" alt="${product.name}">
            <div class="search-result-info">
                <h4>${product.name}</h4>
                <p>${product.price}</p>
            </div>
            <button onclick="useProduct('${product.name}', '${product.url}', '${product.price}')" class="use-product-button">
                사용하기
            </button>
        </div>
    `).join('');
}

// 검색된 상품 사용
function useProduct(name, url, price) {
    // 글쓰기 섹션으로 이동
    showSection('write');
    
    // 상품 추가
    addProduct();
    
    // 마지막 추가된 상품에 정보 입력
    const lastProduct = document.querySelector('#productList .product-item:last-child');
    lastProduct.querySelector('.product-name').value = name;
    lastProduct.querySelector('.product-url').value = url;
    lastProduct.querySelector('.product-price').value = price;
}

// SEO 설정 저장
document.getElementById('seoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const seoSettings = {
        siteTitle: document.getElementById('siteTitle').value,
        siteDescription: document.getElementById('siteDescription').value,
        gaId: document.getElementById('gaId').value,
        naverVerification: document.getElementById('naverVerification').value
    };
    
    localStorage.setItem('seoSettings', JSON.stringify(seoSettings));
    alert('SEO 설정이 저장되었습니다.');
});

// Sitemap 업데이트 (실제로는 서버에서 처리)
function updateSitemap(postData) {
    // 새 글의 URL을 sitemap에 추가
    const postUrl = `https://wongram.shop/review/${postData.slug}`;
    console.log('Sitemap에 추가:', postUrl);
}

// 페이지 로드 시 인증 확인
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // SEO 설정 로드
    const seoSettings = JSON.parse(localStorage.getItem('seoSettings') || '{}');
    if (seoSettings.siteTitle) {
        document.getElementById('siteTitle').value = seoSettings.siteTitle;
        document.getElementById('siteDescription').value = seoSettings.siteDescription || '';
        document.getElementById('gaId').value = seoSettings.gaId || '';
        document.getElementById('naverVerification').value = seoSettings.naverVerification || '';
    }
});

// 글 작성 팁 표시
function showWritingTips() {
    const tips = `
SEO 최적화 글쓰기 팁:
1. 제목에 핵심 키워드를 포함하세요
2. 메타 설명은 155-160자 이내로 작성하세요
3. 본문에 키워드를 자연스럽게 배치하세요
4. 이미지에는 alt 텍스트를 추가하세요
5. 내부 링크와 외부 링크를 적절히 사용하세요
6. 소제목(H2, H3)을 활용해 구조화하세요
7. 최소 300단어 이상의 내용을 작성하세요
    `;
    alert(tips);
}