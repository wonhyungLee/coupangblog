# 테트리스 게임 & 쿠팡 리뷰 사이트

테트리스 게임과 쿠팡 물품 비교 리뷰를 제공하는 웹 애플리케이션입니다.

## 주요 기능

1. **쿠팡 물품 비교 리뷰**
   - 관리자가 쿠팡 제품들을 비교하는 리뷰 작성
   - 제품별 장단점 비교
   - 쿠팡 파트너스 링크 포함

2. **SEO 최적화**
   - 메타 태그 자동 생성
   - 구조화된 데이터 (Schema.org)
   - Sitemap 자동 생성
   - robots.txt 설정

3. **테트리스 게임**
   - 클래식 테트리스 게임플레이
   - 점수 기록 기능
   - 모바일 지원
   - Google AdSense 광고 통합

4. **관리자 시스템**
   - Admin 계정으로 리뷰 관리
   - 리뷰 작성/수정/삭제
   - 사용자 관리
   - SEO 설정 관리

## 기술 스택

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Template Engine**: EJS
- **Authentication**: JWT, Express-session
- **Security**: Helmet, bcryptjs
- **Process Manager**: PM2
- **Web Server**: Nginx
- **Cloud**: Oracle Cloud (Ubuntu)

## 설치 방법

### 1. 로컬 개발 환경

```bash
# 저장소 클론
cd C:\Temp\tetris-game

# 의존성 설치
npm install

# MongoDB 실행 (별도 터미널)
mongod

# 환경 변수 설정
# .env 파일을 열어서 필요한 값들을 설정하세요

# 개발 서버 실행
npm run dev
```

### 2. Oracle Cloud Ubuntu 배포

1. **서버 준비**
   ```bash
   # 파일을 서버로 전송
   scp -r ./tetris-game ubuntu@your-server-ip:/home/ubuntu/
   
   # 서버 접속
   ssh ubuntu@your-server-ip
   ```

2. **배포 스크립트 실행**
   ```bash
   cd /home/ubuntu/tetris-game
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **환경 변수 설정**
   ```bash
   nano .env
   # 필요한 환경 변수들을 설정
   ```

4. **도메인 설정**
   - DNS A 레코드를 서버 IP로 설정
   - nginx.conf에서 도메인 변경

## 환경 변수 설정

`.env` 파일에 다음 변수들을 설정하세요:

```env
# 서버 설정
PORT=3000
NODE_ENV=production

# MongoDB 설정
MONGODB_URI=mongodb://localhost:27017/tetris-coupang-db

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key

# 세션 설정
SESSION_SECRET=your-super-secret-session-key

# Admin 계정 설정
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong-password-here

# Google AdSense 설정
GOOGLE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX

# SEO 설정
SITE_URL=https://yourdomain.com
SITE_NAME=테트리스 & 쿠팡 리뷰
SITE_DESCRIPTION=테트리스 게임과 쿠팡 물품 비교 리뷰 사이트
```

## 사용 방법

### 1. Admin 계정 초기화

처음 설치 후 다음 URL로 접속하여 Admin 계정을 생성합니다:
```
http://localhost:3000/auth/init-admin
```

### 2. 관리자 로그인

- URL: `/admin`
- 이메일: `.env`에 설정한 ADMIN_EMAIL
- 비밀번호: `.env`에 설정한 ADMIN_PASSWORD

### 3. 리뷰 작성

1. 관리자 대시보드에서 "새 리뷰 작성" 클릭
2. 제목, 내용, 카테고리 입력
3. 비교할 쿠팡 제품들 추가 (최소 2개 권장)
4. 각 제품의 정보, 장단점 입력
5. SEO 설정 (메타 제목, 설명)
6. 저장 및 게시

### 4. Google AdSense 설정

1. Google AdSense 계정 생성
2. 사이트 승인 받기
3. 광고 단위 생성
4. `.env` 파일에 클라이언트 ID 추가
5. 각 템플릿의 광고 슬롯 ID 수정

### 5. 쿠팡 파트너스 설정

1. 쿠팡 파트너스 가입
2. 제품 링크 생성 시 파트너스 링크 사용
3. 수수료 안내 문구 확인

## PM2 명령어

```bash
# 애플리케이션 상태 확인
pm2 status

# 로그 확인
pm2 logs

# 재시작
pm2 restart all

# 모니터링
pm2 monit
```

## 문제 해결

### MongoDB 연결 오류
```bash
sudo systemctl status mongod
sudo systemctl start mongod
```

### Nginx 오류
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 포트 충돌
```bash
sudo lsof -i :3000
# 프로세스 종료 후 재시작
```

## 보안 주의사항

1. 강력한 비밀번호 사용
2. HTTPS 필수 사용
3. 정기적인 보안 업데이트
4. 환경 변수 노출 주의
5. MongoDB 접근 제한

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 지원

문제가 발생하면 이슈를 생성하거나 contact@example.com으로 문의하세요.
