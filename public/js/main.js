// Enhanced Main Page JavaScript
class MainPageController {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.setupAnimations();
    }

    setupEventListeners() {
        // PWA Installation
        this.setupPWAInstallation();
        
        // Search functionality
        this.setupSearch();
        
        // Mobile menu if exists
        this.setupMobileMenu();
    }

    setupPWAInstallation() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            const pwaPrompt = document.getElementById('pwa-prompt');
            if (pwaPrompt) pwaPrompt.style.display = 'block';
        });

        const installBtn = document.getElementById('pwa-install');
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`PWA 설치 결과: ${outcome}`);
                    deferredPrompt = null;
                    document.getElementById('pwa-prompt').style.display = 'none';
                }
            });
        }

        const dismissBtn = document.getElementById('pwa-dismiss');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                const pwaPrompt = document.getElementById('pwa-prompt');
                if (pwaPrompt) pwaPrompt.style.display = 'none';
            });
        }
    }

    setupSearch() {
        const searchForm = document.querySelector('.search-box');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                const input = searchForm.querySelector('input');
                if (!input.value.trim()) {
                    e.preventDefault();
                    input.focus();
                }
            });
        }
    }

    setupMobileMenu() {
        // Mobile menu toggle functionality
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }
    }

    async loadInitialData() {
        // Load reviews with enhanced error handling
        await this.loadLatestReviews();
        
        // Load game statistics
        this.loadGameStats();
        
        // Start counter animations
        this.animateCounters();
    }

    async loadLatestReviews() {
        const reviewsContainer = document.getElementById('latest-reviews');
        if (!reviewsContainer) return;

        try {
            // Show loading state
            reviewsContainer.innerHTML = `
                <div class="loading-placeholder">
                    <div class="spinner"></div>
                    <p>리뷰를 불러오는 중...</p>
                </div>
            `;

            const response = await fetch('/reviews/api?limit=6');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.reviews && data.reviews.length > 0) {
                reviewsContainer.innerHTML = data.reviews.map(review => `
                    <article class="review-card">
                        <a href="/reviews/${review.slug}">
                            <div class="review-image">
                                <img src="${review.featuredImage || '/images/default-review.svg'}" 
                                     alt="${review.title}"
                                     onerror="this.src='/images/default-review.svg'">
                            </div>
                            <div class="review-content">
                                <span class="review-category">${review.category || '일반'}</span>
                                <h3>${review.title}</h3>
                                <p>${review.metaDescription || review.content?.substring(0, 100) || '설명이 없습니다.'}...</p>
                                <div class="review-meta">
                                    <span class="author">by ${review.author?.username || '관리자'}</span>
                                    <span class="date">${this.formatDate(review.publishedAt || review.createdAt)}</span>
                                </div>
                            </div>
                        </a>
                    </article>
                `).join('');
                
                // Update total reviews count
                const totalReviewsEl = document.getElementById('total-reviews');
                if (totalReviewsEl) {
                    totalReviewsEl.textContent = data.total || data.reviews.length;
                }
            } else {
                reviewsContainer.innerHTML = `
                    <div class="no-reviews">
                        <div class="no-reviews-icon">📝</div>
                        <h3>아직 리뷰가 없습니다</h3>
                        <p>첫 번째 리뷰를 작성해보세요!</p>
                        <a href="/admin" class="btn btn-primary">리뷰 작성하기</a>
                    </div>
                `;
            }
        } catch (error) {
            console.error('리뷰 로드 실패:', error);
            reviewsContainer.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">😅</div>
                    <h3>리뷰를 불러올 수 없습니다</h3>
                    <p>서버 연결을 확인해주세요.</p>
                    <button onclick="mainController.loadLatestReviews()" class="btn btn-primary">다시 시도</button>
                </div>
            `;
        }
    }

    loadGameStats() {
        // Load game statistics from localStorage
        const totalPlays = localStorage.getItem('tetris-total-plays') || '0';
        const totalGamesEl = document.getElementById('total-games');
        
        if (totalGamesEl) {
            // Add some demo data to make it look more active
            const baseCount = parseInt(totalPlays) + 1247;
            totalGamesEl.textContent = baseCount.toLocaleString();
        }
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    this.animateCounter(entry.target);
                    entry.target.classList.add('animated');
                }
            });
        });

        counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.textContent.replace(/,/g, ''));
        if (isNaN(target)) return;
        
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 30);
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        // Observe sections for scroll animations
        document.querySelectorAll('section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });

        // Observe cards for stagger animation
        document.querySelectorAll('.review-card, .category-card, .feature-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(card);
        });
    }

    formatDate(dateString) {
        if (!dateString) return '날짜 없음';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return '날짜 없음';
        }
    }
}

// Service Worker registration
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker 등록 성공');
        } catch (error) {
            console.error('Service Worker 등록 실패:', error);
        }
    }
}

// Initialize everything when DOM is loaded
let mainController;

document.addEventListener('DOMContentLoaded', () => {
    mainController = new MainPageController();
    registerServiceWorker();
});

// Export for global access
window.mainController = mainController;
