# 생기부AI 설정 가이드

이 문서는 생기부AI 애플리케이션을 로컬 환경에서 실행하고 배포하기 위한 단계별 가이드입니다.

## 목차
1. [환경 변수 설정](#환경-변수-설정)
2. [Supabase 설정](#supabase-설정)
3. [로컬 개발 환경 실행](#로컬-개발-환경-실행)
4. [배포](#배포)

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# Gemini API Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# OCR.space API Configuration  
NEXT_PUBLIC_OCR_SPACE_API_KEY=your_ocr_space_api_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

## Supabase 설정

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 계정 생성
2. 새 프로젝트 생성
3. Project Settings > API에서 다음 정보 복사:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. 데이터베이스 스키마 설정

Supabase SQL Editor에서 다음 테이블들을 생성하세요:

#### Users 테이블
```sql
-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  display_name text,
  student_id text,
  career_goal text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
```

#### Analysis Results 테이블
```sql
-- Analysis results table
create table public.analysis_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  student_name text,
  overall_score integer,
  career_direction text,
  strengths jsonb,
  errors jsonb,
  recommendations jsonb,
  is_private boolean default true,
  likes integer default 0,
  saves integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.analysis_results enable row level security;

-- Policies
create policy "Users can view own results"
  on public.analysis_results for select
  using (auth.uid() = user_id or is_private = false);

create policy "Users can insert own results"
  on public.analysis_results for insert
  with check (auth.uid() = user_id);

create policy "Users can update own results"
  on public.analysis_results for update
  using (auth.uid() = user_id);
```

#### Notifications 테이블
```sql
-- Notifications table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null,
  from_user_id uuid references public.profiles(id),
  from_user_name text,
  message text not null,
  read boolean default false,
  chat_room_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);
```

### 3. Google OAuth 설정

1. Supabase Dashboard > Authentication > Providers
2. Google 활성화
3. [Google Cloud Console](https://console.cloud.google.com)에서:
   - 새 프로젝트 생성
   - APIs & Services > Credentials
   - OAuth 2.0 Client ID 생성
   - Authorized redirect URIs에 추가:
     - `https://your-project.supabase.co/auth/v1/callback`
4. Client ID와 Client Secret을 Supabase에 입력

## 로컬 개발 환경 실행

### 의존성 설치
```bash
pnpm install
```

### 개발 서버 시작
```bash
pnpm dev
```

애플리케이션이 http://localhost:3000 에서 실행됩니다.

## 배포

### Vercel 배포

1. [Vercel](https://vercel.com) 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정:
   - `NEXT_PUBLIC_GEMINI_API_KEY`
   - `NEXT_PUBLIC_OCR_SPACE_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (배포 URL)
4. Deploy 클릭

### 환경 변수 업데이트

배포 후 Supabase의 Redirect URL을 업데이트하세요:
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://your-app.vercel.app`

## 기능 설명

### 주요 기능
- **OCR 텍스트 추출**: OCR.space API를 사용한 고품질 텍스트 추출
- **AI 분석**: Gemini 2.5 Flash-Lite를 사용한 생기부 분석
- **최근 활동**: 사용자의 최근 분석 내역 표시
- **AI 멘토링**: 학생 간 멘토링 매칭 시스템
- **Google 로그인**: Supabase를 통한 Google OAuth 인증

### API 사용량

- **Gemini API**: 무료 tier에서 분당 60 requests
- **OCR.space API**: 무료 tier에서 하루 25,000 requests

## 문제 해결

### Supabase 연결 오류
- `.env.local` 파일의 환경 변수가 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- API 키가 올바르게 복사되었는지 확인

### OCR 오류
- 이미지 파일 크기가 너무 큰 경우 압축 필요
- API 키가 유효한지 확인
- 일일 사용량 제한 확인

### Google 로그인 실패
- Redirect URI가 올바르게 설정되었는지 확인
- Google Cloud Console에서 프로젝트가 활성화되어 있는지 확인

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
