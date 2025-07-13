# 🚀 WonGram Shop 빠른 배포 가이드

서버 IP: **146.56.112.210**  
관리자: **dldnjsrk@gmail.com** / **Dnjsrk87!@#$**

## ⚡ 1분 배포 명령어

```bash
# 1. 서버 접속
ssh ubuntu@146.56.112.210

# 2. 프로젝트 클론 (또는 파일 업로드)
git clone <your-repo-url> coupangblog
cd coupangblog

# 3. 자동 배포 실행
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# 4. Gemini API 키 설정
nano .env
# GEMINI_API_KEY=your-actual-api-key-here 입력

# 5. 서버 시작
chmod +x scripts/start-server.sh
./scripts/start-server.sh
# 메뉴에서 "3) PM2 클러스터 모드" 선택
```

## 🔑 필수 설정값

```env
# 이미 설정된 값들
ADMIN_EMAIL=dldnjsrk@gmail.com
ADMIN_PASSWORD=Dnjsrk87!@#$
JWT_SECRET=ecd76c4e504d21b9f2e9bb0f1cddd7a5
SERVER_IP=146.56.112.210

# 설정 필요한 값
GEMINI_API_KEY=your-gemini-api-key-here  # ⚠️ 필수!
```

## 🌐 접속 정보

- **메인 사이트**: https://wongram.shop
- **관리자 페이지**: https://wongram.shop/admin
- **테트리스 게임**: https://wongram.shop/game/tetris

## 🤖 Gemini API 키 발급

1. [Google AI Studio](https://aistudio.google.com/) 접속
2. Google 계정 로그인
3. "Get API Key" → "Create API Key" 클릭
4. 생성된 키를 .env 파일에 입력

## 🔧 서버 관리 명령어

```bash
# 상태 확인
pm2 list
pm2 logs wongram-shop

# 재시작
pm2 restart wongram-shop

# 모니터링
pm2 monit

# MongoDB 상태
sudo systemctl status mongod

# Nginx 상태
sudo systemctl status nginx
```

## ⚠️ 문제 해결

### Gemini API 오류
```bash
# API 키 확인
grep GEMINI_API_KEY .env

# 테스트
curl "https://generativelanguage.googleapis.com/v1/models?key=YOUR_KEY"
```

### 포트 문제
```bash
# 포트 확인
sudo lsof -i :3000

# 프로세스 종료
pm2 delete all
```

### MongoDB 문제
```bash
# MongoDB 재시작
sudo systemctl restart mongod

# 로그 확인
sudo tail -f /var/log/mongodb/mongod.log
```

## ✅ 배포 후 체크리스트

- [ ] https://wongram.shop 접속 확인
- [ ] 관리자 로그인 (dldnjsrk@gmail.com / Dnjsrk87!@#$)
- [ ] AI 어시스턴트 테스트 (리뷰 개요 생성)
- [ ] 테트리스 게임 실행 확인
- [ ] PWA 설치 테스트 (모바일)
- [ ] MongoDB 연결 확인
- [ ] SSL 인증서 확인

## 📞 지원

- **GitHub**: 프로젝트 Issues
- **이메일**: dldnjsrk@gmail.com
- **문서**: `/docs` 폴더 참조

---

**🎉 배포 완료 후 예상 시간: 10-15분**