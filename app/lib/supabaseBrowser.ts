import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트.
// publishable(anon) key를 사용하며, 세션을 쿠키에 저장해 서버에서도 읽을 수 있게 합니다.
let client: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  if (client) return client;
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  return client;
}
