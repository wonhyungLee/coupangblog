// 관리자 페이지 스크립트 (서버 API 연동 버전)

// Quill 에디터 인스턴스
let quill;

// 관리자 인증 정보
let authCredentials = null;

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
    
    if (authCredentials) {
        options.headers['Authorization'] = 'Basic ' + btoa(`${authCredentials.username}:${authCredentials.password}`);
    }
    
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

// 로그인 상태 확인
function checkAuth() {
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth) {
        authCredentials = JSON.parse(savedAuth);
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
    loadSeoSettings();
}

// 로그인 처리
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // 임시 인증 정보 설정
    authCredentials = { username, password };
    
    try {
        // API로 인증 테스트 (SEO 설정 조회로 테스트)
        await apiRequest('GET', '/seo-settings');
        
        // 성공하면 저장
        localStorage.setItem('adminAuth', JSON.stringify(authCredentials));
        showDashboard();
        document.getElementById('loginError').textContent = '';
    } catch (error) {
        authCredentials = null;
        document.getElementById('loginError').textContent = '아이디 또는 비밀번호가 올바르지 않습니다.';
    }
});

// 로그아웃
function logout() {
    localStorage.removeItem('adminAuth');
    authCredentials = null;
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
    
    // 섹션별 데이터 로드
    if (section === 'posts') {
        loadPosts();
    }
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
    
    // 쿠팡 배너 삽입 도구 추가
    const toolbar = quill.getModule('toolbar');
    toolbar.addHandler('coupang', function() {
        const range = quill.getSelection();
        if (range) {
            const html = `
<div class="coupang-banner" contenteditable="false">
    <script src="https://ads-partners.coupang.com/g.js"></script>
    <script>
        new PartnersCoupang.G({ id: YOUR_ID_HERE });
    </script>
</div>`;
            quill.clipboard.dangerouslyPasteHTML(range.index, html);
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
    // 한글을 영문으로 간단히 변환하는 매핑
    const koreanToEnglish = {
        '가': 'ga', '나': 'na', '다': 'da', '라': 'ra', '마': 'ma',
        '바': 'ba', '사': 'sa', '아': 'a', '자': 'ja', '차': 'cha',
        '카': 'ka', '타': 'ta', '파': 'pa', '하': 'ha'
    };
    
    let slug = title.toLowerCase();
    
    // 기본적인 한글 처리
    for (const [korean, english] of Object.entries(koreanToEnglish)) {
        slug = slug.replace(new RegExp(korean, 'g'), english);
    }
    
    // 영문, 숫자, 하이픈만 남기기
    slug = slug
        .replace(/[^a-z0-9\s-]/g, '') // 특수문자 제거
        .replace(/\s+/g, '-') // 공백을 하이픈으로
        .replace(/-+/g, '-') // 연속된 하이픈 제거
        .replace(/^-+|-+$/g, ''); // 앞뒤 하이픈 제거
        
    return slug || 'review-' + Date.now();
}

// 제목 입력 시 슬러그 자동 생성
document.getElementById('postTitle').addEventListener('input', function(e) {
    const slug = generateSlug(e.target.value);
    document.getElementById('postSlug').value = slug;
});

// 글 발행
document.getElementById('postForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 폼 데이터 수집
    const postData = {
        slug: document.getElementById('postSlug').value,
        title: document.getElementById('postTitle').value,
        category: document.getElementById('postCategory').value,
        excerpt: document.getElementById('postExcerpt').value,
        content: quill.root.innerHTML,
        meta_description: document.getElementById('metaDescription').value,
        keywords: document.getElementById('keywords').value,
        published: document.getElementById('publishNow').checked ? 1 : 0,
        featured: document.getElementById('featuredPost').checked ? 1 : 0,
        products: collectProducts()
    };
    
    try {
        // 서버로 전송
        const result = await apiRequest('POST', '/reviews', postData);
        
        // 성공 메시지
        alert('글이 성공적으로 발행되었습니다!');
        
        // 폼 초기화
        document.getElementById('postForm').reset();
        quill.setText('');
        document.getElementById('productList').innerHTML = '';
        
        // 글 목록으로 이동
        showSection('posts');
    } catch (error) {
        alert('글 발행 중 오류가 발생했습니다: ' + error.message);
    }
});

// 상품 정보 수집
function collectProducts() {
    const products = [];
    document.querySelectorAll('.product-item').forEach(item => {
        const name = item.querySelector('.product-name').value;
        const url = item.querySelector('.product-url').value;
        if (name && url) {
            products.push({
                name: name,
                url: url,
                price: item.querySelector('.product-price').value,
                rating: parseFloat(item.querySelector('.product-rating').value) || 0
            });
        }
    });
    return products;
}

// 임시저장
function saveAsDraft() {
    const draftData = {
        title: document.getElementById('postTitle').value,
        category: document.getElementById('postCategory').value,
        excerpt: document.getElementById('postExcerpt').value,
        content: quill.root.innerHTML,
        metaDescription: document.getElementById('metaDescription').value,
        keywords: document.getElementById('keywords').value,
        products: collectProducts()
    };
    
    localStorage.setItem('draft', JSON.stringify(draftData));
    alert('임시저장되었습니다.');
}

// 임시저장 불러오기
function loadDraft() {
    const draft = localStorage.getItem('draft');
    if (draft) {
        const draftData = JSON.parse(draft);
        document.getElementById('postTitle').value = draftData.title || '';
        document.getElementById('postCategory').value = draftData.category || '';
        document.getElementById('postExcerpt').value = draftData.excerpt || '';
        document.getElementById('metaDescription').value = draftData.metaDescription || '';
        document.getElementById('keywords').value = draftData.keywords || '';
        
        if (draftData.content) {
            quill.root.innerHTML = draftData.content;
        }
        
        // 상품 정보 복원
        if (draftData.products && draftData.products.length > 0) {
            document.getElementById('productList').innerHTML = '';
            draftData.products.forEach(product => {
                addProduct();
                const lastProduct = document.querySelector('#productList .product-item:last-child');
                lastProduct.querySelector('.product-name').value = product.name;
                lastProduct.querySelector('.product-url').value = product.url;
                lastProduct.querySelector('.product-price').value = product.price;
                lastProduct.querySelector('.product-rating').value = product.rating;
            });
        }
    }
}

// 글 목록 로드
async function loadPosts() {
    try {
        const result = await apiRequest('GET', '/reviews?limit=100');
        const posts = result.data;
        const tbody = document.getElementById('postsList');
        
        tbody.innerHTML = posts.map(post => `
            <tr>
                <td><a href="/review/${post.slug}" target="_blank">${post.title}</a></td>
                <td>${getCategoryName(post.category)}</td>
                <td>${new Date(post.created_at).toLocaleDateString()}</td>
                <td>${post.views || 0}</td>
                <td>
                    <a href="#" onclick="editPost(${post.id})" class="edit-link">수정</a>
                    <a href="#" onclick="deletePost(${post.id})" class="delete-link">삭제</a>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('글 목록 로드 오류:', error);
        document.getElementById('postsList').innerHTML = '<tr><td colspan="5">글을 불러올 수 없습니다.</td></tr>';
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

// 글 수정
async function editPost(id) {
    try {
        const result = await apiRequest('GET', `/reviews/${id}`);
        const post = result.data;
        
        // 글쓰기 섹션으로 이동
        showSection('write');
        
        // 데이터 채우기
        document.getElementById('postSlug').value = post.slug;
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postCategory').value = post.category;
        document.getElementById('postExcerpt').value = post.excerpt || '';
        document.getElementById('metaDescription').value = post.meta_description || '';
        document.getElementById('keywords').value = post.keywords || '';
        quill.root.innerHTML = post.content;
        
        // 상품 정보 복원
        if (post.products && post.products.length > 0) {
            document.getElementById('productList').innerHTML = '';
            post.products.forEach(product => {
                addProduct();
                const lastProduct = document.querySelector('#productList .product-item:last-child');
                lastProduct.querySelector('.product-name').value = product.name;
                lastProduct.querySelector('.product-url').value = product.url;
                lastProduct.querySelector('.product-price').value = product.price || '';
                lastProduct.querySelector('.product-rating').value = product.rating || '';
            });
        }
        
        // 폼 제출 이벤트를 수정 모드로 변경
        document.getElementById('postForm').dataset.editId = id;
    } catch (error) {
        alert('글을 불러올 수 없습니다: ' + error.message);
    }
}

// 글 삭제
async function deletePost(id) {
    if (!confirm('정말로 삭제하시겠습니까?')) return;
    
    try {
        await apiRequest('DELETE', `/reviews/${id}`);
        alert('글이 삭제되었습니다.');
        loadPosts();
    } catch (error) {
        alert('글 삭제 중 오류가 발생했습니다: ' + error.message);
    }
}

// 쿠팡 상품 검색 (데모용)
function searchCoupangProduct() {
    const query = document.getElementById('coupangSearch').value;
    
    // 실제로는 쿠팡 API를 사용해야 합니다
    // 여기서는 데모 결과를 표시합니다
    const demoResults = [
        {
            name: query + ' - 베스트셀러',
            price: '50,000원',
            image: 'https://via.placeholder.com/80',
            url: 'https://link.coupang.com/a/' + Math.random().toString(36).substr(2, 9)
        },
        {
            name: query + ' - 추천상품',
            price: '80,000원',
            image: 'https://via.placeholder.com/80',
            url: 'https://link.coupang.com/a/' + Math.random().toString(36).substr(2, 9)
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

// SEO 설정 로드
async function loadSeoSettings() {
    try {
        const result = await apiRequest('GET', '/seo-settings');
        const settings = result.data;
        
        if (settings.siteTitle) {
            document.getElementById('siteTitle').value = settings.siteTitle;
        }
        if (settings.siteDescription) {
            document.getElementById('siteDescription').value = settings.siteDescription;
        }
        if (settings.gaId) {
            document.getElementById('gaId').value = settings.gaId;
        }
        if (settings.naverVerification) {
            document.getElementById('naverVerification').value = settings.naverVerification;
        }
    } catch (error) {
        console.error('SEO 설정 로드 오류:', error);
    }
}

// SEO 설정 저장
document.getElementById('seoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const seoSettings = {
        siteTitle: document.getElementById('siteTitle').value,
        siteDescription: document.getElementById('siteDescription').value,
        gaId: document.getElementById('gaId').value,
        naverVerification: document.getElementById('naverVerification').value
    };
    
    try {
        await apiRequest('POST', '/seo-settings', seoSettings);
        alert('SEO 설정이 저장되었습니다.');
    } catch (error) {
        alert('SEO 설정 저장 중 오류가 발생했습니다: ' + error.message);
    }
});

// 테트리스 게임 유도 팁
function addTetrisPromotion() {
    const tetrisPromo = `
<div class="tetris-promotion">
    <h3>🎮 잠깐! 쇼핑 전에 게임 한 판 어때요?</h3>
    <p>스트레스 해소에 좋은 테트리스 게임을 즐겨보세요!</p>
    <a href="/tetris-game" target="_blank" class="tetris-button">테트리스 플레이</a>
</div>`;
    
    const range = quill.getSelection() || { index: quill.getLength() };
    quill.clipboard.dangerouslyPasteHTML(range.index, tetrisPromo);
}

// 글 작성 팁 표시
function showWritingTips() {
    const tips = `
📝 SEO 최적화 글쓰기 팁:

1. 제목 작성
   - 핵심 키워드를 제목 앞부분에 배치
   - 60자 이내로 작성 (구글 검색 결과에 잘림 방지)
   - 숫자나 연도를 포함하면 클릭률 상승

2. 메타 설명
   - 155-160자 이내로 작성
   - 행동을 유도하는 문구 포함
   - 핵심 키워드 자연스럽게 포함

3. 본문 작성
   - 최소 300단어 이상 (이상적으로는 1000단어 이상)
   - 소제목(H2, H3) 활용해 구조화
   - 첫 문단에 핵심 키워드 포함
   - 이미지 alt 텍스트 반드시 작성

4. 쿠팡 상품 연동
   - 리뷰하는 제품의 쿠팡 링크 포함
   - 가격 비교나 할인 정보 강조
   - 제품 이미지와 함께 배치

5. 테트리스 게임 유도
   - 글 중간이나 끝에 자연스럽게 게임 링크 삽입
   - "잠깐 쉬어가기", "집중력 향상" 등의 문구 활용

6. 내부 링크
   - 관련된 다른 리뷰로 연결
   - 카테고리 페이지로 연결

키워드 예시:
- "2024년 최신"
- "비교 리뷰"
- "구매 가이드"
- "최저가"
- "추천"
    `;
    alert(tips);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // 폼 제출 이벤트 수정 (수정 모드 대응)
    const originalSubmit = document.getElementById('postForm').onsubmit;
    document.getElementById('postForm').addEventListener('submit', async function(e) {
        const editId = this.dataset.editId;
        if (editId) {
            e.preventDefault();
            
            const postData = {
                slug: document.getElementById('postSlug').value,
                title: document.getElementById('postTitle').value,
                category: document.getElementById('postCategory').value,
                excerpt: document.getElementById('postExcerpt').value,
                content: quill.root.innerHTML,
                meta_description: document.getElementById('metaDescription').value,
                keywords: document.getElementById('keywords').value,
                published: document.getElementById('publishNow').checked ? 1 : 0,
                featured: document.getElementById('featuredPost').checked ? 1 : 0,
                products: collectProducts()
            };
            
            try {
                await apiRequest('PUT', `/reviews/${editId}`, postData);
                alert('글이 성공적으로 수정되었습니다!');
                delete this.dataset.editId;
                showSection('posts');
            } catch (error) {
                alert('글 수정 중 오류가 발생했습니다: ' + error.message);
            }
        }
    });
    
    // 테트리스 프로모션 버튼 추가
    const toolbar = document.querySelector('.ql-toolbar');
    if (toolbar) {
        const tetrisButton = document.createElement('button');
        tetrisButton.innerHTML = '🎮';
        tetrisButton.title = '테트리스 게임 프로모션 추가';
        tetrisButton.onclick = addTetrisPromotion;
        tetrisButton.className = 'ql-tetris';
        toolbar.appendChild(tetrisButton);
    }
});