# 🚀 Wongram Shop 빠른 시작 가이드

## 1. 초기 설정 (5분 소요)

### 필수 요구사항
- Node.js 14.0 이상
- npm 6.0 이상

### 설치 단계

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **서버 시작**
   ```bash
   # Windows
   start-server.bat
   
   # Mac/Linux
   npm start
   ```

3. **접속 확인**
   - 메인 페이지: http://localhost:8080
   - 관리자 페이지: http://localhost:8080/admin.html
   - 테트리스 게임: http://localhost:8080/tetris-game

## 2. 관리자 첫 로그인

1. http://localhost:8080/admin.html 접속
2. 로그인 정보:
   - ID: `admin`
   - PW: `coupang2024!`
3. **⚠️ 중요**: 첫 로그인 후 반드시 비밀번호 변경

## 3. 첫 리뷰 작성하기

### 3-1. 관리자 페이지에서
1. "글쓰기" 탭 클릭
2. 제목 입력 (예: "2024년 최고의 무선 이어폰 TOP 5")
3. 카테고리 선택
4. 본문 작성 (에디터 사용)
5. 상품 추가:
   - "+ 상품 추가" 클릭
   - 상품명, 쿠팡 링크, 가격 입력
6. SEO 설정:
   - 메타 설명 작성
   - 키워드 입력
7. "발행하기" 클릭

### 3-2. 쿠팡 파트너스 설정
1. [쿠팡 파트너스](https://partners.coupang.com) 가입
2. 승인 후 트래킹 코드 발급
3. 관리자 페이지 > "상품 관리"에서 트래킹 코드 입력

## 4. SEO 기본 설정

### 4-1. 관리자 페이지에서
1. "SEO 설정" 탭 클릭
2. 입력 항목:
   - 사이트 제목
   - 사이트 설명
   - Google Analytics ID (있는 경우)
   - 네이버 웹마스터 인증 코드 (있는 경우)
3. "저장" 클릭

### 4-2. 검색 엔진 등록
1. [Google Search Console](https://search.google.com/search-console)
2. [네이버 웹마스터도구](https://searchadvisor.naver.com)
3. 사이트맵 제출: `https://yourdomain.com/sitemap.xml`

## 5. 테트리스 게임 연동 확인

### 5-1. 자동 프로모션 테스트
1. 리뷰 페이지 접속
2. 2분 대기 → 테트리스 하이라이트 표시
3. 페이지 70% 스크롤 → 알림 표시

### 5-2. 수동 링크 추가
관리자 에디터에서:
```html
<div class="tetris-promotion">
    <h3>🎮 잠깐! 쇼핑 전에 게임 한 판 어때요?</h3>
    <p>스트레스 해소에 좋은 테트리스 게임을 즐겨보세요!</p>
    <a href="/tetris-game" target="_blank" class="tetris-button">테트리스 플레이</a>
</div>
```

## 6. 운영 팁

### 효과적인 리뷰 작성
1. **제목**: "2024년" + 제품 + "추천/비교/리뷰"
2. **첫 문단**: 핵심 내용 요약
3. **구조**: 
   - 서론
   - 제품별 상세 리뷰
   - 비교표
   - 결론 및 추천
4. **이미지**: alt 텍스트 필수
5. **길이**: 최소 1000자 이상

### 쿠팡 상품 배치
1. 첫 번째 소제목 다음
2. 각 제품 설명 직후
3. 결론 부분에 종합 추천

### 테트리스 게임 활용
1. "쇼핑 피로 해소" 컨셉
2. "집중력 향상 후 현명한 쇼핑" 메시지
3. 리뷰 중간 휴식 포인트로 활용

## 7. 문제 해결

### 서버 오류
```bash
# 포트 충돌 시
netstat -an | findstr :8080
# 프로세스 종료 후 재시작

# 권한 오류 시
# Windows: 관리자 권한으로 실행
# Mac/Linux: sudo npm start
```

### 리뷰 표시 안 됨
1. F12 → Console 에러 확인
2. Network 탭에서 API 응답 확인
3. 데이터베이스 파일 존재 확인

### 관리자 로그인 실패
1. 비밀번호 확인 (대소문자 구분)
2. server-enhanced.js에서 인증 정보 확인

## 8. 배포 준비

### 8-1. 보안 설정
```javascript
// server-enhanced.js 수정
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'your-secure-password';
```

### 8-2. 환경 변수 설정
```bash
# .env 파일 생성
ADMIN_USERNAME=your-username
ADMIN_PASSWORD=your-secure-password
PORT=8080
NODE_ENV=production
```

### 8-3. HTTPS 설정
- Let's Encrypt SSL 인증서 발급
- 또는 Cloudflare 같은 CDN 사용

## 📞 지원

문제가 있으신가요?
- 이슈 등록: GitHub Issues
- 이메일: support@wongram.shop

---

**행운을 빕니다! 🎉**