"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "./lib/supabaseBrowser";
import { getClientId } from "./history";
import { claimAnonymousHistory } from "./actions";

type AuthContextValue = {
  user: User | null;
  // 기록 소유자 식별자: 로그인 시 user.id, 비로그인 시 브라우저 익명 id
  identity: string;
  ready: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  identity: "",
  ready: false,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [anonId, setAnonId] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const id = getClientId();
    setAnonId(id);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // 로그인 순간, 그동안 익명으로 쌓은 기록을 계정으로 이전
      if (event === "SIGNED_IN") {
        try {
          await claimAnonymousHistory(id);
        } catch {
          /* 이전 실패는 치명적이지 않으므로 무시 */
        }
      }
      setUser(session?.user ?? null);
      setReady(true);
      // 상단 참여자 수 등 갱신 (FortuneBoard/TodayCounter가 구독)
      window.dispatchEvent(new Event("fortune:drawn"));
    });

    return () => subscription.unsubscribe();
  }, []);

  const identity = user?.id ?? anonId;

  return (
    <AuthContext.Provider value={{ user, identity, ready }}>
      {children}
    </AuthContext.Provider>
  );
}
