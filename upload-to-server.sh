#!/bin/bash

# 오라클 클라우드 Ubuntu 서버 업로드 스크립트
# wongram.shop 쿠팡 리뷰 블로그 배포

# 서버 정보 (실제 정보로 변경하세요)
SERVER_USER="ubuntu"
SERVER_HOST="your-oracle-cloud-ip"
SERVER_PATH="/var/www/wongram.shop"

# 색상 코드
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Wongram Shop 배포 시작 ===${NC}"

# 1. 로컬에서 필요 없는 파일 제거
echo "불필요한 파일 정리 중..."
find . -name ".DS_Store" -delete
find . -name "Thumbs.db" -delete

# 2. 서버에 디렉토리 생성
echo -e "${GREEN}서버 디렉토리 구조 생성 중...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    # 메인 디렉토리 생성
    sudo mkdir -p /var/www/wongram.shop
    sudo mkdir -p /var/www/wongram.shop/css
    sudo mkdir -p /var/www/wongram.shop/js
    sudo mkdir -p /var/www/wongram.shop/images
    
    # 테트리스 게임 서브디렉토리 생성
    sudo mkdir -p /var/www/wongram.shop/tetris-game
    sudo mkdir -p /var/www/wongram.shop/tetris-game/css
    sudo mkdir -p /var/www/wongram.shop/tetris-game/js
    sudo mkdir -p /var/www/wongram.shop/tetris-game/audio
    
    # 권한 설정
    sudo chown -R www-data:www-data /var/www/wongram.shop
    sudo chmod -R 755 /var/www/wongram.shop
EOF

# 3. 메인 블로그 파일 업로드
echo -e "${GREEN}메인 블로그 파일 업로드 중...${NC}"
scp index.html ${SERVER_USER}@${SERVER_HOST}:/tmp/
scp admin.html ${SERVER_USER}@${SERVER_HOST}:/tmp/
scp review.html ${SERVER_USER}@${SERVER_HOST}:/tmp/
scp review-template.html ${SERVER_USER}@${SERVER_HOST}:/tmp/
scp robots.txt ${SERVER_USER}@${SERVER_HOST}:/tmp/
scp sitemap.xml ${SERVER_USER}@${SERVER_HOST}:/tmp/

# CSS 파일을 위한 임시 디렉토리 생성
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p /tmp/css /tmp/js"

# CSS 파일 업로드
scp css/blog-style.css ${SERVER_USER}@${SERVER_HOST}:/tmp/css/
scp css/review-style.css ${SERVER_USER}@${SERVER_HOST}:/tmp/css/
scp css/admin-style.css ${SERVER_USER}@${SERVER_HOST}:/tmp/css/

# JS 파일 업로드
scp js/blog-script.js ${SERVER_USER}@${SERVER_HOST}:/tmp/js/
scp js/coupang-products.js ${SERVER_USER}@${SERVER_HOST}:/tmp/js/
scp js/admin-script.js ${SERVER_USER}@${SERVER_HOST}:/tmp/js/
scp js/review-loader.js ${SERVER_USER}@${SERVER_HOST}:/tmp/js/

# 4. 테트리스 게임 파일 업로드
echo -e "${GREEN}테트리스 게임 파일 업로드 중...${NC}"
scp -r tetris-game/* ${SERVER_USER}@${SERVER_HOST}:/tmp/tetris-game/

# 5. 서버에서 파일 이동
echo -e "${GREEN}서버에서 파일 배치 중...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    # 메인 블로그 파일 이동
    sudo mv /tmp/index.html /var/www/wongram.shop/
    sudo mv /tmp/admin.html /var/www/wongram.shop/
    sudo mv /tmp/review.html /var/www/wongram.shop/
    sudo mv /tmp/review-template.html /var/www/wongram.shop/
    sudo mv /tmp/robots.txt /var/www/wongram.shop/
    sudo mv /tmp/sitemap.xml /var/www/wongram.shop/
    
    # CSS 파일 이동
    sudo mv /tmp/css/* /var/www/wongram.shop/css/
    
    # JS 파일 이동
    sudo mv /tmp/js/* /var/www/wongram.shop/js/
    
    # 테트리스 게임 파일 이동
    sudo cp -r /tmp/tetris-game/* /var/www/wongram.shop/tetris-game/
    
    # 임시 파일 정리
    rm -rf /tmp/tetris-game /tmp/css /tmp/js
    
    # 권한 재설정
    sudo chown -R www-data:www-data /var/www/wongram.shop
    sudo chmod -R 755 /var/www/wongram.shop
EOF

# 6. Nginx 설정 파일 생성
echo -e "${GREEN}Nginx 설정 파일 생성 중...${NC}"
cat > nginx-config.conf << 'NGINX_EOF'
server {
    listen 80;
    listen [::]:80;
    server_name wongram.shop www.wongram.shop;

    root /var/www/wongram.shop;
    index index.html;

    # 메인 사이트
    location / {
        try_files $uri $uri/ =404;
    }

    # 테트리스 게임 라우팅
    location /tetris-game {
        alias /var/www/wongram.shop/tetris-game;
        try_files $uri $uri/ /tetris-game/index.html;
    }
    
    # 관리자 페이지
    location /admin.html {
        try_files $uri =404;
    }
    
    # 리뷰 페이지 라우팅
    location ~ ^/review/(.+)$ {
        try_files /review.html =404;
    }
    
    # 카테고리 페이지 라우팅
    location ~ ^/category/(.+)$ {
        try_files /category.html /index.html =404;
    }
    
    # 검색 페이지 라우팅
    location /search {
        try_files /search.html /index.html =404;
    }

    # 정적 파일 캐싱
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip 압축
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}

# HTTPS 리다이렉션 (Let's Encrypt 설정 후 활성화)
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name wongram.shop www.wongram.shop;
#     
#     ssl_certificate /etc/letsencrypt/live/wongram.shop/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/wongram.shop/privkey.pem;
#     
#     # ... 나머지 설정은 위와 동일 ...
# }
NGINX_EOF

# Nginx 설정 파일 업로드 및 적용
scp nginx-config.conf ${SERVER_USER}@${SERVER_HOST}:/tmp/
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    sudo mv /tmp/nginx-config.conf /etc/nginx/sites-available/wongram.shop
    sudo ln -sf /etc/nginx/sites-available/wongram.shop /etc/nginx/sites-enabled/
    
    # Nginx 설정 테스트
    sudo nginx -t
    
    # Nginx 재시작
    sudo systemctl reload nginx
EOF

echo -e "${GREEN}=== 배포 완료! ===${NC}"
echo -e "웹사이트: http://wongram.shop"
echo -e "테트리스 게임: http://wongram.shop/tetris-game"

# SSL 인증서 설정 안내
echo -e "\n${GREEN}SSL 인증서 설정 (선택사항):${NC}"
echo "sudo certbot --nginx -d wongram.shop -d www.wongram.shop"
