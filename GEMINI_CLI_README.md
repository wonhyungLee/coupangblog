# Tetris Game & Coupang Review Site - Gemini CLI 자동 설치 가이드

이 문서는 Gemini CLI가 Oracle Cloud Ubuntu 서버에 프로젝트를 자동으로 설치할 수 있도록 작성되었습니다.

## 프로젝트 개요

- **프로젝트명**: Tetris Game & Coupang Review Site
- **기술 스택**: Node.js, Express, MongoDB, EJS, PM2, Nginx
- **주요 기능**: 테트리스 게임, 쿠팡 제품 리뷰 시스템, SEO 최적화

## 자동 설치 스크립트

### 1단계: 서버 초기 설정

```bash
#!/bin/bash
# Ubuntu 22.04 LTS 기준

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필요한 도구 설치
sudo apt install -y git curl wget build-essential
```

### 2단계: GitHub에서 프로젝트 클론

```bash
# 프로젝트 디렉토리 생성
mkdir -p /home/ubuntu/apps
cd /home/ubuntu/apps

# GitHub에서 프로젝트 클론
git clone https://github.com/wonhyungLee/coupangblog.git
cd coupangblog
```

### 3단계: Node.js 설치

```bash
# Node.js 18.x 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 버전 확인
node --version  # v18.x.x
npm --version   # 9.x.x
```

### 4단계: MongoDB 설치 및 설정

```bash
# MongoDB 6.0 설치
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# MongoDB 시작 및 자동 시작 설정
sudo systemctl start mongod
sudo systemctl enable mongod

# MongoDB 상태 확인
sudo systemctl status mongod
```

### 5단계: PM2 설치 (프로세스 관리자)

```bash
# PM2 전역 설치
sudo npm install -g pm2

# PM2 로그 회전 설정
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 6단계: Nginx 설치

```bash
# Nginx 설치
sudo apt install -y nginx

# Nginx 시작 및 자동 시작 설정
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 7단계: 프로젝트 의존성 설치

```bash
cd /home/ubuntu/apps/coupangblog

# NPM 패키지 설치
npm install --production

# 로그 디렉토리 생성
mkdir -p logs
```

### 8단계: 환경 변수 설정

```bash
# .env 파일 생성 및 편집
cat > .env << 'EOF'
# 서버 설정
PORT=3000
NODE_ENV=production

# MongoDB 설정
MONGODB_URI=mongodb://localhost:27017/tetris-coupang-db

# JWT 설정 (보안을 위해 강력한 랜덤 문자열로 변경)
JWT_SECRET=$(openssl rand -base64 32)

# 세션 설정 (보안을 위해 강력한 랜덤 문자열로 변경)
SESSION_SECRET=$(openssl rand -base64 32)

# Admin 계정 설정
# 경고: 실제 운영환경에서는 더 안전한 비밀번호를 사용하세요!
ADMIN_EMAIL=root@localhost
ADMIN_PASSWORD=dldnjsgud

# Google AdSense 설정
GOOGLE_ADSENSE_CLIENT=ca-pub-9238912314245514

# SEO 설정
SITE_URL=https://wongram.shop
SITE_NAME=테트리스 & 쿠팡 리뷰
SITE_DESCRIPTION=테트리스 게임과 쿠팡 물품 비교 리뷰 사이트
EOF

# 파일 권한 설정 (보안)
chmod 600 .env
```

### 9단계: Nginx 설정

```bash
# Nginx 설정 파일 생성
sudo tee /etc/nginx/sites-available/coupangblog << 'EOF'
server {
    listen 80;
    server_name wongram.shop www.wongram.shop;

    # 루트 디렉토리
    root /home/ubuntu/apps/coupangblog/public;
    
    # 프록시 설정
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 정적 파일 처리
    location /css/ {
        alias /home/ubuntu/apps/coupangblog/public/css/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /js/ {
        alias /home/ubuntu/apps/coupangblog/public/js/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /images/ {
        alias /home/ubuntu/apps/coupangblog/public/images/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# 사이트 활성화
sudo ln -sf /etc/nginx/sites-available/coupangblog /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

### 10단계: 방화벽 설정

```bash
# UFW 방화벽 설정
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

# Oracle Cloud 보안 목록에서도 포트 개방 필요:
# - 22 (SSH)
# - 80 (HTTP)
# - 443 (HTTPS)
```

### 11단계: PM2로 애플리케이션 시작

```bash
cd /home/ubuntu/apps/coupangblog

# PM2로 애플리케이션 시작
pm2 start ecosystem.config.js

# PM2 프로세스 저장
pm2 save

# 시스템 재부팅 시 자동 시작 설정
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### 12단계: Admin 계정 초기화

```bash
# Admin 계정 생성 (최초 1회만)
curl -X GET http://localhost:3000/auth/init-admin

# 응답 확인 (성공 시 메시지 출력)
```

### 13단계: 서비스 상태 확인

```bash
# 모든 서비스 상태 확인
echo "=== 서비스 상태 확인 ==="

# MongoDB
sudo systemctl status mongod --no-pager | grep "Active:"

# Nginx
sudo systemctl status nginx --no-pager | grep "Active:"

# PM2 프로세스
pm2 status

# 애플리케이션 로그 확인
pm2 logs --lines 10
```

## 설치 후 확인 사항

### 1. 웹 브라우저에서 접속 테스트

```
http://서버IP주소/           # 메인 페이지
http://서버IP주소/game/tetris # 테트리스 게임
http://서버IP주소/admin       # 관리자 페이지
```

### 2. 관리자 로그인

- URL: `http://서버IP주소/admin`
- 이메일: `root@localhost`
- 비밀번호: `dldnjsgud`

**⚠️ 보안 경고**: 제공된 관리자 계정 정보는 개발/테스트용입니다. 운영 환경에서는 반드시 더 안전한 비밀번호로 변경하세요!

### 3. 첫 리뷰 작성

1. 관리자 대시보드 접속
2. "새 리뷰 작성" 클릭
3. 제목, 내용, 카테고리 입력
4. 쿠팡 제품 정보 추가 (최소 2개)
5. SEO 설정
6. 저장 및 게시

## 문제 해결

### MongoDB 연결 오류

```bash
# MongoDB 재시작
sudo systemctl restart mongod

# 로그 확인
sudo journalctl -u mongod -n 50
```

### PM2 프로세스 문제

```bash
# 프로세스 재시작
pm2 restart all

# 로그 확인
pm2 logs

# 프로세스 정보 확인
pm2 describe 0
```

### Nginx 502 Bad Gateway

```bash
# 애플리케이션이 실행 중인지 확인
pm2 status

# Nginx 에러 로그 확인
sudo tail -f /var/log/nginx/error.log
```

## 추가 설정 (선택사항)

### SSL 인증서 설정 (도메인이 있는 경우)

```bash
# Certbot 설치
sudo apt install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d wongram.shop -d www.wongram.shop
```

### 백업 스크립트 설정

```bash
# 백업 스크립트 생성
cat > /home/ubuntu/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 백업 디렉토리 생성
mkdir -p $BACKUP_DIR

# MongoDB 백업
mongodump --out $BACKUP_DIR/mongodb_$DATE

# 파일 백업
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /home/ubuntu/apps/coupangblog

# 7일 이상 된 백업 삭제
find $BACKUP_DIR -type f -mtime +7 -delete

echo "백업 완료: $DATE"
EOF

chmod +x /home/ubuntu/backup.sh

# Cron 작업 추가 (매일 새벽 3시 백업)
(crontab -l 2>/dev/null; echo "0 3 * * * /home/ubuntu/backup.sh") | crontab -
```

## 모니터링 명령어

```bash
# 실시간 로그 모니터링
pm2 logs --lines 50

# 시스템 리소스 모니터링
pm2 monit

# 프로세스 상세 정보
pm2 info tetris-coupang-review

# 시스템 전체 상태
htop
```

## 업데이트 방법

```bash
cd /home/ubuntu/apps/coupangblog

# 코드 업데이트
git pull origin main

# 의존성 업데이트
npm install --production

# 애플리케이션 재시작
pm2 restart all

# Nginx 재시작 (설정 변경 시)
sudo systemctl restart nginx
```

## 지원 및 문의

- 이슈 발생 시 로그 확인: `pm2 logs`
- MongoDB 상태: `sudo systemctl status mongod`
- Nginx 상태: `sudo systemctl status nginx`

---

**주의**: 이 설치 가이드는 Gemini CLI가 자동으로 실행할 수 있도록 구조화되어 있습니다. 각 단계는 독립적으로 실행 가능하며, 오류 발생 시 해당 단계만 재실행할 수 있습니다.