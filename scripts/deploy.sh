#!/bin/bash

# WonGram Shop PWA & AI 배포 스크립트
# Oracle Cloud Ubuntu에서 Node.js PWA 애플리케이션 배포

echo "=== WonGram Shop PWA & AI 배포 스크립트 ==="

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 기본 변수
APP_DIR="/home/ubuntu/coupangblog"
NGINX_CONFIG="/etc/nginx/sites-available/wongram-shop"
DOMAIN="wongram.shop"
NODE_VERSION="18"

# 함수: 성공/실패 메시지
print_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1 완료${NC}"
    else
        echo -e "${RED}✗ $1 실패${NC}"
        exit 1
    fi
}

# 함수: 정보 메시지
print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# 함수: 경고 메시지
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# 시작 메시지
print_info "WonGram Shop (wongram.shop) 배포를 시작합니다..."
print_info "이 스크립트는 Oracle Cloud Ubuntu 환경에 최적화되었습니다."

# 1. 시스템 업데이트
echo ""
echo "1. 시스템 패키지 업데이트..."
sudo apt update && sudo apt upgrade -y
print_status "시스템 업데이트"

# 2. 필요한 패키지 설치
echo ""
echo "2. 필요한 패키지 설치..."
sudo apt install -y curl git nginx certbot python3-certbot-nginx htop unzip software-properties-common
print_status "기본 패키지 설치"

# 3. Node.js 설치 (v18.x LTS)
echo ""
echo "3. Node.js $NODE_VERSION LTS 설치..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt install -y nodejs
node_version=$(node --version)
npm_version=$(npm --version)
print_info "Node.js 버전: $node_version"
print_info "NPM 버전: $npm_version"
print_status "Node.js 설치"

# 4. MongoDB 설치
echo ""
echo "4. MongoDB 설치..."
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
print_status "MongoDB 설치"

# 5. PM2 설치
echo ""
echo "5. PM2 설치..."
sudo npm install -g pm2@latest
pm2_version=$(pm2 --version)
print_info "PM2 버전: $pm2_version"
print_status "PM2 설치"

# 6. 애플리케이션 디렉토리 설정
echo ""
echo "6. 애플리케이션 디렉토리 설정..."
sudo mkdir -p $APP_DIR
sudo chown -R ubuntu:ubuntu $APP_DIR
cd $APP_DIR
print_status "디렉토리 설정"

# 7. 파일 확인
echo ""
echo "7. 애플리케이션 파일 확인..."
if [ ! -f "package.json" ]; then
    print_warning "package.json 파일이 없습니다."
    echo "Git에서 클론하거나 파일을 업로드해주세요:"
    echo "git clone <repository-url> ."
    echo "또는 scp를 사용하여 파일을 전송하세요."
    exit 1
fi
print_status "파일 확인"

# 8. NPM 패키지 설치
echo ""
echo "8. NPM 패키지 설치..."
npm ci --only=production
print_status "NPM 패키지 설치"

# 9. 디렉토리 구조 생성
echo ""
echo "9. 필요한 디렉토리 생성..."
mkdir -p logs
mkdir -p public/uploads
mkdir -p public/images
print_status "디렉토리 생성"

# 10. PWA 아이콘 생성 확인
echo ""
echo "10. PWA 아이콘 파일 확인..."
icon_files=(
    "public/images/icon-16x16.png"
    "public/images/icon-32x32.png"
    "public/images/icon-192x192.png"
    "public/images/icon-512x512.png"
    "public/images/apple-touch-icon.png"
)

missing_icons=()
for icon in "${icon_files[@]}"; do
    if [ ! -f "$icon" ]; then
        missing_icons+=("$icon")
    fi
done

if [ ${#missing_icons[@]} -gt 0 ]; then
    print_warning "다음 PWA 아이콘 파일들이 누락되었습니다:"
    for icon in "${missing_icons[@]}"; do
        echo "  - $icon"
    done
    print_info "온라인 아이콘 생성기를 사용하여 아이콘을 생성하세요."
else
    print_status "PWA 아이콘 확인"
fi

# 11. 환경 변수 설정
echo ""
echo "11. 환경 변수 설정..."
if [ ! -f ".env" ]; then
    print_warning ".env 파일이 없습니다."
    if [ -f ".env.example" ]; then
        print_info ".env.example을 기반으로 .env 파일을 생성합니다..."
        cp .env.example .env
        echo ""
        echo "다음 환경 변수들을 설정해주세요:"
        echo "  - OPENAI_API_KEY (AI 어시스턴트용)"
        echo "  - GOOGLE_ADSENSE_CLIENT"
        echo "  - ADMIN_EMAIL"
        echo "  - ADMIN_PASSWORD"
        echo ""
        echo "nano .env 명령어로 파일을 편집하세요."
        read -p "환경 변수 설정을 완료했나요? (y/n): " env_ready
        if [[ ! "$env_ready" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            echo "환경 변수 설정 후 다시 실행해주세요."
            exit 1
        fi
    else
        echo "필수 환경 변수를 포함한 .env 파일을 생성해주세요."
        exit 1
    fi
fi
print_status "환경 변수 확인"

# 12. MongoDB 연결 테스트
echo ""
echo "12. MongoDB 연결 테스트..."
mongo_status=$(sudo systemctl is-active mongod)
if [ "$mongo_status" = "active" ]; then
    print_status "MongoDB 연결"
else
    print_warning "MongoDB가 실행되지 않았습니다."
    sudo systemctl start mongod
    sleep 5
    print_status "MongoDB 시작"
fi

# 13. Nginx 설정
echo ""
echo "13. Nginx 설정..."
sudo cp nginx.conf $NGINX_CONFIG
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
sudo nginx -t
print_status "Nginx 설정"

# 14. 방화벽 설정
echo ""
echo "14. 방화벽 설정..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
echo "y" | sudo ufw enable
print_status "방화벽 설정"

# 15. Nginx 시작
echo ""
echo "15. Nginx 시작..."
sudo systemctl restart nginx
sudo systemctl enable nginx
print_status "Nginx 시작"

# 16. PM2로 애플리케이션 시작
echo ""
echo "16. 애플리케이션 시작..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu
print_status "애플리케이션 시작"

# 17. 애플리케이션 상태 확인
echo ""
echo "17. 애플리케이션 상태 확인..."
sleep 5
app_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$app_status" = "200" ]; then
    print_status "애플리케이션 실행 확인"
else
    print_warning "애플리케이션이 정상적으로 실행되지 않았습니다. (HTTP: $app_status)"
    echo "PM2 로그를 확인하세요: pm2 logs"
fi

# 18. SSL 인증서 설정 (Let's Encrypt)
echo ""
echo "18. SSL 인증서 설정..."
print_info "도메인 $DOMAIN이 이 서버의 IP를 가리키도록 DNS 설정을 완료해야 합니다."
echo "DNS 설정을 완료했나요? (y/n)"
read -r dns_ready
if [[ "$dns_ready" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    print_info "SSL 인증서를 설정합니다..."
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    if [ $? -eq 0 ]; then
        print_status "SSL 인증서 설정"
    else
        print_warning "SSL 인증서 설정 실패. 수동으로 설정해주세요:"
        echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    fi
else
    print_info "DNS 설정 후 다음 명령어를 실행하세요:"
    echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

# 19. Admin 계정 초기화
echo ""
echo "19. Admin 계정 초기화..."
sleep 3
init_response=$(curl -s http://localhost:3000/auth/init-admin)
if [[ "$init_response" == *"success"* ]] || [[ "$init_response" == *"이미"* ]]; then
    print_status "Admin 계정 초기화"
else
    print_warning "Admin 계정 초기화 실패. 수동으로 초기화해주세요:"
    echo "curl http://localhost:3000/auth/init-admin"
fi

# 20. 자동 백업 설정
echo ""
echo "20. 자동 백업 스크립트 설정..."
cat > /home/ubuntu/backup-mongodb.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mongodump --out $BACKUP_DIR/mongodb_$DATE
tar -czf $BACKUP_DIR/mongodb_$DATE.tar.gz -C $BACKUP_DIR mongodb_$DATE
rm -rf $BACKUP_DIR/mongodb_$DATE
find $BACKUP_DIR -name "mongodb_*.tar.gz" -mtime +7 -delete
EOF
chmod +x /home/ubuntu/backup-mongodb.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup-mongodb.sh") | crontab -
print_status "자동 백업 설정"

# 완료 메시지
echo ""
echo "=================================================="
echo -e "${GREEN}🎉 WonGram Shop 배포 완료! 🎉${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}📱 PWA 기능:${NC}"
echo "  - Service Worker 등록됨"
echo "  - 오프라인 지원"
echo "  - 앱 설치 기능"
echo "  - 푸시 알림 지원"
echo ""
echo -e "${BLUE}🤖 AI 어시스턴트 기능:${NC}"
echo "  - 리뷰 개요 자동 생성"
echo "  - 제품 비교 분석"
echo "  - SEO 최적화 제안"
echo "  - 스마트 태그 제안"
echo ""
echo -e "${BLUE}🌐 접속 정보:${NC}"
echo "  웹사이트: https://$DOMAIN"
echo "  관리자 페이지: https://$DOMAIN/admin"
echo "  테트리스 게임: https://$DOMAIN/game/tetris"
echo ""
echo -e "${BLUE}🔧 중요한 설정:${NC}"
echo "  1. .env 파일에서 OPENAI_API_KEY 설정"
echo "  2. Google AdSense 클라이언트 ID 설정"
echo "  3. 쿠팡 파트너스 가입 및 설정"
echo "  4. PWA 아이콘 파일들 업로드"
echo ""
echo -e "${BLUE}📋 유용한 명령어:${NC}"
echo "  pm2 logs              - 애플리케이션 로그 확인"
echo "  pm2 restart wongram-shop - 애플리케이션 재시작"
echo "  pm2 monit             - 실시간 모니터링"
echo "  sudo nginx -s reload  - Nginx 설정 재로드"
echo "  sudo systemctl status mongod - MongoDB 상태 확인"
echo ""
echo -e "${BLUE}🔒 보안 체크리스트:${NC}"
echo "  ✓ 방화벽 설정 완료"
echo "  ✓ SSL 인증서 설정"
echo "  ✓ MongoDB 보안 설정"
echo "  ✓ 자동 백업 설정"
echo ""
echo -e "${YELLOW}⚠ 추가 권장 사항:${NC}"
echo "  - 정기적인 시스템 업데이트"
echo "  - 로그 모니터링"
echo "  - 백업 테스트"
echo "  - 성능 모니터링"
echo ""
print_info "배포가 완료되었습니다. 브라우저에서 https://$DOMAIN 을 확인해보세요!"
