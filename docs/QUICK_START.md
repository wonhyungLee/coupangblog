# 🚀 WonGram Shop PWA & AI - 빠른 시작 가이드

WonGram Shop은 테트리스 게임과 쿠팡 제품 리뷰를 결합한 혁신적인 PWA(Progressive Web App) 플랫폼입니다. AI 어시스턴트가 포함되어 있어 리뷰 작성을 자동화할 수 있습니다.

## 📋 목차

1. [시스템 요구사항](#시스템-요구사항)
2. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
3. [Oracle Cloud Ubuntu 배포](#oracle-cloud-ubuntu-배포)
4. [PWA 기능 설정](#pwa-기능-설정)
5. [AI 어시스턴트 설정](#ai-어시스턴트-설정)
6. [도메인 설정 (wongram.shop)](#도메인-설정)
7. [문제 해결](#문제-해결)

## 🔧 시스템 요구사항

### 로컬 개발 환경
- **Node.js**: v18.x 이상 (LTS 권장)
- **NPM**: v9.x 이상
- **MongoDB**: v6.0 이상
- **Git**: 최신 버전

### Oracle Cloud 서버
- **OS**: Ubuntu 22.04 LTS
- **CPU**: 최소 1 Core (2 Core 권장)
- **RAM**: 최소 1GB (2GB 권장)
- **Storage**: 최소 20GB
- **Network**: HTTP/HTTPS 포트 개방

### 필요한 API 키
- **OpenAI API Key**: AI 어시스턴트 기능용
- **Google AdSense**: 수익화 (선택사항)
- **VAPID Keys**: 푸시 알림용 (자동 생성 가능)

## 🏠 로컬 개발 환경 설정

### 1. 프로젝트 클론 및 설정

```bash
# 프로젝트 클론
git clone <repository-url> wongram-shop
cd wongram-shop

# 환경 변수 설정
cp .env.example .env
nano .env  # 필요한 값들 입력

# 의존성 설치
npm install
```

### 2. MongoDB 설치 및 시작

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y mongodb

# macOS (Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# MongoDB 시작
sudo systemctl start mongod  # Linux
brew services start mongodb/brew/mongodb-community  # macOS
```

### 3. 개발 서버 시작

```bash
# 방법 1: 스크립트 사용
chmod +x start-server.sh
./start-server.sh

# 방법 2: 직접 명령어
npm run dev
```

### 4. 브라우저에서 확인

- **메인 사이트**: http://localhost:3000
- **테트리스 게임**: http://localhost:3000/game/tetris
- **관리자 페이지**: http://localhost:3000/admin

## ☁️ Oracle Cloud Ubuntu 배포

### 1. Oracle Cloud 인스턴스 생성

1. Oracle Cloud 콘솔에 로그인
2. Compute > Instances > Create Instance
3. Ubuntu 22.04 LTS 선택
4. VM.Standard.E2.1.Micro (Always Free) 또는 더 큰 인스턴스
5. SSH 키 설정
6. 인스턴스 생성

### 2. 보안 규칙 설정

```bash
# 인바운드 규칙 추가
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 3000 (Node.js) - 임시
```

### 3. 파일 업로드

```bash
# 로컬에서 서버로 파일 전송
scp -r ./* ubuntu@<서버-IP>:/home/ubuntu/coupangblog/

# 또는 Git 사용
ssh ubuntu@<서버-IP>
git clone <repository-url> coupangblog
cd coupangblog
```

### 4. 자동 배포 스크립트 실행

```bash
# 스크립트 실행 권한 부여
chmod +x deploy.sh

# 배포 시작
./deploy.sh

# 스크립트가 다음을 자동으로 수행:
# - 시스템 업데이트
# - Node.js, MongoDB, PM2, Nginx 설치
# - 애플리케이션 설정
# - SSL 인증서 설정
# - 방화벽 설정
```

### 5. 환경 변수 설정

```bash
nano .env

# 필수 환경 변수들:
SITE_URL=https://wongram.shop
MONGODB_URI=mongodb://localhost:27017/wongram-shop-db
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here
ADMIN_EMAIL=admin@wongram.shop
ADMIN_PASSWORD=your-admin-password
OPENAI_API_KEY=your-openai-api-key-here
```

## 📱 PWA 기능 설정

### 1. PWA 아이콘 생성

필요한 아이콘 크기들:
- 16x16, 32x32, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

```bash
# 온라인 도구 사용 (권장):
# https://realfavicongenerator.net/
# https://www.pwabuilder.com/imageGenerator

# 생성된 아이콘들을 public/images/ 폴더에 업로드
```

### 2. Service Worker 확인

```bash
# 브라우저 개발자 도구에서:
# Application > Service Workers 탭에서 sw.js 등록 확인
```

### 3. PWA 설치 테스트

```bash
# Chrome에서:
# 주소창 오른쪽의 설치 아이콘 클릭
# 또는 메뉴 > 앱 설치
```

## 🤖 AI 어시스턴트 설정

### 1. OpenAI API 키 발급

1. https://platform.openai.com/ 방문
2. API Keys 메뉴에서 새 키 생성
3. .env 파일에 추가:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

### 2. AI 기능 활성화

```bash
# 관리자로 로그인 후 AI 어시스턴트 패널 자동 표시
# 다음 기능들 사용 가능:
# - 리뷰 개요 자동 생성
# - 제품 비교 분석
# - SEO 최적화 제안
# - 스마트 태그 제안
```

### 3. AI 사용법

1. **리뷰 개요 생성**:
   - 제품명, 카테고리, 가격 입력
   - "개요 생성" 버튼 클릭
   - 생성된 내용을 리뷰 에디터에 복사

2. **제품 비교**:
   - 비교할 제품들 정보 입력
   - "비교 분석" 버튼 클릭
   - 상세한 비교표 자동 생성

## 🌐 도메인 설정 (wongram.shop)

### 1. DNS 설정

```bash
# 도메인 관리 패널에서 A 레코드 추가:
# 타입: A
# 이름: @
# 값: <Oracle-Cloud-서버-IP>

# WWW 서브도메인:
# 타입: CNAME
# 이름: www
# 값: wongram.shop
```

### 2. SSL 인증서 자동 갱신

```bash
# Let's Encrypt 자동 갱신 설정 (배포 스크립트에 포함됨)
sudo crontab -e

# 다음 줄 추가:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. 도메인 연결 확인

```bash
# DNS 전파 확인
nslookup wongram.shop

# 웹사이트 접속 테스트
curl -I https://wongram.shop
```

## 🚀 서비스 시작 및 관리

### PM2 명령어

```bash
# 서비스 시작
pm2 start ecosystem.config.js

# 상태 확인
pm2 list
pm2 monit

# 로그 확인
pm2 logs wongram-shop

# 재시작
pm2 restart wongram-shop

# 중지
pm2 stop wongram-shop

# 서비스 저장 (재부팅 시 자동 시작)
pm2 save
pm2 startup
```

### Nginx 관리

```bash
# 설정 테스트
sudo nginx -t

# 재시작
sudo systemctl restart nginx

# 상태 확인
sudo systemctl status nginx

# 로그 확인
sudo tail -f /var/log/nginx/error.log
```

### MongoDB 관리

```bash
# 상태 확인
sudo systemctl status mongod

# 시작/중지/재시작
sudo systemctl start mongod
sudo systemctl stop mongod
sudo systemctl restart mongod

# 백업
mongodump --out /backup/$(date +%Y%m%d)

# 복원
mongorestore /backup/20240101
```

## 🔧 문제 해결

### 일반적인 문제들

#### 1. 포트 3000이 이미 사용 중

```bash
# 사용 중인 프로세스 확인
sudo lsof -i :3000

# 프로세스 종료
sudo kill -9 <PID>

# 또는 PM2로 모든 프로세스 중지
pm2 delete all
```

#### 2. MongoDB 연결 실패

```bash
# MongoDB 상태 확인
sudo systemctl status mongod

# MongoDB 시작
sudo systemctl start mongod

# 연결 테스트
mongosh --eval "db.adminCommand('ping')"
```

#### 3. SSL 인증서 문제

```bash
# 수동으로 SSL 인증서 재발급
sudo certbot --nginx -d wongram.shop -d www.wongram.shop

# 인증서 갱신
sudo certbot renew

# Nginx 설정 테스트
sudo nginx -t
```

#### 4. PWA 설치 버튼이 나타나지 않음

```bash
# 브라우저 개발자 도구에서:
# 1. Console 탭에서 Service Worker 오류 확인
# 2. Application > Manifest 탭에서 manifest.json 확인
# 3. Security 탭에서 HTTPS 연결 확인
```

#### 5. AI 어시스턴트가 작동하지 않음

```bash
# OpenAI API 키 확인
grep OPENAI_API_KEY .env

# API 키 테스트
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models

# 로그 확인
pm2 logs wongram-shop | grep -i openai
```

### 성능 최적화

#### 1. Node.js 메모리 최적화

```bash
# PM2 설정에서 메모리 제한 설정
# ecosystem.config.js에서:
max_memory_restart: '512M'
node_args: '--max-old-space-size=512'
```

#### 2. Nginx 캐싱 설정

```bash
# nginx.conf에서 정적 파일 캐싱 확인
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|mp3|wav)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 3. MongoDB 인덱스 최적화

```bash
mongosh
use wongram-shop-db
db.reviews.createIndex({ "slug": 1 })
db.reviews.createIndex({ "category": 1, "status": 1 })
db.reviews.createIndex({ "publishedAt": -1 })
```

## 📊 모니터링 및 백업

### 시스템 모니터링

```bash
# 시스템 리소스 확인
htop
df -h
free -h

# PM2 모니터링
pm2 monit

# 로그 실시간 확인
tail -f logs/combined.log
```

### 자동 백업 설정

```bash
# MongoDB 백업 스크립트 (배포 시 자동 설정됨)
/home/ubuntu/backup-mongodb.sh

# 수동 백업
mongodump --out /home/ubuntu/backups/manual_$(date +%Y%m%d_%H%M%S)
```

## 🎯 추가 기능 설정

### Google AdSense 연동

1. Google AdSense 계정 생성
2. 사이트 추가 및 승인 대기
3. .env 파일에 클라이언트 ID 추가
4. 광고 단위 생성 및 코드 삽입

### 쿠팡 파트너스 연동

1. 쿠팡 파트너스 가입
2. 제품 링크 생성 시 파트너스 링크 사용
3. 수수료 안내 문구 확인

### 푸시 알림 설정

```bash
# VAPID 키 생성
npx web-push generate-vapid-keys

# .env에 키 추가
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
```

## 🆘 지원 및 문의

- **이슈 제보**: GitHub Issues
- **문의 이메일**: admin@wongram.shop
- **문서 업데이트**: 이 README.md 파일 참조

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 LICENSE 파일을 참조하세요.

---

**🎉 축하합니다! WonGram Shop이 성공적으로 설치되었습니다.**

브라우저에서 https://wongram.shop 을 방문하여 PWA와 AI 기능을 체험해보세요!
