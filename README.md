# Wongram Shop - 쿠팡 제품 리뷰 블로그

쿠팡파트너스를 활용한 제품 리뷰 블로그 웹사이트입니다.

## 🌟 주요 기능

- 📝 제품 리뷰 및 비교 분석
- 🛍️ 쿠팡파트너스 제품 위젯 통합
- 🎮 테트리스 게임 (엔터테인먼트 섹션)
- 📱 반응형 디자인 (모바일/태블릿/PC)
- 🔍 제품 검색 기능
- 📊 카테고리별 제품 분류

## 📁 프로젝트 구조

```
wongram.shop/
│
├── index.html              # 메인 홈페이지
├── review-template.html    # 리뷰 페이지 템플릿
│
├── css/
│   ├── blog-style.css     # 메인 블로그 스타일
│   └── review-style.css   # 리뷰 페이지 스타일
│
├── js/
│   ├── blog-script.js     # 메인 블로그 스크립트
│   └── coupang-products.js # 쿠팡 상품 관리
│
├── tetris-game/           # 테트리스 게임 (서브 디렉토리)
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── audio/
│
├── images/                # 이미지 파일들
├── upload-to-server.sh    # 서버 배포 스크립트
└── nginx-config.conf      # Nginx 설정 파일
```

## 🚀 설치 및 배포

### 1. 로컬 개발 환경

```bash
# 프로젝트 클론
git clone [repository-url]
cd wongram-shop

# 로컬 서버 실행 (Python)
python -m http.server 8000

# 또는 Node.js
npx http-server
```

### 2. 오라클 클라우드 Ubuntu 서버 배포

1. **서버 정보 수정**
   ```bash
   # upload-to-server.sh 파일 편집
   SERVER_USER="ubuntu"
   SERVER_HOST="your-oracle-cloud-ip"
   ```

2. **배포 실행**
   ```bash
   chmod +x upload-to-server.sh
   ./upload-to-server.sh
   ```

3. **SSL 인증서 설정 (선택사항)**
   ```bash
   sudo certbot --nginx -d wongram.shop -d www.wongram.shop
   ```

## 🔧 쿠팡파트너스 설정

1. **트래킹 코드 설정**
   ```javascript
   // js/coupang-products.js 파일에서 수정
   const COUPANG_CONFIG = {
       trackingCode: 'YOUR_TRACKING_CODE', // 실제 트래킹 코드로 변경
       subId: 'wongram-shop'
   };
   ```

2. **상품 위젯 추가**
   ```html
   <!-- HTML에 쿠팡 위젯 삽입 -->
   <script src="https://ads-partners.coupang.com/g.js"></script>
   <script>
       new PartnersCoupang.G({
           id: 상품ID,
           template: "carousel",
           trackingCode: "YOUR_TRACKING_CODE",
           width: "100%",
           height: "auto"
       });
   </script>
   ```

## 📝 리뷰 작성 가이드

1. **새 리뷰 생성**
   - `review-template.html`을 복사하여 새 파일 생성
   - 제목, 내용, 상품 정보 수정

2. **상품 정보 추가**
   ```javascript
   // js/coupang-products.js에 상품 추가
   'product-id': {
       name: '상품명',
       coupangUrl: '쿠팡파트너스 링크',
       price: '가격',
       rating: 평점,
       reviews: 리뷰수
   }
   ```

## 🎮 테트리스 게임

- URL: `https://wongram.shop/tetris-game`
- 메인 메뉴의 "게임" 버튼을 통해 접근 가능
- 독립적인 서브 애플리케이션으로 운영

## 🔍 SEO 최적화

- 구조화된 데이터 마크업
- 메타 태그 최적화
- 사이트맵 생성
- robots.txt 설정

## 📱 반응형 디자인

- 모바일: 320px ~ 768px
- 태블릿: 768px ~ 1024px
- 데스크톱: 1024px 이상

## 🐛 문제 해결

### Nginx 설정 오류
```bash
sudo nginx -t  # 설정 테스트
sudo systemctl reload nginx  # 재시작
```

### 권한 문제
```bash
sudo chown -R www-data:www-data /var/www/wongram.shop
sudo chmod -R 755 /var/www/wongram.shop
```

## 📄 라이선스

이 프로젝트는 개인 사용 목적으로 제작되었습니다.

## 🤝 기여 방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트 관련 문의사항은 이슈 트래커를 이용해주세요.

---

**Note**: 쿠팡파트너스 활동을 위해서는 반드시 쿠팡파트너스 이용약관을 준수해야 합니다.