"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "./lib/supabaseBrowser";
import { useAuth } from "./AuthProvider";

export default function AuthBar() {
  const { user, ready } = useAuth();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await getSupabaseBrowser().auth.signOut();
  };

  return (
    <div className="flex w-full max-w-3xl items-center justify-end gap-3 text-sm">
      {!ready ? null : user ? (
        <>
          <span className="text-indigo-200/80">
            <span className="font-semibold text-amber-200">{user.email}</span> 님
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-indigo-400/40 px-3 py-1 text-indigo-100/90 transition hover:bg-indigo-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
          >
            로그아웃
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-amber-300/50 bg-amber-300/10 px-3 py-1 font-medium text-amber-100 transition hover:bg-amber-300/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
        >
          로그인 / 회원가입
        </button>
      )}

      {open && <AuthModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const supabase = getSupabaseBrowser();

  const signIn = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : error.message === "Email not confirmed"
            ? "이메일 인증이 필요합니다. 받은 메일의 링크를 확인해주세요."
            : error.message,
      );
      return;
    }
    onClose(); // 로그인 성공 시 모달 닫기 (상태는 AuthProvider가 반영)
  };

  const signUp = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      onClose(); // 이메일 인증이 꺼져 있으면 즉시 로그인됨
    } else {
      setInfo("확인 메일을 보냈어요. 메일의 링크를 눌러 인증을 완료해주세요.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-indigo-400/30 bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-amber-200">로그인 / 회원가입</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-indigo-200/60 hover:text-indigo-100"
          >
            ✕
          </button>
        </div>

        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            signIn();
          }}
        >
          <input
            type="email"
            required
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-indigo-400/30 bg-slate-800 px-3 py-2 text-sm text-indigo-50 placeholder:text-indigo-300/40 focus:border-amber-300/60 focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-indigo-400/30 bg-slate-800 px-3 py-2 text-sm text-indigo-50 placeholder:text-indigo-300/40 focus:border-amber-300/60 focus:outline-none"
          />

          {error && <p className="text-sm text-red-300">⚠️ {error}</p>}
          {info && <p className="text-sm text-emerald-300">✅ {info}</p>}

          <div className="mt-1 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 disabled:opacity-50"
            >
              {loading ? "처리 중…" : "로그인"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={signUp}
              className="flex-1 rounded-lg border border-amber-300/50 px-3 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/10 disabled:opacity-50"
            >
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
