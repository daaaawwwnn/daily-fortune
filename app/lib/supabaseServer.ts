import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 서버 전용 Supabase 클라이언트.
// secret key를 사용하므로 절대 클라이언트 컴포넌트에서 import 하지 마세요.
// (오직 "use server" 파일(app/actions.ts)에서만 사용)

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Supabase 환경변수가 없습니다. .env 파일에 NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SECRET_KEY 를 설정하세요.",
    );
  }

  cached = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
