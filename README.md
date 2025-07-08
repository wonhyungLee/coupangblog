# Wongram Shop - 쿠팡 파트너스 블로그 & 테트리스 게임

스마트한 쇼핑 가이드를 제공하는 쿠팡 파트너스 블로그와 테트리스 게임을 결합한 웹 애플리케이션입니다.

## 🚀 주요 기능

### 1. 쿠팡 파트너스 블로그
- **제품 리뷰 작성 및 관리**: 관리자 페이지에서 HTML 에디터로 리뷰 작성
- **쿠팡 제품 링크 통합**: 각 리뷰에 쿠팡 파트너스 상품 링크 삽입
- **SEO 최적화**: 
  - 동적 메타 태그 생성
  - 구조화된 데이터 (Schema.org)
  - 자동 사이트맵 생성
  - SEO 친화적 URL (slug)

### 2. 테트리스 게임 연동
- **자연스러운 게임 유도**: 
  - 페이지 체류 시간에 따른 게임 추천
  - 스크롤 기반 프로모션
  - 플로팅 버튼 및 알림
- **랭킹 시스템**: SQLite 데이터베이스 기반 점수 관리
- **모바일 최적화**: 터치 컨트롤 지원

### 3. 관리자 시스템
- **로그인 인증**: Basic Auth 기반 보안
- **리뷰 관리**: CRUD 기능
- **SEO 설정**: 전역 SEO 설정 관리
- **상품 관리**: 쿠팡 상품 검색 및 추가

## 📋 설치 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 서버 시작
```bash
# 개선된 서버 실행 (권장)
npm start

# 원본 서버 실행
npm run start-original

# 개발 모드 (자동 재시작)
npm run dev
```

### 3. 접속
- 메인 페이지: http://localhost:8080
- 관리자 페이지: http://localhost:8080/admin.html
- 테트리스 게임: http://localhost:8080/tetris-game

## 🔧 설정

### 관리자 계정
```javascript
// server-enhanced.js에서 변경 가능
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'coupang2024!';
```

### 쿠팡 파트너스 설정
1. 쿠팡 파트너스 가입 및 승인
2. 트래킹 코드 발급
3. 관리자 페이지에서 트래킹 코드 입력
4. 각 상품 링크에 적용

## 📁 프로젝트 구조

```
coupangblog/
├── index.html              # 메인 페이지
├── admin.html              # 관리자 페이지
├── review-dynamic.html     # 동적 리뷰 페이지
├── review-template.html    # 리뷰 템플릿
├── tetris-game-index.html  # 테트리스 게임
├── server-enhanced.js      # 개선된 서버 (API 포함)
├── server.js              # 원본 서버
├── robots.txt             # 검색 엔진 크롤링 설정
├── sitemap.xml            # 사이트맵
├── css/
│   ├── blog-style.css     # 블로그 스타일
│   ├── review-style.css   # 리뷰 페이지 스타일
│   ├── admin-style.css    # 관리자 스타일
│   └── style.css          # 테트리스 게임 스타일
├── js/
│   ├── blog-script-enhanced.js  # 메인 페이지 스크립트
│   ├── admin-script-enhanced.js # 관리자 스크립트
│   ├── review-loader.js         # 리뷰 동적 로더
│   ├── tetris.js               # 테트리스 게임
│   └── ranking.js              # 랭킹 시스템
└── reviews/                    # 생성된 리뷰 HTML 파일

```

## 🔍 SEO 최적화 전략

### 1. 온페이지 SEO
- **제목 최적화**: 60자 이내, 핵심 키워드 포함
- **메타 설명**: 155-160자, 클릭 유도 문구
- **URL 구조**: `/review/best-wireless-earphones-2024`
- **내부 링크**: 관련 리뷰 자동 연결

### 2. 기술적 SEO
- **사이트맵**: 자동 생성 및 업데이트
- **robots.txt**: 크롤링 최적화
- **구조화된 데이터**: Article, Product 스키마
- **모바일 최적화**: 반응형 디자인

### 3. 콘텐츠 SEO
- **키워드 전략**: 제품명 + 리뷰/비교/추천
- **콘텐츠 길이**: 최소 300단어 이상
- **이미지 최적화**: alt 텍스트 필수

## 🎮 테트리스 게임 통합 전략

### 1. 자연스러운 유도
- 리뷰 읽는 중간에 휴식 제안
- 페이지 하단 도달 시 게임 추천
- 2분 이상 체류 시 알림

### 2. 게임 프로모션 위치
- 리뷰 중간 섹션
- 사이드바 위젯
- 플로팅 버튼
- 네비게이션 메뉴

### 3. 사용자 경험
- 새 창에서 게임 실행
- 게임 후 원래 페이지로 복귀
- 랭킹 시스템으로 재방문 유도

## 📊 API 엔드포인트

### 리뷰 API
- `GET /api/reviews` - 리뷰 목록
- `GET /api/reviews/:slug` - 특정 리뷰
- `POST /api/reviews` - 리뷰 생성 (관리자)
- `PUT /api/reviews/:id` - 리뷰 수정 (관리자)
- `DELETE /api/reviews/:id` - 리뷰 삭제 (관리자)

### SEO 설정 API
- `GET /api/seo-settings` - SEO 설정 조회
- `POST /api/seo-settings` - SEO 설정 업데이트 (관리자)

### 테트리스 랭킹 API
- `GET /api/rankings` - 랭킹 목록
- `POST /api/rankings` - 점수 등록
- `GET /api/rankings/player/:nickname` - 플레이어 최고 기록

## 💡 사용 팁

### 1. 리뷰 작성 시
- 제목에 년도와 "추천", "비교" 등의 키워드 포함
- 첫 문단에 핵심 내용 요약
- 상품 정보는 첫 번째 소제목 다음에 배치
- 테트리스 게임 링크를 자연스럽게 삽입

### 2. 쿠팡 상품 추가
- 정확한 상품명 입력
- 현재 가격 정보 유지
- 평점 정보 포함
- 쿠팡 파트너스 링크 사용

### 3. SEO 개선
- 주기적으로 사이트맵 확인
- Google Search Console 연동
- 네이버 웹마스터도구 등록
- 페이지 로딩 속도 최적화

## 🔒 보안 주의사항

1. **관리자 비밀번호 변경**: 실제 운영 시 반드시 변경
2. **환경 변수 사용**: 민감한 정보는 환경 변수로 관리
3. **HTTPS 적용**: 실제 배포 시 SSL 인증서 필수
4. **쿠팡 파트너스 ID 보호**: 클라이언트 코드에 노출 주의

## 📈 수익화 전략

1. **양질의 리뷰 콘텐츠**: 실제 사용 경험 기반
2. **비교 분석 콘텐츠**: 여러 제품 동시 비교
3. **시즈널 콘텐츠**: 계절별 추천 상품
4. **테트리스 게임**: 체류 시간 증가로 SEO 개선

## 🆘 문제 해결

### 서버가 시작되지 않을 때
```bash
# 포트 확인
netstat -an | findstr :8080

# 프로세스 종료 후 재시작
taskkill /F /PID [프로세스ID]
npm start
```

### 데이터베이스 오류
```bash
# 데이터베이스 파일 확인
dir *.db

# 권한 문제 시
icacls coupangblog.db /grant Everyone:F
```

### 리뷰가 표시되지 않을 때
1. 브라우저 콘솔에서 에러 확인
2. 네트워크 탭에서 API 응답 확인
3. 데이터베이스에 리뷰 존재 여부 확인

## 📝 라이선스

MIT License - 자유롭게 사용 가능

## 👨‍💻 개발자

Wongram - 스마트한 쇼핑 가이드

---

**참고**: 이 프로젝트는 쿠팡 파트너스 활동의 일환으로 개발되었으며, 일정액의 수수료를 제공받을 수 있습니다.