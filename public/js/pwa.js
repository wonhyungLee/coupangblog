// PWA 관리 스크립트
class PWAManager {
    constructor() {
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        this.installPrompt = null;
        this.init();
    }

    init() {
        // Service Worker 등록
        this.registerServiceWorker();
        
        // 설치 프롬프트 이벤트 리스너
        this.setupInstallPrompt();
        
        // 온라인/오프라인 상태 감지
        this.setupNetworkDetection();
        
        // 푸시 알림 권한 요청
        this.setupPushNotifications();
        
        // PWA 업데이트 확인
        this.checkForUpdates();
    }

    // Service Worker 등록
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });
                
                console.log('Service Worker 등록 성공:', registration.scope);
                
                // 업데이트 확인
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

                return registration;
            } catch (error) {
                console.error('Service Worker 등록 실패:', error);
            }
        }
    }

    // 설치 프롬프트 설정
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPrompt = e;
            this.showInstallButton();
        });

        // 설치 완료 이벤트
        window.addEventListener('appinstalled', (e) => {
            console.log('PWA 설치 완료');
            this.hideInstallButton();
            this.trackEvent('pwa_installed');
        });
    }

    // 설치 버튼 표시
    showInstallButton() {
        const installBtn = document.getElementById('install-app-btn');
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.addEventListener('click', () => this.installApp());
        } else {
            this.createInstallBanner();
        }
    }

    // 설치 배너 생성
    createInstallBanner() {
        if (this.isStandalone || document.getElementById('pwa-install-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: linear-gradient(45deg, #3498db, #2980b9);
                color: white;
                padding: 15px;
                border-radius: 15px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.3);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: space-between;
                animation: slideUp 0.5s ease;
            ">
                <div>
                    <strong>📱 앱으로 설치하기</strong>
                    <p style="margin: 5px 0 0; font-size: 0.9rem; opacity: 0.9;">
                        더 빠르고 편리한 이용을 위해 앱으로 설치하세요
                    </p>
                </div>
                <div>
                    <button id="pwa-install-btn" style="
                        background: rgba(255,255,255,0.2);
                        border: 1px solid rgba(255,255,255,0.3);
                        color: white;
                        padding: 8px 16px;
                        border-radius: 20px;
                        cursor: pointer;
                        margin-right: 10px;
                    ">설치</button>
                    <button id="pwa-close-btn" style="
                        background: none;
                        border: none;
                        color: white;
                        font-size: 1.2rem;
                        cursor: pointer;
                        padding: 5px;
                    ">×</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // 이벤트 리스너
        document.getElementById('pwa-install-btn').addEventListener('click', () => this.installApp());
        document.getElementById('pwa-close-btn').addEventListener('click', () => this.hideInstallBanner());

        // 자동 숨김 (30초 후)
        setTimeout(() => this.hideInstallBanner(), 30000);
    }

    // 앱 설치
    async installApp() {
        if (!this.installPrompt) return;

        try {
            const result = await this.installPrompt.prompt();
            console.log('설치 프롬프트 결과:', result.outcome);
            
            if (result.outcome === 'accepted') {
                this.trackEvent('pwa_install_accepted');
            } else {
                this.trackEvent('pwa_install_dismissed');
            }
            
            this.installPrompt = null;
            this.hideInstallBanner();
        } catch (error) {
            console.error('설치 실패:', error);
        }
    }

    // 설치 버튼/배너 숨김
    hideInstallButton() {
        const installBtn = document.getElementById('install-app-btn');
        if (installBtn) installBtn.style.display = 'none';
    }

    hideInstallBanner() {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) banner.remove();
    }

    // 네트워크 상태 감지
    setupNetworkDetection() {
        // 온라인 상태 변경 감지
        window.addEventListener('online', () => {
            this.showNetworkStatus('온라인', '#27ae60');
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.showNetworkStatus('오프라인', '#e74c3c');
        });

        // 초기 상태 확인
        if (!navigator.onLine) {
            this.showNetworkStatus('오프라인', '#e74c3c');
        }
    }

    // 네트워크 상태 표시
    showNetworkStatus(status, color) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${color};
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            z-index: 9999;
            font-weight: bold;
            animation: slideDown 0.5s ease;
        `;
        notification.textContent = `🌐 ${status}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // 오프라인 데이터 동기화
    async syncOfflineData() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('background-sync');
                console.log('백그라운드 동기화 등록됨');
            } catch (error) {
                console.error('동기화 등록 실패:', error);
            }
        }
    }

    // 푸시 알림 설정
    async setupPushNotifications() {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            console.log('푸시 알림 지원되지 않음');
            return;
        }

        // 권한 상태 확인
        let permission = Notification.permission;
        
        if (permission === 'default') {
            // 설치 후 또는 적절한 시점에 권한 요청
            setTimeout(() => this.requestNotificationPermission(), 5000);
        }
    }

    // 알림 권한 요청
    async requestNotificationPermission() {
        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                console.log('알림 권한 허용됨');
                this.subscribeToNotifications();
                this.trackEvent('notification_permission_granted');
            } else {
                console.log('알림 권한 거부됨');
                this.trackEvent('notification_permission_denied');
            }
        } catch (error) {
            console.error('알림 권한 요청 실패:', error);
        }
    }

    // 푸시 알림 구독
    async subscribeToNotifications() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(
                    'YOUR_VAPID_PUBLIC_KEY_HERE' // VAPID 키로 교체 필요
                )
            });

            // 서버에 구독 정보 전송
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription)
            });

            console.log('푸시 알림 구독 완료');
        } catch (error) {
            console.error('푸시 알림 구독 실패:', error);
        }
    }

    // VAPID 키 변환 유틸리티
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // PWA 업데이트 확인
    checkForUpdates() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    }

    // 업데이트 알림 표시
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #3498db;
                color: white;
                padding: 15px;
                border-radius: 10px;
                z-index: 9999;
                max-width: 300px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            ">
                <strong>🔄 업데이트 가능</strong>
                <p style="margin: 5px 0;">새로운 버전이 있습니다.</p>
                <button onclick="window.location.reload()" style="
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 5px 15px;
                    border-radius: 15px;
                    cursor: pointer;
                    margin-right: 10px;
                ">업데이트</button>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 5px;
                ">나중에</button>
            </div>
        `;
        document.body.appendChild(notification);
    }

    // 이벤트 추적
    trackEvent(eventName, data = {}) {
        // Google Analytics 또는 다른 분석 도구로 이벤트 전송
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
        console.log('PWA Event:', eventName, data);
    }

    // PWA 상태 정보
    getInfo() {
        return {
            isStandalone: this.isStandalone,
            isOnline: navigator.onLine,
            hasServiceWorker: 'serviceWorker' in navigator,
            hasNotifications: 'Notification' in window,
            notificationPermission: Notification?.permission || 'not-supported'
        };
    }
}

// PWA 매니저 초기화
const pwaManager = new PWAManager();

// 글로벌 접근 가능하도록 설정
window.PWA = pwaManager;

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideDown {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    .pwa-installing {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
`;
document.head.appendChild(style);
