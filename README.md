# 생기부AI (SeongibuAI)

> 학생 생활기록부를 AI로 분석하고 개선하는 혁신적인 웹 애플리케이션

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 📖 소개

생기부AI는 대한민국 교육부의 2025년 학교생활기록부 작성 지침을 기반으로, 생기부의 금지 및 주의 사항을 자동으로 탐지하고 개선 방안을 제시하는 AI 기반 웹 애플리케이션입니다.

### 주요 기능

- 🔍 **OCR 텍스트 추출**: OCR.space API를 활용한 고품질 텍스트 인식
- 🤖 **AI 분석**: Gemini 2.5 Flash-Lite를 사용한 정밀한 생기부 분석
- 📊 **실시간 결과**: 강점, 개선점, 오류를 한눈에 확인
- 👥 **AI 멘토링**: 진로가 비슷한 학생 간 멘토링 매칭
- 📱 **최근 활동**: 과거 분석 내역 빠른 접근
- 🔐 **Google 로그인**: Supabase 기반 안전한 인증

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 18.0 이상
- pnpm (권장) 또는 npm

### 설치

```bash
# 저장소 클론
git clone https://github.com/eeerrr4983-cmyk/v0-ets2078.git
cd v0-ets2078

# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 API 키 입력

# 개발 서버 실행
pnpm dev
```

애플리케이션이 http://localhost:3000 에서 실행됩니다.

## ⚙️ 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_OCR_SPACE_API_KEY=your_ocr_space_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

자세한 설정 방법은 [SETUP.md](./SETUP.md)를 참조하세요.

## 🏗️ 기술 스택

### 프론트엔드
- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion
- **UI Components**: Radix UI

### 백엔드 & 서비스
- **AI**: Google Gemini 2.5 Flash-Lite
- **OCR**: OCR.space API
- **Authentication**: Supabase Auth (Google OAuth)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage

### 개발 도구
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Formatting**: Prettier (내장)

## 📂 프로젝트 구조

```
v0-ets2078/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 홈 페이지
│   ├── results/           # 분석 결과 페이지
│   └── explore/           # 탐색 페이지
├── components/            # React 컴포넌트
│   ├── ui/               # UI 기본 컴포넌트
│   ├── navigation.tsx    # 네비게이션 바
│   └── ai-mentoring.tsx  # AI 멘토링 시스템
├── lib/                   # 유틸리티 및 서비스
│   ├── gemini-service.ts # Gemini AI 서비스
│   ├── ocr-service.ts    # OCR 서비스
│   ├── auth-context.tsx  # 인증 컨텍스트
│   └── storage.ts        # 로컬 스토리지 관리
├── public/               # 정적 파일
└── styles/               # 글로벌 스타일

```

## 🎯 주요 기능 상세

### 1. OCR 텍스트 추출
- OCR.space API를 사용한 한국어 텍스트 인식
- Tesseract.js fallback 지원
- 실시간 진행률 표시

### 2. AI 생기부 분석
- 2025년 교육부 훈령 제530호 기준 준수
- 금지 및 주의 사항 자동 탐지
- 구체적인 개선 방안 제시

### 3. 최근 활동
- 최근 3개 분석 결과 표시
- 스마트 시간 표시 (오늘, 어제, 날짜)
- 원클릭 빠른 접근

### 4. AI 멘토링 매칭
- 진로 목표 기반 학생 매칭
- 실시간 알림 시스템
- 채팅방 기능 (준비 중)

## 🔧 개발

### 스크립트

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린트 검사
pnpm lint
```

### 코드 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 글

- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI 분석 엔진
- [OCR.space](https://ocr.space/) - OCR 서비스 제공
- [Supabase](https://supabase.com/) - 백엔드 인프라
- [Vercel](https://vercel.com/) - 호스팅 플랫폼

## 📧 문의

문제가 발생하거나 제안 사항이 있으시면 [Issue](https://github.com/eeerrr4983-cmyk/v0-ets2078/issues)를 생성해주세요.

---

**Made with ❤️ for Korean Students**
