@echo off
echo ========================================
echo Wongram Shop 서버 시작
echo ========================================
echo.
echo 서버 옵션:
echo 1. 개선된 서버 (리뷰 관리 API 포함) - 권장
echo 2. 원본 서버 (테트리스 게임만)
echo.
set /p choice="선택하세요 (1 또는 2): "

if "%choice%"=="1" (
    echo.
    echo 개선된 서버를 시작합니다...
    echo.
    echo 접속 주소:
    echo - 메인 페이지: http://localhost:8080
    echo - 관리자 페이지: http://localhost:8080/admin.html
    echo - 테트리스 게임: http://localhost:8080/tetris-game
    echo.
    echo 관리자 계정:
    echo - ID: admin
    echo - PW: coupang2024!
    echo.
    node server-enhanced.js
) else if "%choice%"=="2" (
    echo.
    echo 원본 서버를 시작합니다...
    echo.
    node server.js
) else (
    echo.
    echo 잘못된 선택입니다. 다시 실행해주세요.
    pause
)
