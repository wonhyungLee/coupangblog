#!/bin/bash

# Ubuntu 서버 배포 스크립트
# Oracle Cloud Ubuntu에서 Node.js 애플리케이션 배포

echo "=== Tetris & Coupang Review Site 배포 스크립트 ==="

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 기본 변수
APP_DIR="/home/ubuntu/tetris-game"
NGINX_CONFIG="/etc/nginx/sites-available/tetris-coupang"
DOMAIN="yourdomain.com"

# 함수: 성공/실패 메시지
print_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1 완료${NC}"
    else
        echo -e "${RED}✗ $1 실패${NC}"
        exit 1
    fi
}

# 1. 시스템 업데이트
echo "1. 시스템 패키지 업데이트..."
sudo apt update && sudo apt upgrade -y
print_status "시스템 업데이트"

# 2. 필요한 패키지 설치
echo "2. 필요한 패키지 설치..."
sudo apt install -y curl git nginx certbot python3-certbot-nginx
print_status "패키지 설치"

# 3. Node.js 설치 (v18.x)
echo "3. Node.js 설치..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
print_status "Node.js 설치"

# 4. MongoDB 설치
echo "4. MongoDB 설치..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
print_status "MongoDB 설치"

# 5. PM2 설치
echo "5. PM2 설치..."
sudo npm install -g pm2
print_status "PM2 설치"

# 6. 애플리케이션 디렉토리 생성
echo "6. 애플리케이션 디렉토리 설정..."
mkdir -p $APP_DIR
cd $APP_DIR
print_status "디렉토리 생성"

# 7. 파일 복사 (Git clone 또는 SCP로 파일 전송 후 실행)
echo "7. 애플리케이션 파일 확인..."
if [ ! -f "package.json" ]; then
    echo -e "${RED}package.json 파일이 없습니다. 먼저 파일을 업로드하세요.${NC}"
    exit 1
fi
print_status "파일 확인"

# 8. NPM 패키지 설치
echo "8. NPM 패키지 설치..."
npm install --production
print_status "NPM 패키지 설치"

# 9. 로그 디렉토리 생성
echo "9. 로그 디렉토리 생성..."
mkdir -p logs
print_status "로그 디렉토리 생성"

# 10. 환경 변수 설정
echo "10. 환경 변수 설정..."
if [ ! -f ".env" ]; then
    echo -e "${RED}.env 파일이 없습니다. .env.example을 참고하여 생성하세요.${NC}"
    echo "필수 환경 변수:"
    echo "  - MONGODB_URI"
    echo "  - JWT_SECRET"
    echo "  - SESSION_SECRET"
    echo "  - ADMIN_EMAIL"
    echo "  - ADMIN_PASSWORD"
    exit 1
fi
print_status "환경 변수 확인"

# 11. Nginx 설정
echo "11. Nginx 설정..."
sudo cp nginx.conf $NGINX_CONFIG
sudo sed -i "s/yourdomain.com/$DOMAIN/g" $NGINX_CONFIG
sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
sudo nginx -t
print_status "Nginx 설정"

# 12. Nginx 시작
echo "12. Nginx 시작..."
sudo systemctl restart nginx
sudo systemctl enable nginx
print_status "Nginx 시작"

# 13. 방화벽 설정
echo "13. 방화벽 설정..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
print_status "방화벽 설정"

# 14. SSL 인증서 설정 (Let's Encrypt)
echo "14. SSL 인증서 설정..."
echo "도메인이 서버 IP를 가리키도록 DNS 설정을 완료했나요? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN
    print_status "SSL 인증서 설정"
else
    echo "DNS 설정 후 다음 명령어를 실행하세요:"
    echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

# 15. PM2로 애플리케이션 시작
echo "15. 애플리케이션 시작..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu
print_status "애플리케이션 시작"

# 16. Admin 계정 초기화
echo "16. Admin 계정 초기화..."
curl -X GET http://localhost:3000/auth/init-admin
print_status "Admin 계정 생성"

echo ""
echo "=== 배포 완료 ==="
echo "웹사이트: https://$DOMAIN"
echo "관리자 페이지: https://$DOMAIN/admin"
echo ""
echo "다음 단계:"
echo "1. .env 파일에서 ADMIN_EMAIL과 ADMIN_PASSWORD 확인"
echo "2. Google AdSense 클라이언트 ID 설정"
echo "3. 쿠팡 파트너스 가입 및 설정"
echo ""
echo "유용한 명령어:"
echo "  pm2 logs          - 애플리케이션 로그 확인"
echo "  pm2 restart all   - 애플리케이션 재시작"
echo "  pm2 monit         - 실시간 모니터링"
echo "  sudo nginx -s reload - Nginx 재시작"
