#!/bin/bash

# WonGram Shop PWA 서버 시작 스크립트 (Ubuntu/Linux)

echo "=================================================="
echo "    🚀 WonGram Shop PWA 서버 시작"
echo "=================================================="

# 환경 변수 로드
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 현재 디렉토리 확인
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 오류: WonGram Shop 프로젝트 폴더에서 실행해주세요.${NC}"
    echo "현재 위치: $(pwd)"
    exit 1
fi

# MongoDB 상태 확인
check_mongodb() {
    if command -v mongod &> /dev/null; then
        mongo_status=$(sudo systemctl is-active mongod 2>/dev/null || echo "inactive")
        if [ "$mongo_status" != "active" ]; then
            echo -e "${YELLOW}⚠ MongoDB가 실행되지 않았습니다. 시작합니다...${NC}"
            sudo systemctl start mongod
            sleep 3
        fi
        echo -e "${GREEN}✓ MongoDB 실행 중${NC}"
    else
        echo -e "${RED}❌ MongoDB가 설치되지 않았습니다.${NC}"
        echo "설치 방법: ./deploy.sh 스크립트를 실행하세요."
        exit 1
    fi
}

# Node.js 및 NPM 확인
check_nodejs() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js가 설치되지 않았습니다.${NC}"
        echo "설치 방법: ./deploy.sh 스크립트를 실행하세요."
        exit 1
    fi
    
    node_version=$(node --version)
    npm_version=$(npm --version)
    echo -e "${GREEN}✓ Node.js $node_version${NC}"
    echo -e "${GREEN}✓ NPM $npm_version${NC}"
}

# PM2 확인
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}⚠ PM2가 설치되지 않았습니다. 설치합니다...${NC}"
        sudo npm install -g pm2
    fi
    
    pm2_version=$(pm2 --version)
    echo -e "${GREEN}✓ PM2 $pm2_version${NC}"
}

# 의존성 설치 확인
check_dependencies() {
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 의존성을 설치합니다...${NC}"
        npm install
    fi
    echo -e "${GREEN}✓ Node.js 의존성 설치됨${NC}"
}

# 환경 변수 확인
check_environment() {
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠ .env 파일이 없습니다.${NC}"
        if [ -f ".env.example" ]; then
            echo -e "${BLUE}ℹ .env.example을 복사하여 .env 파일을 생성합니다...${NC}"
            cp .env.example .env
            echo -e "${YELLOW}⚠ .env 파일을 편집하여 필요한 환경 변수를 설정하세요.${NC}"
            echo "  - OPENAI_API_KEY (AI 어시스턴트)"
            echo "  - MONGODB_URI"
            echo "  - JWT_SECRET"
            echo "  - SESSION_SECRET"
        else
            echo -e "${RED}❌ .env.example 파일도 없습니다.${NC}"
            exit 1
        fi
    fi
    echo -e "${GREEN}✓ 환경 변수 파일 확인됨${NC}"
}

# 로그 디렉토리 생성
create_logs() {
    mkdir -p logs
    echo -e "${GREEN}✓ 로그 디렉토리 생성됨${NC}"
}

# 서버 시작 옵션
show_menu() {
    echo ""
    echo -e "${BLUE}🔧 서버 시작 옵션을 선택하세요:${NC}"
    echo "1) 개발 모드 (nodemon, 포트 3000)"
    echo "2) 프로덕션 모드 (PM2, 포트 3000)"
    echo "3) PM2 클러스터 모드 (멀티 인스턴스)"
    echo "4) PM2 상태 확인"
    echo "5) 로그 확인"
    echo "6) 서버 중지"
    echo "7) 서버 재시작"
    echo "8) MongoDB 상태 확인"
    echo "9) 전체 상태 확인"
    echo "0) 종료"
    echo ""
}

# 개발 모드 시작
start_dev() {
    echo -e "${BLUE}🔧 개발 모드로 서버를 시작합니다...${NC}"
    echo -e "${GREEN}📡 서버 주소: http://localhost:3000${NC}"
    echo -e "${GREEN}🎮 테트리스 게임: http://localhost:3000/game/tetris${NC}"
    echo -e "${GREEN}⚙️ 관리자 페이지: http://localhost:3000/admin${NC}"
    echo -e "${YELLOW}🛑 종료하려면 Ctrl+C를 누르세요${NC}"
    echo ""
    npm run dev
}

# 프로덕션 모드 시작
start_prod() {
    echo -e "${BLUE}🚀 프로덕션 모드로 서버를 시작합니다...${NC}"
    pm2 start ecosystem.config.js --env production
    pm2 save
    echo -e "${GREEN}✅ 서버가 백그라운드에서 실행 중입니다.${NC}"
    show_urls
}

# 클러스터 모드 시작
start_cluster() {
    echo -e "${BLUE}⚡ 클러스터 모드로 서버를 시작합니다...${NC}"
    pm2 start ecosystem.config.js --env production
    pm2 save
    echo -e "${GREEN}✅ 클러스터 모드로 실행 중입니다.${NC}"
    pm2 list
    show_urls
}

# PM2 상태 확인
check_pm2_status() {
    echo -e "${BLUE}📊 PM2 상태:${NC}"
    pm2 list
    echo ""
    echo -e "${BLUE}💾 메모리 사용량:${NC}"
    pm2 monit --no-daemon
}

# 로그 확인
show_logs() {
    echo -e "${BLUE}📋 실시간 로그:${NC}"
    echo "종료하려면 Ctrl+C를 누르세요"
    pm2 logs
}

# 서버 중지
stop_server() {
    echo -e "${YELLOW}🛑 서버를 중지합니다...${NC}"
    pm2 stop all
    pm2 delete all
    echo -e "${GREEN}✅ 서버가 중지되었습니다.${NC}"
}

# 서버 재시작
restart_server() {
    echo -e "${BLUE}🔄 서버를 재시작합니다...${NC}"
    pm2 restart all
    echo -e "${GREEN}✅ 서버가 재시작되었습니다.${NC}"
    show_urls
}

# MongoDB 상태 확인
check_mongodb_status() {
    echo -e "${BLUE}🗄️ MongoDB 상태:${NC}"
    sudo systemctl status mongod --no-pager
    echo ""
    echo -e "${BLUE}📊 MongoDB 연결 테스트:${NC}"
    mongosh --eval "db.adminCommand('ping')" 2>/dev/null || echo "MongoDB 연결 실패"
}

# 전체 상태 확인
check_full_status() {
    echo -e "${BLUE}🔍 WonGram Shop 전체 상태 확인${NC}"
    echo "========================================"
    
    # Node.js 버전
    echo -e "${BLUE}Node.js:${NC} $(node --version)"
    echo -e "${BLUE}NPM:${NC} $(npm --version)"
    
    # PM2 상태
    echo ""
    echo -e "${BLUE}PM2 프로세스:${NC}"
    pm2 list
    
    # MongoDB 상태
    echo ""
    echo -e "${BLUE}MongoDB:${NC} $(sudo systemctl is-active mongod)"
    
    # Nginx 상태 (있는 경우)
    if command -v nginx &> /dev/null; then
        echo -e "${BLUE}Nginx:${NC} $(sudo systemctl is-active nginx)"
    fi
    
    # 포트 사용 확인
    echo ""
    echo -e "${BLUE}포트 3000 사용 상태:${NC}"
    lsof -i :3000 || echo "포트 3000 사용 중인 프로세스 없음"
    
    # 디스크 사용량
    echo ""
    echo -e "${BLUE}디스크 사용량:${NC}"
    df -h . | tail -1
    
    # 메모리 사용량
    echo ""
    echo -e "${BLUE}메모리 사용량:${NC}"
    free -h
    
    echo "========================================"
}

# URL 정보 표시
show_urls() {
    echo ""
    echo -e "${GREEN}🌐 접속 정보:${NC}"
    echo "  📱 메인 사이트: http://localhost:3000"
    echo "  🎮 테트리스 게임: http://localhost:3000/game/tetris"
    echo "  ⚙️ 관리자 페이지: http://localhost:3000/admin"
    echo "  📊 API 상태: http://localhost:3000/api/health"
    echo ""
    echo -e "${BLUE}💡 PWA 기능:${NC}"
    echo "  - 앱으로 설치 가능"
    echo "  - 오프라인 사용 가능"
    echo "  - 푸시 알림 지원"
    echo ""
    echo -e "${BLUE}🤖 AI 어시스턴트 (관리자 전용):${NC}"
    echo "  - 리뷰 자동 생성"
    echo "  - SEO 최적화"
    echo "  - 스마트 태그 제안"
    echo ""
}

# 메인 실행 흐름
echo -e "${BLUE}🔍 시스템 확인 중...${NC}"
check_nodejs
check_mongodb
check_pm2
check_dependencies
check_environment
create_logs

echo -e "${GREEN}✅ 모든 시스템이 준비되었습니다!${NC}"

# 메뉴 루프
while true; do
    show_menu
    read -p "선택 (0-9): " choice
    
    case $choice in
        1)
            start_dev
            ;;
        2)
            start_prod
            ;;
        3)
            start_cluster
            ;;
        4)
            check_pm2_status
            ;;
        5)
            show_logs
            ;;
        6)
            stop_server
            ;;
        7)
            restart_server
            ;;
        8)
            check_mongodb_status
            ;;
        9)
            check_full_status
            ;;
        0)
            echo -e "${GREEN}👋 WonGram Shop 서버 관리를 종료합니다.${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ 잘못된 선택입니다. 0-9 사이의 숫자를 입력하세요.${NC}"
            ;;
    esac
    
    echo ""
    read -p "계속하려면 Enter를 누르세요..."
done
