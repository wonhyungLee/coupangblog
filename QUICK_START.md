# 빠른 시작 가이드

## 1. 사전 준비사항
- Node.js 18.x 이상
- MongoDB 설치
- Git

## 2. 로컬 개발 환경 설정

### Step 1: MongoDB 실행
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

### Step 2: 프로젝트 설정
```bash
cd C:\Temp\tetris-game
npm install
```

### Step 3: 환경 변수 설정
`.env` 파일을 열어서 다음을 수정하세요:
- `MONGODB_URI`: MongoDB 연결 문자열
- `JWT_SECRET`: 임의의 긴 문자열로 변경
- `SESSION_SECRET`: 임의의 긴 문자열로 변경
- `ADMIN_EMAIL`: 관리자 이메일
- `ADMIN_PASSWORD`: 관리자 비밀번호

### Step 4: 개발 서버 실행
```bash
npm run dev
```

### Step 5: Admin 계정 초기화
브라우저에서 접속: `http://localhost:3000/auth/init-admin`

### Step 6: 관리자 로그인
- URL: `http://localhost:3000/admin`
- 이메일: `.env`에 설정한 `ADMIN_EMAIL`
- 비밀번호: `.env`에 설정한 `ADMIN_PASSWORD`

## 3. 첫 리뷰 작성하기

1. 관리자 대시보드에서 "새 리뷰 작성" 클릭
2. 제목과 내용 입력
3. 카테고리 선택 (전자제품, 생활용품, 패션, 식품)
4. "제품 추가" 버튼으로 쿠팡 제품 정보 추가
   - 제품명
   - 쿠팡 URL (파트너스 링크)
   - 가격
   - 평점
   - 장단점
5. SEO 설정 (선택사항)
6. 상태를 "게시"로 변경
7. 저장

## 4. 주요 URL

- 홈: `http://localhost:3000`
- 리뷰 목록: `http://localhost:3000/reviews`
- 테트리스 게임: `http://localhost:3000/game/tetris`
- 관리자: `http://localhost:3000/admin`

## 5. Oracle Cloud 배포

1. 서버에 파일 업로드
```bash
scp -r ./* ubuntu@your-server-ip:/home/ubuntu/tetris-game/
```

2. 서버 접속 및 배포
```bash
ssh ubuntu@your-server-ip
cd /home/ubuntu/tetris-game
chmod +x deploy.sh
./deploy.sh
```

3. 도메인 설정
- DNS A 레코드를 서버 IP로 설정
- nginx.conf의 도메인 수정

## 6. 문제 해결

### MongoDB 연결 오류
```bash
# MongoDB 상태 확인
sudo systemctl status mongod

# MongoDB 재시작
sudo systemctl restart mongod
```

### 포트 충돌 (3000번)
```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

### npm 패키지 오류
```bash
rm -rf node_modules package-lock.json
npm install
```

## 7. 추가 설정

### Google AdSense
1. Google AdSense 계정 생성
2. 사이트 승인 받기
3. `.env`에 클라이언트 ID 추가
4. 각 템플릿의 광고 슬롯 ID 수정

### 쿠팡 파트너스
1. 쿠팡 파트너스 가입
2. 제품 링크 생성 시 파트너스 ID 포함

### SEO 최적화
1. 관리자 페이지 > SEO 설정
2. "사이트맵 생성" 클릭
3. Google Search Console에 사이트 등록
4. sitemap.xml 제출

## 지원

문의사항이 있으면 README.md를 참고하거나 이슈를 생성해주세요.
