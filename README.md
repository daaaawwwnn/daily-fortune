# 🔮 오늘의 운세 (Daily Fortune)

카드를 뒤집으면 랜덤 운세와 행운의 아이템이 나오는 Next.js 앱입니다.

**🌐 라이브:** https://daily-fortune-dusky.vercel.app

## 기능

- 카드 뒤집기 애니메이션으로 오늘의 운세 확인
- 행운의 아이템 · 색 · 숫자 · 방향, 오늘의 운세 지수(게이지)
- **내 운세 기록** — 뽑은 시각과 운세를 Supabase에 저장하고 최신순 표로 표시
- 메인 상단에 **오늘 운세를 뽑은 사람 수**(오늘 기록의 고유 방문자 수) 표시

## 기술 스택

- [Next.js 16](https://nextjs.org) (App Router, Server Actions) · React 19
- [Tailwind CSS v4](https://tailwindcss.com)
- [Supabase](https://supabase.com) (Postgres) — 운세 기록 저장
- 배포: [Vercel](https://vercel.com)

## 로컬 실행

```bash
npm install
npm run dev
```

http://localhost:3000 접속.

### 환경변수

프로젝트 루트에 `.env` 파일을 만들고 아래 값을 채웁니다 (`.gitignore`로 커밋 제외됨).

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...   # 서버 전용, 절대 클라이언트에 노출 금지
```

### 데이터베이스

[`supabase/schema.sql`](supabase/schema.sql)을 Supabase SQL Editor에서 한 번 실행하면 `fortune_history` 테이블이 생성됩니다. RLS가 켜져 있고 공개 정책이 없어, DB 접근은 오직 서버 액션(secret key)을 통해서만 이루어집니다.

## 아키텍처 메모

- 모든 DB 접근은 `app/actions.ts`의 Server Action에서만 수행하며, secret key는 서버에만 존재합니다.
- 인증 없이 "내 기록"을 구분하기 위해 브라우저별 익명 `client_id`(localStorage UUID)를 사용합니다.
