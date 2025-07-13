# 🤖 Google Gemini API 설정 가이드

WonGram Shop의 AI 어시스턴트 기능은 Google Gemini API를 사용합니다. 이 가이드를 통해 Gemini API를 설정하고 사용하는 방법을 알아보세요.

## 📋 목차

1. [Gemini API 키 발급](#gemini-api-키-발급)
2. [환경 변수 설정](#환경-변수-설정)
3. [API 테스트](#api-테스트)
4. [사용량 모니터링](#사용량-모니터링)
5. [문제 해결](#문제-해결)

---

## 🔑 Gemini API 키 발급

### 1단계: Google AI Studio 접속

1. [Google AI Studio](https://aistudio.google.com/) 방문
2. Google 계정으로 로그인
3. 서비스 약관에 동의

### 2단계: API 키 생성

1. **"Get API Key"** 또는 **"API 키 만들기"** 클릭
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **"Create API Key"** 클릭
4. 생성된 API 키를 안전한 곳에 복사 및 저장

### 3단계: API 키 권한 설정

- **Generative Language API** 활성화 확인
- 필요시 **Google Cloud Console**에서 추가 권한 설정

---

## ⚙️ 환경 변수 설정

### .env 파일 수정

```bash
# .env 파일에 다음 내용 추가
GEMINI_API_KEY=your-gemini-api-key-here

# 예시 (실제 키는 더 깁니다)
GEMINI_API_KEY=AIzaSyBNO_your_actual_api_key_here
```

### 프로젝트 설정 확인

```bash
# 환경 변수 로드 확인
source .env
echo $GEMINI_API_KEY
```

---

## 🧪 API 테스트

### 1단계: 기본 연결 테스트

```bash
# API 키 유효성 테스트
curl -X GET \
  "https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json"
```

### 2단계: 텍스트 생성 테스트

```bash
# 간단한 텍스트 생성 테스트
curl -X POST \
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "안녕하세요! Gemini API 테스트입니다."
      }]
    }]
  }'
```

### 3단계: WonGram Shop 내부 테스트

1. 관리자 페이지 접속: `https://wongram.shop/admin`
2. AI 어시스턴트 패널에서 "리뷰 개요 생성" 테스트
3. 간단한 제품 정보 입력 후 생성 버튼 클릭

---

## 📊 사용량 모니터링

### Google AI Studio에서 확인

1. [Google AI Studio](https://aistudio.google.com/) 접속
2. **"Usage"** 또는 **"사용량"** 메뉴 클릭
3. API 호출 횟수 및 토큰 사용량 확인

### 일일 한도 설정

```bash
# Google Cloud Console에서 설정 가능
# 1. Cloud Console > APIs & Services > Quotas
# 2. Generative Language API 검색
# 3. 일일 요청 한도 설정
```

### 비용 관리

- **무료 티어**: 월 60회 요청 (2024년 기준)
- **유료 플랜**: 토큰당 과금 방식
- **예산 알림**: Google Cloud Console에서 설정 가능

---

## ❗ 사용량 제한

### 무료 티어 한도

| 항목 | 제한 |
|------|------|
| 월간 요청 | 60회 |
| 분당 요청 | 2회 |
| 일일 요청 | 무제한 |
| 토큰 제한 | 요청당 30,000 토큰 |

### 프로덕션 환경 권장사항

```env
# 프로덕션용 설정
GEMINI_MODEL=gemini-1.5-pro  # 더 나은 품질
GEMINI_MAX_TOKENS=2048       # 토큰 제한
GEMINI_TEMPERATURE=0.7       # 창의성 조절
```

---

## 🛠️ 문제 해결

### 일반적인 오류들

#### 1. API 키 오류

```
Error: API key not valid
```

**해결방법:**
1. API 키가 올바르게 복사되었는지 확인
2. .env 파일에 따옴표 없이 키 입력 확인
3. 환경 변수가 제대로 로드되었는지 확인

#### 2. 권한 오류

```
Error: The caller does not have permission
```

**해결방법:**
1. Google AI Studio에서 API 활성화 확인
2. Google Cloud Console에서 Generative Language API 활성화
3. 프로젝트 권한 재확인

#### 3. 사용량 한도 초과

```
Error: Quota exceeded
```

**해결방법:**
1. Google AI Studio에서 사용량 확인
2. 유료 플랜 업그레이드 고려
3. 캐싱 로직 구현으로 요청 수 줄이기

#### 4. 연결 오류

```
Error: Network error or timeout
```

**해결방법:**
1. 인터넷 연결 확인
2. 방화벽 설정 확인
3. Google 서비스 상태 확인

### WonGram Shop 특화 문제

#### AI 어시스턴트가 응답하지 않음

```bash
# 로그 확인
pm2 logs wongram-shop | grep -i gemini

# 환경 변수 확인
echo $GEMINI_API_KEY

# 서비스 재시작
pm2 restart wongram-shop
```

#### 한국어 응답 품질 개선

```javascript
// aiReviewAssistant.js에서 프롬프트 개선
const prompt = `
당신은 한국의 전문 제품 리뷰어입니다.
다음 제품에 대해 한국 소비자에게 도움이 되는 상세한 리뷰를 작성해주세요.

제품 정보: ${productData}

요구사항:
- 자연스러운 한국어 사용
- 구체적인 사용 후기 포함
- 가격 대비 가치 평가
- 쿠팡 구매자를 위한 팁
`;
```

---

## 📝 베스트 프랙티스

### 1. 프롬프트 최적화

```javascript
// 효과적인 프롬프트 작성
const systemPrompt = `
당신은 전문 제품 리뷰어입니다.
- 객관적이고 공정한 평가
- 구체적인 사용 경험 제공
- 다양한 사용자층 고려
- 한국 시장 특성 반영
`;
```

### 2. 에러 핸들링

```javascript
// 견고한 에러 처리
try {
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
} catch (error) {
    console.error('Gemini API 오류:', error);
    
    // 폴백 메시지 제공
    return "죄송합니다. AI 어시스턴트가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.";
}
```

### 3. 성능 최적화

```javascript
// 요청 캐싱으로 API 사용량 절약
const cache = new Map();

async function generateWithCache(prompt) {
    const cacheKey = hashPrompt(prompt);
    
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }
    
    const result = await geminiModel.generateContent(prompt);
    cache.set(cacheKey, result);
    
    return result;
}
```

---

## 🔄 마이그레이션 가이드 (OpenAI → Gemini)

### 코드 변경사항

1. **패키지 교체**
```bash
npm uninstall openai
npm install @google/generative-ai
```

2. **환경 변수 변경**
```bash
# 기존
OPENAI_API_KEY=sk-...

# 변경
GEMINI_API_KEY=AIza...
```

3. **API 호출 방식 변경**
```javascript
// 기존 (OpenAI)
const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }]
});

// 변경 (Gemini)
const result = await model.generateContent(prompt);
const response = result.response.text();
```

---

## 📞 지원 및 문의

### 공식 리소스

- **Google AI Studio**: [aistudio.google.com](https://aistudio.google.com/)
- **Gemini API 문서**: [ai.google.dev](https://ai.google.dev/)
- **Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com/)

### WonGram Shop 관련

- **프로젝트 이슈**: GitHub Issues
- **이메일 지원**: dldnjsrk@gmail.com
- **문서**: README.md 및 docs/ 폴더

---

## ✅ 체크리스트

배포 전 확인사항:

- [ ] Gemini API 키 발급 완료
- [ ] .env 파일에 API 키 설정
- [ ] API 연결 테스트 통과
- [ ] Google AI Studio에서 사용량 확인
- [ ] WonGram Shop AI 기능 테스트
- [ ] 에러 처리 로직 확인
- [ ] 사용량 모니터링 설정

---

**🎉 축하합니다! Google Gemini AI가 성공적으로 설정되었습니다.**

이제 WonGram Shop에서 강력한 AI 어시스턴트 기능을 사용할 수 있습니다. 리뷰 작성이 훨씬 쉬워질 거예요! 🚀