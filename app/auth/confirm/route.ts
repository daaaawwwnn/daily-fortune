import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { getSupabaseServer } from "../../lib/supabaseServerClient";

// 이메일 확인 링크가 도착하는 경로.
// token_hash를 검증해 세션(쿠키)을 생성한 뒤 홈으로 이동시킵니다.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "/";
  // 오픈 리다이렉트 방지: 내부 경로만 허용
  const next = nextParam.startsWith("/") ? nextParam : "/";

  if (token_hash && type) {
    const supabase = await getSupabaseServer();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      redirect(next); // 성공: 세션 쿠키가 설정된 채 홈으로
    }
  }

  redirect("/?auth_error=confirm"); // 실패/유효하지 않은 링크
}
