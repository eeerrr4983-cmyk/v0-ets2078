# 생기부AI - 사상고 학생 생활기록부 분석 시스템

한국 고등학생들을 위한 AI 기반 생기부(학교생활기록부) 분석 및 개선 플랫폼

## 🚀 주요 기능

### ✅ 완전히 구현된 기능

- **🤖 AI 생기부 분석** - Gemini 2.5 Flash-Exp 모델 사용
  - 2025년 교육부 훈령 제530호 기준 자동 검토
  - 금지/주의 사항 정밀 탐지
  - 강점/약점 분석 및 구체적 개선 제안
  - 종합 점수 산출 (0-100점)

- **📸 한국어 OCR** - OCR.space API 사용
  - 한국어 최적화 (OCR Engine 2)
  - 작은 글씨도 정확하게 추출
  - 다중 페이지 동시 처리
  - 겹친 카드 스타일 UI

- **🎓 대학 예측** - 실시간 AI 분석
  - 한국 대학 계층 기반 현실적 예측
  - 전국 백분위 계산
  - 도전/적정/안정 대학 추천

- **🔍 AI 작성 탐지** - 정밀 분석
  - OCR 추출 원본 텍스트 분석
  - AI/인간 작성 지표 제시
  - 위험도 평가 (안전/주의/위험/매우위험)
  - 구체적 개선 권장사항

- **💡 자율 과제 추천** - 맞춤형 프로젝트
  - 진로 연계 프로젝트 추천
  - 난이도 및 소요 기간 제시
  - 기대 효과 및 실행 팁

## 🔧 기술 스택

- **Frontend**: Next.js 15.5, React 19, TypeScript
- **UI**: Tailwind CSS 4.1, Framer Motion, Radix UI
- **AI**: Google Gemini 2.5 Flash-Exp API
- **OCR**: OCR.space API (Korean Optimized)
- **State**: React Context API
- **Storage**: Browser LocalStorage & SessionStorage

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install --legacy-peer-deps

# 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열고 API 키를 입력하세요

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 🔑 환경 변수

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```bash
# Google Gemini 2.5 Flash-Lite API key
GEMINI_API_KEY=your_gemini_api_key_here

# OCR.space API key (Korean optimized)
OCR_SPACE_API_KEY=your_ocr_space_api_key_here
```

## 🎯 주요 API 엔드포인트

- `/api/ocr` - 이미지에서 텍스트 추출 (OCR.space)
- `/api/analyze` - 생기부 정밀 분석 (Gemini)
- `/api/detect` - AI 작성 탐지 (Gemini)
- `/api/university` - 대학 예측 (Gemini)
- `/api/projects` - 자율 과제 추천 (Gemini)

## 📱 사용 방법

### 1. 생기부 업로드
- 홈 화면에서 "파일 업로드" 버튼 클릭
- 생기부 이미지 선택 (여러 장 가능)
- 진로 방향 입력 (선택사항)

### 2. AI 분석
- OCR이 자동으로 텍스트 추출
- AI가 실시간으로 생기부 분석
- 종합 점수 및 상세 분석 결과 확인

### 3. 추가 기능
- **AI 작성 탐지**: 선생님의 AI 사용 여부 확인
- **대학 예측**: 지원 가능한 대학 추천
- **자율 과제 추천**: 맞춤형 프로젝트 제안
- **결과 다운로드**: 분석 결과를 텍스트 파일로 저장

## 🔐 보안 및 개인정보

- 모든 API 호출은 서버 사이드에서 처리
- API 키는 환경 변수로 관리
- 개인 정보는 브라우저 로컬에만 저장
- 비공개 모드로 결과 저장 가능

## 📊 성능 지표

- **OCR 추출**: 2-5초 (이미지당)
- **AI 분석**: 5-10초
- **AI 작성 탐지**: 3-7초
- **대학 예측**: 3-5초
- **프로젝트 추천**: 3-5초
- **OCR 한국어 정확도**: 95%+ (고품질 이미지)

## 🐛 트러블슈팅

### OCR 실패 시
- API 키 확인
- 이미지 형식 확인 (JPG, PNG 권장)
- 이미지 해상도 증가

### Gemini API 오류
- API 키 유효성 확인
- 할당량 확인 (무료 티어 제한)
- 잠시 후 재시도

## 📝 개발 히스토리

### v1.0.0 (2025-10-25)
- ✅ Gemini 2.5 Flash-Exp 모델로 업그레이드
- ✅ 실제 API 통합 완료 (모든 모킹 데이터 제거)
- ✅ OCR.space 한국어 최적화
- ✅ AI 작성 탐지 실제 분석 구현
- ✅ 대학 예측 한국 데이터 기반 개선
- ✅ 자율 과제 추천 시스템 구현
- ✅ 에러 핸들링 및 fallback 메커니즘 강화

## 📧 문의

프로젝트 관련 문의: [GitHub Issues](https://github.com/eeerrr4983-cmyk/v0-ets2078/issues)

## 📄 라이선스

이 프로젝트는 교육 목적으로 개발되었습니다.
