import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

// 서버(서버 액션/컴포넌트)에서 "현재 로그인한 사용자"를 확인하기 위한 클라이언트.
// publishable key + 사용자의 세션 쿠키를 사용합니다. (DB 쓰기는 admin 클라이언트가 담당)
export async function getSupabaseServer(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 서버 컴포넌트에서 호출되면 쿠키를 쓸 수 없습니다.
            // 세션 갱신은 proxy.ts가 담당하므로 무시해도 안전합니다.
          }
        },
      },
    },
  );
}
