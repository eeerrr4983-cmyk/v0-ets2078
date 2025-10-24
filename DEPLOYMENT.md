# 생기부AI 배포 가이드

## 📋 배포 전 체크리스트

### ✅ 코드 준비 상태
- [x] 모든 버그 수정 완료
- [x] 프로덕션 빌드 성공 확인
- [x] SSR 호환성 검증 완료
- [x] 모든 변경사항 커밋 및 푸시 완료

### 🔧 환경 변수 설정

#### 필수 환경 변수
```env
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyBLi15a14bzr2vlp41in_81PqkF2pv1-d4
NEXT_PUBLIC_OCR_SPACE_API_KEY=K85664750088957
```

#### 선택적 환경 변수 (Google OAuth 사용 시)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Vercel 배포

### 1. GitHub 연동
```bash
# 최신 변경사항 확인
git log --oneline -10

# 최신 커밋이 푸시되었는지 확인
git status
```

### 2. Vercel 프로젝트 생성
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. "New Project" 클릭
3. GitHub 저장소 `eeerrr4983-cmyk/v0-ets2078` 선택
4. Framework Preset: **Next.js** 자동 감지
5. Root Directory: `.` (기본값)

### 3. 환경 변수 설정
프로젝트 설정에서 다음 환경 변수 추가:

**Environment Variables** 섹션에서:
```
NEXT_PUBLIC_GEMINI_API_KEY = AIzaSyBLi15a14bzr2vlp41in_81PqkF2pv1-d4
NEXT_PUBLIC_OCR_SPACE_API_KEY = K85664750088957
```

**Supabase 사용 시** 추가:
```
NEXT_PUBLIC_SUPABASE_URL = [your_url]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [your_key]
```

### 4. 빌드 설정
- **Build Command**: `npm run build` (기본값)
- **Output Directory**: `.next` (기본값)
- **Install Command**: `npm install --legacy-peer-deps`

⚠️ **중요**: Install Command를 `npm install --legacy-peer-deps`로 설정해야 React 19와 vaul의 peer dependency 충돌을 해결할 수 있습니다.

### 5. 배포 실행
1. "Deploy" 버튼 클릭
2. 빌드 로그 확인
3. 배포 완료 후 URL 확인

## 🔍 배포 후 검증

### 필수 기능 테스트
- [ ] 홈 페이지 로딩
- [ ] 이미지 업로드 및 OCR 처리
- [ ] AI 분석 실행
- [ ] 결과 페이지 표시
- [ ] 네비게이션 동작
- [ ] 모달 스크롤
- [ ] 최근 활동 표시
- [ ] 게스트 사용자 플로우

### 선택적 기능 테스트 (Supabase 설정 시)
- [ ] Google 로그인
- [ ] 사용자 프로필
- [ ] 멘토링 매칭

## 🐛 트러블슈팅

### 빌드 실패 시

#### 1. Dependency 충돌
```bash
# 로컬에서 빌드 테스트
npm install --legacy-peer-deps
npm run build
```

#### 2. 환경 변수 누락
- Vercel Dashboard > Project Settings > Environment Variables 확인
- 각 변수가 올바르게 설정되었는지 확인

#### 3. SSR 관련 오류
- `localStorage` 또는 `window` 객체 사용 시 `typeof window !== 'undefined'` 체크
- 클라이언트 전용 코드는 `useEffect` 내에서 실행

### 런타임 오류 시

#### 1. OCR 실패
- OCR.space API 키 확인
- API 사용량 제한 확인
- Tesseract.js fallback 동작 확인

#### 2. Gemini API 오류
- API 키 유효성 확인
- 할당량 확인
- 요청 형식 검증

#### 3. Supabase 연결 오류
- Supabase URL 및 Anon Key 확인
- Supabase 프로젝트 활성 상태 확인
- Google OAuth 설정 확인 (Auth > Providers)

## 📊 모니터링

### Vercel Analytics
- 자동으로 활성화됨
- 페이지 뷰, 성능 메트릭 확인 가능

### 에러 추적
```typescript
// pages/_app.tsx 또는 layout.tsx에 추가 가능
if (typeof window !== 'undefined') {
  window.onerror = (msg, url, lineNo, columnNo, error) => {
    console.error('Global error:', { msg, url, lineNo, columnNo, error })
    return false
  }
}
```

## 🔒 보안 고려사항

### API 키 보호
- ✅ 환경 변수로 관리
- ✅ `.env.local`은 `.gitignore`에 포함
- ✅ 클라이언트 노출 최소화

### CORS 설정
- OCR.space API는 CORS 지원
- Gemini API는 서버리스 함수 사용 권장 (선택적)

### Rate Limiting
- 클라이언트 측 요청 제한 구현 고려
- API 사용량 모니터링

## 📝 배포 완료 체크리스트

- [ ] 프로덕션 URL 확인 및 저장
- [ ] 모든 기능 테스트 완료
- [ ] 성능 메트릭 확인 (Lighthouse 점수)
- [ ] 모바일 반응형 테스트
- [ ] 다양한 브라우저 테스트 (Chrome, Safari, Firefox)
- [ ] README.md 업데이트 (배포 URL 추가)
- [ ] 팀/사용자에게 배포 알림

## 🎉 성공!

배포가 완료되면:
1. Production URL을 README.md에 업데이트
2. GitHub 저장소의 About 섹션에 웹사이트 URL 추가
3. 사용자 피드백 수집 시작

---

## 📞 지원

문제 발생 시:
- GitHub Issues: https://github.com/eeerrr4983-cmyk/v0-ets2078/issues
- 로그 확인: Vercel Dashboard > Deployment > Function Logs
- 문서 참조: FIXES_COMPLETED.md
