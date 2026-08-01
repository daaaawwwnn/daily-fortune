-- 오늘의 운세: 운세 기록 테이블
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요. (한 번만)

create table if not exists public.fortune_history (
  id           bigint generated always as identity primary key,
  client_id    text        not null,           -- 브라우저별 익명 식별자
  drawn_at     timestamptz not null default now(),
  message      text        not null,
  lucky_item   text        not null,
  lucky_color  text        not null,
  lucky_number integer     not null,
  direction    text        not null,
  score        integer     not null,
  created_at   timestamptz not null default now()
);

-- client_id + 최신순 조회 최적화
create index if not exists fortune_history_client_drawn_idx
  on public.fortune_history (client_id, drawn_at desc);

-- RLS 활성화. 공개 정책을 만들지 않으므로 publishable(anon) 키로는 접근 불가.
-- 접근은 오직 서버(secret key, RLS 우회)를 통한 Next.js 서버 액션으로만 이루어집니다.
alter table public.fortune_history enable row level security;
