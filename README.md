# 🚀 WonGram Shop - AI 기반 PWA 테트리스 & 쿠팡 리뷰 플랫폼

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple.svg)](https://wongram.shop)
[![AI Powered](https://img.shields.io/badge/AI-Powered-blue.svg)](https://openai.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green.svg)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **혁신적인 Progressive Web App으로 구현된 테트리스 게임과 OpenAI 기반 쿠팡 제품 리뷰 플랫폼**

🌐 **라이브 사이트**: [wongram.shop](https://wongram.shop)  
🎮 **테트리스 게임**: [wongram.shop/game/tetris](https://wongram.shop/game/tetris)  
⚙️ **관리자 페이지**: [wongram.shop/admin](https://wongram.shop/admin)

---

## 📋 목차

- [✨ 주요 기능](#-주요-기능)
- [🛠️ 기술 스택](#️-기술-스택)
- [🚀 빠른 시작](#-빠른-시작)
- [⚙️ 환경 변수 설정](#️-환경-변수-설정)
- [📱 PWA 기능 가이드](#-pwa-기능-가이드)
- [🤖 AI 어시스턴트 사용법](#-ai-어시스턴트-사용법)
- [☁️ 서버 배포 가이드](#️-서버-배포-가이드)
- [🔧 운영 및 관리](#-운영-및-관리)
- [🔧 문제 해결](#-문제-해결)
- [📊 성능 최적화](#-성능-최적화)
- [🆘 지원 및 문의](#-지원-및-문의)

---

## ✨ 주요 기능

### 📱 PWA (Progressive Web App) 기능
- **🔧 앱 설치**: 브라우저에서 네이티브 앱처럼 설치 가능
- **📶 오프라인 지원**: 인터넷 연결 없이도 컨텐츠 이용 가능
- **🔔 푸시 알림**: 새로운 리뷰와 업데이트 알림 (VAPID 키 설정 시)
- **⚡ 빠른 로딩**: Service Worker를 통한 캐싱으로 초고속 성능
- **📐 반응형 디자인**: 모바일, 태블릿, 데스크톱 완벽 지원

### 🤖 AI 리뷰 어시스턴트 (Google Gemini 기반)
- **📝 리뷰 개요 자동 생성**: 제품 정보만으로 전문적인 리뷰 개요 작성
- **⚖️ 제품 비교 분석**: 여러 제품을 객관적으로 비교 분석
- **🔍 SEO 최적화 제안**: 검색엔진 상위 노출을 위한 AI 추천
- **🏷️ 스마트 태그 제안**: 컨텐츠에 맞는 태그와 카테고리 자동 생성
- **✨ 리뷰 내용 개선**: 기존 리뷰의 품질과 가독성 향상 제안

### 🎁 쿠팡 제품 리뷰 시스템
- **🔍 지능형 비교 리뷰**: AI가 도움을 주는 상세한 제품 비교
- **💰 실시간 가격 연동**: 쿠팡 파트너스 API 연동 지원
- **⭐ 사용자 평점 시스템**: 별점과 댓글 기능
- **📂 카테고리별 정리**: 전자제품, 생활용품, 패션, 식품 등 체계적 분류

### 🎮 고도화된 테트리스 게임
- **📱 완벽한 모바일 지원**: 터치 컨트롤과 제스처 인식
- **🏆 리얼타임 랭킹**: 전세계 사용자와 경쟁
- **🎵 사운드 이팩트**: 고품질 배경음악과 효과음
- **🏅 성취 시스템**: 점수별 배지와 레벨 시스템
- **📤 소셜 공유**: 최고 기록 소셜 미디어 공유

### ⚙️ 고급 관리자 시스템
- **🤖 AI 어시스턴트 통합**: 리뷰 작성 자동화
- **📊 실시간 대시보드**: 방문자, 수익, 인기 컨텐츠 통계
- **🎯 컨텐츠 최적화**: SEO 점수와 개선 제안
- **👥 사용자 관리**: 권한 관리와 활동 로그
- **💾 자동 백업**: 데이터베이스 자동 백업 및 복구

---

## 🛠️ 기술 스택

### 💻 백엔드
- **Node.js** v18+ (LTS) - 서버 런타임
- **Express.js** - 웹 프레임워크
- **MongoDB** v7.0+ - NoSQL 데이터베이스
- **Mongoose** - ODM (Object Document Mapping)
- **JWT** - 사용자 인증 시스템
- **Google Gemini API** - AI 어시스턴트 기능

### 🎨 프론트엔드
- **EJS** - 서버사이드 템플릿 엔진
- **Vanilla JavaScript** - 클라이언트 사이드 로직
- **CSS3** - 반응형 디자인
- **Service Worker** - PWA 오프라인 기능
- **Web App Manifest** - 앱 설치 지원

### 🔒 보안 & 성능
- **Helmet** - HTTP 보안 헤더
- **Rate Limiting** - API 요청 제한
- **Compression** - Gzip 압축
- **CORS** - 크로스 오리진 정책
- **bcryptjs** - 비밀번호 암호화

### ☁️ 배포 & 인프라
- **Oracle Cloud** - Ubuntu 22.04 LTS
- **PM2** - Node.js 프로세스 관리
- **Nginx** - 웹 서버 및 리버스 프록시
- **Let's Encrypt** - 무료 SSL 인증서
- **MongoDB Atlas/Self-hosted** - 데이터베이스 호스팅

---

## 🚀 빠른 시작

### 📋 사전 요구사항

- **Node.js**: v18.0.0 이상 (LTS 권장)
- **MongoDB**: v7.0.0 이상
- **Git**: 최신 버전
- **Google Gemini API Key**: AI 어시스턴트 기능용 ([발급 방법](#gemini-api-키-발급))

### 🏠 로컬 개발 환경 설정

```bash
# 1. 프로젝트 클론
git clone <repository-url> wongram-shop
cd wongram-shop

# 2. 환경 변수 설정
cp .env.example .env
nano .env  # 필수 환경 변수 입력

# 3. 의존성 설치
npm install

# 4. MongoDB 시작
# Ubuntu/Debian:
sudo systemctl start mongod
# macOS (Homebrew):
brew services start mongodb/brew/mongodb-community

# 5. 개발 서버 시작
chmod +x start-server.sh
./start-server.sh
# 또는
npm run dev
```

### 🌐 브라우저에서 확인

- **메인 사이트**: http://localhost:3000
- **테트리스 게임**: http://localhost:3000/game/tetris
- **관리자 페이지**: http://localhost:3000/admin

---

## ⚙️ 환경 변수 설정

### 📄 .env 파일 생성

```bash
# .env.example을 복사하여 .env 파일 생성
cp .env.example .env
```

### 🔧 필수 환경 변수

```env
# 서버 기본 설정
PORT=3000
NODE_ENV=production
SITE_URL=https://wongram.shop
SITE_NAME=WonGram Shop - AI 테트리스 & 쿠팡 리뷰
SITE_DESCRIPTION=AI 기반 테트리스 게임과 쿠팡 물품 비교 리뷰를 제공하는 PWA

# 데이터베이스
MONGODB_URI=mongodb://localhost:27017/wongram-shop-db

# 보안 키 (강력한 랜덤 값 사용)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters

# 관리자 계정
ADMIN_EMAIL=admin@wongram.shop
ADMIN_PASSWORD=your-strong-admin-password-here
```

### 🤖 AI 어시스턴트 설정

```env
# Google Gemini API (필수)
GEMINI_API_KEY=your-gemini-api-key-here
```

#### Gemini API 키 발급

1. [Google AI Studio](https://aistudio.google.com/) 방문
2. Google 계정으로 로그인
3. **API 키 만들기** 또는 **Get API Key** 클릭
4. 새 프로젝트 생성 또는 기존 프로젝트 선택
5. 생성된 키를 복사하여 `.env` 파일에 입력

### 💰 수익화 설정 (선택사항)

```env
# Google AdSense
GOOGLE_ADSENSE_CLIENT=ca-pub-your-adsense-client-id

# Google Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# 쿠팡 파트너스
COUPANG_ACCESS_KEY=your-coupang-access-key
COUPANG_SECRET_KEY=your-coupang-secret-key
```

### 🔔 PWA 푸시 알림 설정 (선택사항)

```env
# VAPID 키 (자동 생성 가능)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@wongram.shop
```

**VAPID 키 생성 방법:**
```bash
npx web-push generate-vapid-keys
```

---

## 📱 PWA 기능 가이드

### 📱 모바일에서 앱 설치

1. **Android (Chrome/Samsung Internet)**:
   - 모바일 브라우저에서 `wongram.shop` 접속
   - 화면 하단의 "앱 설치" 배너 클릭
   - 또는 브라우저 메뉴 > "홈 화면에 추가"

2. **iOS (Safari)**:
   - Safari에서 `wongram.shop` 접속
   - 공유 버튼 터치 > "홈 화면에 추가"

### 💻 데스크톱에서 앱 설치

1. **Chrome/Edge**:
   - 주소창 오른쪽의 설치 아이콘 클릭
   - 또는 메뉴 > "앱 설치"

### 📶 오프라인 사용

- 인터넷 연결이 끊어져도 이전에 방문한 페이지 열람 가능
- 테트리스 게임을 완전히 오프라인에서 플레이 가능
- 온라인 연결이 복구되면 자동으로 동기화

### 🔔 푸시 알림 설정

관리자가 새로운 리뷰를 게시하거나 시스템 업데이트가 있을 때 자동으로 알림을 받을 수 있습니다.

---

## 🤖 AI 어시스턴트 사용법

### 🔐 관리자 로그인

1. **초기 Admin 계정 생성**:
   ```bash
   # 서버에서 한 번만 실행
   curl http://localhost:3000/auth/init-admin
   ```

2. **로그인**:
   - URL: `http://localhost:3000/admin` (로컬) 또는 `https://wongram.shop/admin`
   - 이메일: `.env`에 설정한 `ADMIN_EMAIL`
   - 비밀번호: `.env`에 설정한 `ADMIN_PASSWORD`

### 📝 AI 기능 사용하기

관리자로 로그인하면 화면 오른쪽에 AI 어시스턴트 패널이 나타납니다.

#### 1️⃣ 리뷰 개요 자동 생성

```
[개요 생성] 탭 > 제품 정보 입력 > [개요 생성] 클릭
```

**예시 입력**:
- 제품명: "삼성 갤럭시 버즈2 프로"
- 카테고리: "이어폰"
- 가격: "179,000원"

**AI 생성 결과**: 전문적인 리뷰 개요와 주요 특징 분석

#### 2️⃣ 제품 비교 분석

```
[제품 비교] 탭 > 비교 제품들 입력 > [비교 분석] 클릭
```

**예시**: 에어팟 프로 vs 갤럭시 버즈 프로 상세 비교표 자동 생성

#### 3️⃣ SEO 최적화

```
[SEO 최적화] 탭 > 리뷰 내용 입력 > [SEO 제안] 클릭
```

**AI 제공 사항**:
- 검색 최적화된 메타 제목
- 메타 설명 (155자 이내)
- 관련 키워드 제안

#### 4️⃣ 스마트 태그 제안

```
[태그 제안] 탭 > 제품 정보 입력 > [태그 제안] 클릭
```

**자동 생성**: 적합한 태그와 카테고리 자동 추천

---

## ☁️ 서버 배포 가이드

### 🚀 Oracle Cloud Ubuntu 자동 배포

#### 1. 서버 파일 업로드

```bash
# 방법 1: SCP 사용
scp -r ./* ubuntu@<서버-IP>:/home/ubuntu/coupangblog/

# 방법 2: Git 사용
ssh ubuntu@<서버-IP>
git clone <repository-url> coupangblog
cd coupangblog
```

#### 2. 자동 배포 스크립트 실행

```bash
# 실행 권한 부여
chmod +x deploy.sh

# 배포 시작 (모든 설정 자동화)
./deploy.sh
```

**deploy.sh 스크립트가 자동으로 수행하는 작업**:
- ✅ Node.js v18 LTS 설치
- ✅ MongoDB 7.0 설치 및 설정
- ✅ PM2 프로세스 관리자 설치
- ✅ Nginx 웹 서버 설정
- ✅ Let's Encrypt SSL 인증서 설정
- ✅ 방화벽 설정 (UFW)
- ✅ 자동 백업 시스템 구성
- ✅ PWA 최적화 설정

#### 3. 환경 변수 설정

```bash
nano .env

# 필수 값들 입력 후 저장
```

#### 4. 서비스 확인

```bash
# 애플리케이션 상태 확인
pm2 list
pm2 logs wongram-shop

# 웹사이트 접속 테스트
curl -I https://wongram.shop
```

### 🌐 도메인 및 DNS 설정

#### DNS 레코드 설정

```
타입: A
이름: @
값: <Oracle-Cloud-서버-IP>

타입: CNAME  
이름: www
값: wongram.shop
```

#### SSL 인증서 설정

```bash
# 자동 설정 (deploy.sh에 포함)
sudo certbot --nginx -d wongram.shop -d www.wongram.shop

# 수동 갱신
sudo certbot renew
```

---

## 🔧 운영 및 관리

### 📊 PM2 프로세스 관리

```bash
# 상태 확인
pm2 status
pm2 list

# 실시간 로그 확인
pm2 logs wongram-shop
pm2 logs --lines 100

# 애플리케이션 재시작
pm2 restart wongram-shop
pm2 restart all

# 실시간 모니터링
pm2 monit

# 메모리 사용량 확인
pm2 show wongram-shop

# 프로세스 중지
pm2 stop wongram-shop

# 설정 저장 (재부팅 시 자동 시작)
pm2 save
pm2 startup
```

### 🔧 시스템 서비스 관리

```bash
# MongoDB 관리
sudo systemctl status mongod
sudo systemctl start mongod
sudo systemctl restart mongod
sudo systemctl stop mongod

# Nginx 관리
sudo systemctl status nginx
sudo nginx -t  # 설정 파일 테스트
sudo systemctl reload nginx
sudo systemctl restart nginx

# 시스템 리소스 확인
htop
df -h  # 디스크 사용량
free -h  # 메모리 사용량
```

### 💾 백업 관리

```bash
# 수동 백업
/home/ubuntu/backup-mongodb.sh

# 백업 파일 확인
ls -la /home/ubuntu/backups/

# 백업 복원
mongorestore /home/ubuntu/backups/mongodb_20241113_020000

# 자동 백업 스케줄 확인
crontab -l
```

---

## 🔧 문제 해결

### ❌ 일반적인 문제들

#### 1. 포트 충돌 문제

```bash
# 포트 3000이 이미 사용 중인 경우
sudo lsof -i :3000
sudo kill -9 <PID>

# 또는 PM2로 모든 프로세스 정리
pm2 delete all
pm2 start ecosystem.config.js
```

#### 2. MongoDB 연결 실패

```bash
# MongoDB 상태 확인
sudo systemctl status mongod

# MongoDB 재시작
sudo systemctl restart mongod

# 연결 테스트
mongosh --eval "db.adminCommand('ping')"

# MongoDB 로그 확인
sudo tail -f /var/log/mongodb/mongod.log
```

#### 3. SSL 인증서 문제

```bash
# 인증서 상태 확인
sudo certbot certificates

# 인증서 수동 재발급
sudo certbot --nginx -d wongram.shop -d www.wongram.shop

# 인증서 테스트
sudo certbot renew --dry-run

# Nginx 설정 테스트
sudo nginx -t
```

#### 4. PWA 기능 문제

**문제**: 앱 설치 버튼이 나타나지 않음

**해결**:
1. 브라우저 개발자 도구 > **Application** 탭
2. **Service Workers** 섹션에서 sw.js 등록 확인
3. **Manifest** 섹션에서 manifest.json 파일 확인
4. **Security** 탭에서 HTTPS 연결 확인

#### 5. AI 어시스턴트 오류

```bash
# OpenAI API 키 확인
grep OPENAI_API_KEY .env

# API 키 유효성 테스트
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models

# AI 관련 로그 확인
pm2 logs wongram-shop | grep -i openai
pm2 logs wongram-shop | grep -i error
```

### 🚨 긴급 복구 절차

#### 서비스 완전 중단 시

```bash
# 1. 시스템 상태 확인
sudo systemctl status nginx mongod
pm2 list

# 2. 모든 서비스 재시작
sudo systemctl restart nginx mongod
pm2 restart all

# 3. 로그 확인
pm2 logs --lines 50
sudo tail -f /var/log/nginx/error.log

# 4. 최후의 수단: 서버 재부팅
sudo reboot
```

#### 데이터베이스 복구

```bash
# 최신 백업 파일 확인
ls -la /home/ubuntu/backups/

# 백업 복원
mongorestore --drop /home/ubuntu/backups/mongodb_최신날짜

# 데이터베이스 무결성 검사
mongosh --eval "db.runCommand({dbStats: 1})"
```

---

## 📊 성능 최적화

### ⚡ 서버 성능 모니터링

```bash
# PM2 실시간 모니터링
pm2 monit

# 시스템 리소스 확인
htop
iostat 1
vmstat 1

# Nginx 액세스 로그 분석
sudo tail -f /var/log/nginx/access.log | grep -v bot

# 메모리 사용량 상세 분석
sudo ps aux --sort=-%mem | head -10
```

### 🎯 최적화 권장사항

#### 1. 이미지 최적화

```bash
# WebP 변환 (sharp 패키지 이용)
# 이미 package.json에 sharp 포함됨
npm ls sharp
```

#### 2. 데이터베이스 인덱스 설정

```javascript
// MongoDB 인덱스 생성
mongosh
use wongram-shop-db

// 필수 인덱스들
db.reviews.createIndex({ "slug": 1 })
db.reviews.createIndex({ "category": 1, "status": 1 })
db.reviews.createIndex({ "publishedAt": -1 })
db.users.createIndex({ "email": 1 })
```

#### 3. Nginx 캐싱 최적화

```nginx
# /etc/nginx/sites-available/wongram-shop 파일에서
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|mp3|wav|woff2?)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}
```

#### 4. Node.js 메모리 최적화

```javascript
// ecosystem.config.js에서 설정됨
node_args: '--max-old-space-size=512'
max_memory_restart: '512M'
```

### 📈 성능 지표 목표

- **초기 로딩 시간**: < 3초
- **PWA 설치 가능**: ✅
- **오프라인 동작**: ✅
- **모바일 점수**: > 90점
- **SEO 점수**: > 95점

---

## 📈 수익화 및 분석

### 💰 Google AdSense 설정

1. **AdSense 계정 생성**
   - [Google AdSense](https://www.google.com/adsense/) 방문
   - 사이트 추가 및 승인 신청

2. **광고 코드 설정**
   ```env
   GOOGLE_ADSENSE_CLIENT=ca-pub-your-adsense-id
   ```

3. **광고 배치 최적화**
   - 헤더, 사이드바, 본문 내 자연스러운 배치
   - 모바일 반응형 광고 단위 사용

### 📊 Google Analytics 설정

```env
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

**추적 이벤트**:
- 페이지 뷰
- 테트리스 게임 플레이
- PWA 설치
- AI 어시스턴트 사용

### 🛒 쿠팡 파트너스 연동

1. **파트너스 가입**
   - [쿠팡 파트너스](https://partners.coupang.com/) 가입
   - 사이트 등록 및 승인

2. **제품 링크 생성**
   - 리뷰 작성 시 쿠팡 파트너스 링크 사용
   - 적절한 수수료 안내 문구 포함

---

## 🆘 지원 및 문의

### 📞 연락처

- **📧 이메일**: admin@wongram.shop
- **🐛 버그 리포트**: GitHub Issues
- **📖 문서**: 이 README.md 파일
- **🔄 업데이트**: 정기적인 보안 및 기능 업데이트

### 📚 추가 문서

- **[QUICK_START.md](QUICK_START.md)**: 빠른 시작 가이드
- **[SETUP.md](SETUP.md)**: 상세 설치 가이드  
- **[SERVER_SETUP.md](SERVER_SETUP.md)**: 서버 설정 가이드
- **[GITHUB_ORACLE_SETUP.md](GITHUB_ORACLE_SETUP.md)**: GitHub Actions 배포
- **[GEMINI_CLI_README.md](GEMINI_CLI_README.md)**: Gemini AI CLI 사용법

### 🆘 커뮤니티 지원

- GitHub Discussions에서 질문하기
- 이슈 제보 시 다음 정보 포함:
  - 운영체제 및 버전
  - Node.js 버전
  - 브라우저 정보
  - 에러 메시지 전문

---

## 📄 라이선스

이 프로젝트는 **MIT 라이선스**를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

### 🔄 기여하기

1. 프로젝트 포크
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

---

## 📋 체크리스트

### ✅ 배포 전 확인사항

- [ ] `.env` 파일 필수 변수 설정 완료
- [ ] OpenAI API 키 발급 및 설정
- [ ] MongoDB 연결 테스트 통과
- [ ] PWA 아이콘 파일들 업로드
- [ ] SSL 인증서 설정 완료
- [ ] 방화벽 포트 개방 (80, 443)
- [ ] 도메인 DNS 설정 완료

### ✅ 운영 중 점검사항

- [ ] PM2 프로세스 상태 정상
- [ ] MongoDB 백업 정상 동작
- [ ] SSL 인증서 자동 갱신 설정
- [ ] 로그 파일 정기 정리
- [ ] 시스템 보안 업데이트
- [ ] 성능 모니터링 지표 확인

---

**🎉 축하합니다! WonGram Shop이 성공적으로 설정되었습니다.**

🌟 **최신 기능**:
- ✨ OpenAI GPT-4 기반 AI 어시스턴트
- 📱 완전한 PWA 지원
- 🎮 모바일 최적화 테트리스 게임
- 🔍 SEO 최적화 쿠팡 리뷰 시스템

🚀 **지금 시작하세요**: [wongram.shop](https://wongram.shop)에서 PWA 앱을 설치하고 AI 기능을 체험해보세요!

---

<div align="center">

**⭐ 이 프로젝트가 도움이 되었다면 GitHub에서 스타를 눌러주세요! ⭐**

Made with ❤️ by WonGram Shop Team

</div>
