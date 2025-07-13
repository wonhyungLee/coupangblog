#!/bin/bash

# WonGram Shop Oracle Cloud 서버 업로드 스크립트

echo "=================================================="
echo "    📤 WonGram Shop Oracle Cloud 업로드"
echo "=================================================="

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 설정 변수 (실제 값으로 변경 필요)
SERVER_IP=""
SERVER_USER="ubuntu"
SERVER_PATH="/home/ubuntu/coupangblog"
LOCAL_PATH="."

# SSH 키 경로 (필요시 수정)
SSH_KEY=""

# 함수: 정보 출력
print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 설정 확인
check_config() {
    print_info "설정을 확인합니다..."
    
    if [ -z "$SERVER_IP" ]; then
        print_error "서버 IP가 설정되지 않았습니다."
        echo "스크립트 상단의 SERVER_IP 변수를 설정하세요."
        read -p "서버 IP를 입력하세요: " SERVER_IP
        if [ -z "$SERVER_IP" ]; then
            exit 1
        fi
    fi
    
    print_success "서버 IP: $SERVER_IP"
    print_success "사용자: $SERVER_USER"
    print_success "경로: $SERVER_PATH"
}

# SSH 연결 테스트
test_connection() {
    print_info "서버 연결을 테스트합니다..."
    
    if [ -n "$SSH_KEY" ]; then
        ssh_cmd="ssh -i $SSH_KEY -o ConnectTimeout=10"
    else
        ssh_cmd="ssh -o ConnectTimeout=10"
    fi
    
    if $ssh_cmd $SERVER_USER@$SERVER_IP "echo 'Connected'" >/dev/null 2>&1; then
        print_success "서버 연결 성공"
    else
        print_error "서버 연결 실패"
        echo "다음을 확인하세요:"
        echo "1. 서버 IP 주소가 올바른가?"
        echo "2. SSH 키가 올바르게 설정되었는가?"
        echo "3. 방화벽에서 SSH 포트(22)가 열려있는가?"
        exit 1
    fi
}

# 업로드할 파일 목록 확인
check_files() {
    print_info "업로드할 파일을 확인합니다..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json 파일이 없습니다. 올바른 프로젝트 디렉토리에서 실행하세요."
        exit 1
    fi
    
    # 제외할 파일/폴더 목록
    exclude_list=(
        "node_modules"
        ".git"
        "logs"
        ".env"
        "*.log"
        ".DS_Store"
        "thumbs.db"
        ".vscode"
        ".idea"
        "coverage"
        ".nyc_output"
        "*.tmp"
        "*.temp"
    )
    
    print_success "업로드 준비 완료"
}

# 백업 생성
create_backup() {
    print_info "서버의 기존 파일을 백업합니다..."
    
    if [ -n "$SSH_KEY" ]; then
        ssh_cmd="ssh -i $SSH_KEY"
    else
        ssh_cmd="ssh"
    fi
    
    backup_date=$(date +%Y%m%d_%H%M%S)
    backup_path="/home/ubuntu/backup_$backup_date"
    
    $ssh_cmd $SERVER_USER@$SERVER_IP "
        if [ -d '$SERVER_PATH' ]; then
            sudo cp -r $SERVER_PATH $backup_path
            echo '백업 생성: $backup_path'
        else
            echo '기존 파일이 없어 백업을 건너뜁니다.'
        fi
    "
    
    print_success "백업 완료"
}

# 파일 업로드
upload_files() {
    print_info "파일을 업로드합니다..."
    
    if [ -n "$SSH_KEY" ]; then
        scp_cmd="scp -i $SSH_KEY -r"
        ssh_cmd="ssh -i $SSH_KEY"
    else
        scp_cmd="scp -r"
        ssh_cmd="ssh"
    fi
    
    # 서버에 디렉토리 생성
    $ssh_cmd $SERVER_USER@$SERVER_IP "sudo mkdir -p $SERVER_PATH"
    
    # 제외 옵션 생성
    exclude_opts=""
    for item in "${exclude_list[@]}"; do
        exclude_opts="$exclude_opts --exclude=$item"
    done
    
    # rsync 사용 (더 효율적)
    if command -v rsync >/dev/null 2>&1; then
        print_info "rsync를 사용하여 업로드합니다..."
        
        if [ -n "$SSH_KEY" ]; then
            rsync_ssh="ssh -i $SSH_KEY"
        else
            rsync_ssh="ssh"
        fi
        
        rsync -avz --progress \
            --exclude=node_modules \
            --exclude=.git \
            --exclude=logs \
            --exclude=.env \
            --exclude="*.log" \
            --exclude=.DS_Store \
            --exclude=thumbs.db \
            --exclude=.vscode \
            --exclude=.idea \
            --exclude=coverage \
            --exclude=.nyc_output \
            --exclude="*.tmp" \
            --exclude="*.temp" \
            -e "$rsync_ssh" \
            ./ $SERVER_USER@$SERVER_IP:$SERVER_PATH/
    else
        print_warning "rsync를 찾을 수 없습니다. scp를 사용합니다..."
        $scp_cmd --exclude=node_modules ./* $SERVER_USER@$SERVER_IP:$SERVER_PATH/
    fi
    
    print_success "파일 업로드 완료"
}

# 서버에서 설정
configure_server() {
    print_info "서버 설정을 진행합니다..."
    
    if [ -n "$SSH_KEY" ]; then
        ssh_cmd="ssh -i $SSH_KEY"
    else
        ssh_cmd="ssh"
    fi
    
    $ssh_cmd $SERVER_USER@$SERVER_IP "
        cd $SERVER_PATH
        
        # 권한 설정
        sudo chown -R ubuntu:ubuntu $SERVER_PATH
        
        # 실행 권한 부여
        chmod +x deploy.sh
        chmod +x start-server.sh
        
        # .env 파일 확인
        if [ ! -f '.env' ]; then
            if [ -f '.env.example' ]; then
                echo '.env.example을 기반으로 .env 파일을 생성했습니다.'
                cp .env.example .env
                echo '⚠️  .env 파일을 편집하여 환경 변수를 설정하세요:'
                echo '   nano .env'
            else
                echo '❌ .env.example 파일이 없습니다.'
            fi
        fi
        
        echo '📁 현재 디렉토리 내용:'
        ls -la
    "
    
    print_success "서버 설정 완료"
}

# 의존성 설치
install_dependencies() {
    print_info "서버에서 의존성을 설치합니다..."
    
    if [ -n "$SSH_KEY" ]; then
        ssh_cmd="ssh -i $SSH_KEY"
    else
        ssh_cmd="ssh"
    fi
    
    $ssh_cmd $SERVER_USER@$SERVER_IP "
        cd $SERVER_PATH
        
        # Node.js 버전 확인
        if command -v node >/dev/null 2>&1; then
            echo 'Node.js 버전:' \$(node --version)
            echo 'NPM 버전:' \$(npm --version)
            
            # 의존성 설치
            echo 'NPM 의존성을 설치합니다...'
            npm install --production
            
            if [ \$? -eq 0 ]; then
                echo '✅ 의존성 설치 완료'
            else
                echo '❌ 의존성 설치 실패'
            fi
        else
            echo '❌ Node.js가 설치되지 않았습니다.'
            echo '다음 명령으로 배포 스크립트를 실행하세요:'
            echo './deploy.sh'
        fi
    "
    
    print_success "의존성 설치 완료"
}

# 서비스 재시작
restart_service() {
    print_info "서비스를 재시작합니다..."
    
    if [ -n "$SSH_KEY" ]; then
        ssh_cmd="ssh -i $SSH_KEY"
    else
        ssh_cmd="ssh"
    fi
    
    $ssh_cmd $SERVER_USER@$SERVER_IP "
        cd $SERVER_PATH
        
        # PM2가 설치되어 있다면 재시작
        if command -v pm2 >/dev/null 2>&1; then
            echo 'PM2로 서비스를 재시작합니다...'
            pm2 restart wongram-shop || pm2 start ecosystem.config.js
            pm2 save
            echo '✅ 서비스 재시작 완료'
            
            echo '📊 현재 실행 중인 프로세스:'
            pm2 list
        else
            echo '⚠️  PM2가 설치되지 않았습니다.'
            echo '배포 스크립트를 실행하거나 수동으로 서버를 시작하세요:'
            echo './deploy.sh'
            echo '또는'
            echo './start-server.sh'
        fi
    "
    
    print_success "서비스 재시작 완료"
}

# 메인 메뉴
show_menu() {
    echo ""
    echo "📋 업로드 옵션을 선택하세요:"
    echo "1) 전체 업로드 및 배포 (권장)"
    echo "2) 파일만 업로드"
    echo "3) 설정 및 재시작만"
    echo "4) 연결 테스트만"
    echo "5) 서버 상태 확인"
    echo "6) 로그 확인"
    echo "0) 종료"
    echo ""
}

# 서버 상태 확인
check_server_status() {
    print_info "서버 상태를 확인합니다..."
    
    if [ -n "$SSH_KEY" ]; then
        ssh_cmd="ssh -i $SSH_KEY"
    else
        ssh_cmd="ssh"
    fi
    
    $ssh_cmd $SERVER_USER@$SERVER_IP "
        echo '🖥️  시스템 정보:'
        uname -a
        echo ''
        
        echo '💽 디스크 사용량:'
        df -h
        echo ''
        
        echo '🧠 메모리 사용량:'
        free -h
        echo ''
        
        echo '🔄 실행 중인 PM2 프로세스:'
        if command -v pm2 >/dev/null 2>&1; then
            pm2 list
        else
            echo 'PM2가 설치되지 않았습니다.'
        fi
        echo ''
        
        echo '🌐 Nginx 상태:'
        if command -v nginx >/dev/null 2>&1; then
            sudo systemctl is-active nginx
        else
            echo 'Nginx가 설치되지 않았습니다.'
        fi
        echo ''
        
        echo '🗄️  MongoDB 상태:'
        if command -v mongod >/dev/null 2>&1; then
            sudo systemctl is-active mongod
        else
            echo 'MongoDB가 설치되지 않았습니다.'
        fi
    "
}

# 로그 확인
check_logs() {
    print_info "최근 로그를 확인합니다..."
    
    if [ -n "$SSH_KEY" ]; then
        ssh_cmd="ssh -i $SSH_KEY"
    else
        ssh_cmd="ssh"
    fi
    
    $ssh_cmd $SERVER_USER@$SERVER_IP "
        echo '📋 PM2 로그 (최근 50줄):'
        if command -v pm2 >/dev/null 2>&1; then
            pm2 logs --lines 50
        else
            echo 'PM2가 설치되지 않았습니다.'
        fi
        echo ''
        
        echo '🌐 Nginx 오류 로그 (최근 20줄):'
        if [ -f '/var/log/nginx/error.log' ]; then
            sudo tail -20 /var/log/nginx/error.log
        else
            echo 'Nginx 로그 파일을 찾을 수 없습니다.'
        fi
    "
}

# 메인 실행
main() {
    check_config
    
    while true; do
        show_menu
        read -p "선택 (0-6): " choice
        
        case $choice in
            1)
                test_connection
                create_backup
                upload_files
                configure_server
                install_dependencies
                restart_service
                echo ""
                print_success "🎉 전체 업로드 및 배포가 완료되었습니다!"
                echo ""
                echo "🌐 웹사이트 확인: https://wongram.shop"
                echo "⚙️  관리자 페이지: https://wongram.shop/admin"
                echo "🎮 테트리스 게임: https://wongram.shop/game/tetris"
                ;;
            2)
                test_connection
                create_backup
                upload_files
                configure_server
                ;;
            3)
                test_connection
                configure_server
                restart_service
                ;;
            4)
                test_connection
                ;;
            5)
                test_connection
                check_server_status
                ;;
            6)
                test_connection
                check_logs
                ;;
            0)
                print_success "업로드 스크립트를 종료합니다."
                exit 0
                ;;
            *)
                print_error "잘못된 선택입니다. 0-6 사이의 숫자를 입력하세요."
                ;;
        esac
        
        echo ""
        read -p "계속하려면 Enter를 누르세요..."
    done
}

# 스크립트 시작
echo ""
print_info "WonGram Shop을 Oracle Cloud 서버에 업로드합니다."
print_warning "업로드 전에 다음을 확인하세요:"
echo "  1. Oracle Cloud 인스턴스가 실행 중인가?"
echo "  2. SSH 키가 올바르게 설정되었는가?"
echo "  3. 방화벽에서 필요한 포트들이 열려있는가?"
echo ""

main
