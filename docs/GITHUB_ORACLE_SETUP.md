# GitHub 업로드 및 Oracle Cloud 서버 설정 가이드

## 1. GitHub에 프로젝트 업로드하기

### 1.1 GitHub 리포지토리 생성

1. GitHub.com에 로그인
2. 우측 상단 '+' 버튼 클릭 → 'New repository'
3. Repository 설정:
   - Repository name: `coupangblog`
   - Description: `Tetris Game & Coupang Review Site`
   - Public/Private 선택
   - **중요**: "Initialize this repository with:" 옵션들은 모두 체크 해제
4. 'Create repository' 클릭

### 1.2 로컬에서 GitHub에 푸시

```bash
# C:\Temp\tetris-game 디렉토리로 이동
cd C:\Temp\tetris-game

# Git 초기화 (이미 되어 있다면 생략)
git init

# 민감한 정보가 포함되지 않도록 .gitignore 확인
# .env 파일이 .gitignore에 포함되어 있는지 확인
type .gitignore

# .env 파일이 없다면 생성
echo .env >> .gitignore
echo node_modules/ >> .gitignore
echo logs/ >> .gitignore
echo *.log >> .gitignore
echo .DS_Store >> .gitignore

# 모든 파일을 Git에 추가
git add .

# 커밋
git commit -m "Initial commit: Tetris game and Coupang review site"

# GitHub 리모트 추가
git remote add origin https://github.com/wonhyungLee/coupangblog.git

# main 브랜치로 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

### 1.3 보안을 위한 .env.example 파일 생성

```bash
# .env.example 파일 생성 (실제 값 없이 템플릿만)
cat > .env.example << 'EOF'
# 서버 설정
PORT=3000
NODE_ENV=production

# MongoDB 설정
MONGODB_URI=mongodb://localhost:27017/tetris-coupang-db

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key-change-this

# 세션 설정
SESSION_SECRET=your-super-secret-session-key-change-this

# Admin 계정 설정
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changethispassword123!

# Google AdSense 설정
GOOGLE_ADSENSE_CLIENT=ca-pub-9238912314245514

# SEO 설정
SITE_URL=https://wongram.shop
SITE_NAME=테트리스 & 쿠팡 리뷰
SITE_DESCRIPTION=테트리스 게임과 쿠팡 물품 비교 리뷰 사이트
EOF

# Git에 추가하고 푸시
git add .env.example
git commit -m "Add .env.example for configuration template"
git push
```

## 2. Oracle Cloud 서버 준비

### 2.1 Oracle Cloud 인스턴스 생성

1. Oracle Cloud 콘솔 로그인
2. Compute → Instances → Create Instance
3. 설정:
   - Name: `coupangblog-server`
   - Image: Ubuntu 22.04 LTS
   - Shape: VM.Standard.E2.1.Micro (무료 티어)
   - SSH keys: 새 키 생성 또는 기존 키 사용
4. Create 클릭

### 2.2 보안 목록(Security List) 설정

1. Networking → Virtual Cloud Networks
2. 해당 VCN 클릭 → Security Lists
3. Default Security List 클릭
4. Ingress Rules 추가:
   ```
   - Source: 0.0.0.0/0
   - Protocol: TCP
   - Destination Port: 80 (HTTP)
   
   - Source: 0.0.0.0/0
   - Protocol: TCP
   - Destination Port: 443 (HTTPS)
   
   - Source: 0.0.0.0/0
   - Protocol: TCP
   - Destination Port: 3000 (Node.js - 옵션)
   ```

### 2.3 서버 접속

```bash
# Windows PowerShell 또는 Git Bash에서
ssh -i path/to/private-key ubuntu@서버IP주소

# 또는 PuTTY 사용 (Windows)
# 1. PuTTYgen으로 .ppk 파일 생성
# 2. PuTTY에서 접속
```

## 3. Gemini CLI를 사용한 자동 설치

### 3.1 서버에서 Gemini CLI 설치

```bash
# Gemini CLI 설치 (예시)
# 실제 Gemini CLI 설치 방법은 공식 문서 참조
npm install -g @google/gemini-cli
```

### 3.2 자동 설치 스크립트 실행

```bash
# GitHub에서 프로젝트 클론
cd /home/ubuntu
git clone https://github.com/wonhyungLee/coupangblog.git
cd coupangblog

# Gemini CLI로 README.md 읽고 자동 설치
gemini run README.md --auto-install
```

### 3.3 수동으로 .env 파일 생성

```bash
# .env 파일을 .env.example에서 복사
cp .env.example .env

# 편집기로 .env 파일 수정
nano .env

# 다음 내용으로 수정:
# ADMIN_EMAIL=root@localhost
# ADMIN_PASSWORD=dldnjsgud
# 기타 필요한 설정 수정
```

## 4. 설치 확인 및 테스트

### 4.1 서비스 상태 확인

```bash
# 모든 서비스 상태 확인
sudo systemctl status mongod
sudo systemctl status nginx
pm2 status
```

### 4.2 브라우저에서 접속

1. 메인 페이지: `http://서버IP/`
2. 테트리스 게임: `http://서버IP/game/tetris`
3. 관리자 페이지: `http://서버IP/admin`
   - 이메일: `root@localhost`
   - 비밀번호: `dldnjsgud`

## 5. 도메인 연결 (선택사항)

### 5.1 도메인 구매 및 DNS 설정

1. 도메인 등록업체에서 도메인 구매
2. DNS 설정에서 A 레코드 추가:
   ```
   Type: A
   Name: @ (또는 공백)
   Value: Oracle Cloud 서버 IP
   TTL: 3600
   
   Type: A
   Name: www
   Value: Oracle Cloud 서버 IP
   TTL: 3600
   ```

### 5.2 Nginx 설정 수정

```bash
# Nginx 설정 파일 편집
sudo nano /etc/nginx/sites-available/coupangblog

# server_name을 실제 도메인으로 변경
server_name wongram.shop www.wongram.shop;

# 저장 후 Nginx 재시작
sudo nginx -t
sudo systemctl restart nginx
```

### 5.3 SSL 인증서 설치

```bash
# Let's Encrypt 인증서 설치
sudo certbot --nginx -d wongram.shop -d www.wongram.shop

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

## 6. 유지보수 및 모니터링

### 6.1 로그 확인

```bash
# PM2 로그
pm2 logs

# Nginx 액세스 로그
sudo tail -f /var/log/nginx/access.log

# Nginx 에러 로그
sudo tail -f /var/log/nginx/error.log

# MongoDB 로그
sudo journalctl -u mongod -f
```

### 6.2 백업 설정

```bash
# 자동 백업 스크립트 설정 (crontab)
crontab -e

# 매일 새벽 3시 백업 추가
0 3 * * * /home/ubuntu/backup.sh
```

### 6.3 업데이트

```bash
# 코드 업데이트
cd /home/ubuntu/coupangblog
git pull origin main
npm install --production
pm2 restart all
```

## 7. 성능 최적화

### 7.1 PM2 클러스터 모드

```bash
# ecosystem.config.js 수정
module.exports = {
  apps: [{
    name: 'tetris-coupang-review',
    script: './server/app.js',
    instances: 'max',  // CPU 코어 수만큼 인스턴스 생성
    exec_mode: 'cluster',
    // ... 기타 설정
  }]
};

# PM2 재시작
pm2 delete all
pm2 start ecosystem.config.js
```

### 7.2 Nginx 캐싱 설정

```nginx
# /etc/nginx/sites-available/coupangblog에 추가
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 보안 권장사항

1. **관리자 비밀번호 변경**: 제공된 비밀번호는 즉시 변경하세요
2. **정기적인 업데이트**: 시스템과 패키지를 최신 상태로 유지
3. **백업**: 정기적인 데이터베이스 백업 설정
4. **모니터링**: 비정상적인 접근 시도 모니터링
5. **HTTPS 사용**: SSL 인증서 설치 필수

## 문제 발생 시 체크리스트

- [ ] MongoDB가 실행 중인가?
- [ ] PM2 프로세스가 실행 중인가?
- [ ] Nginx가 실행 중인가?
- [ ] 방화벽 포트가 열려 있는가?
- [ ] Oracle Cloud 보안 목록이 설정되어 있는가?
- [ ] .env 파일이 올바르게 설정되어 있는가?
- [ ] 로그에 에러가 있는가?

---

이 가이드를 따라 설치하면 Gemini CLI가 자동으로 서버를 구성할 수 있습니다.