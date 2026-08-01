"use client";

import { useCallback, useEffect, useState } from "react";
import { countTodayDrawers } from "./actions";
import { getTodayRange } from "./history";

// 운세를 뽑거나 기록을 지웠을 때 이 이벤트로 카운터를 갱신합니다.
export const FORTUNE_DRAWN_EVENT = "fortune:drawn";

export default function TodayCounter() {
  const [count, setCount] = useState<number | null>(null);

  const refresh = useCallback(() => {
    const { startISO, endISO } = getTodayRange();
    countTodayDrawers(startISO, endISO)
      .then(setCount)
      .catch(() => {
        /* 카운트는 부가 정보라 실패해도 조용히 무시 */
      });
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(FORTUNE_DRAWN_EVENT, refresh);
    return () => window.removeEventListener(FORTUNE_DRAWN_EVENT, refresh);
  }, [refresh]);

  return (
    <div className="flex items-center gap-2 rounded-full border border-amber-300/30 bg-indigo-950/50 px-4 py-1.5 text-sm text-indigo-100/90 shadow">
      <span aria-hidden>🔥</span>
      <span>
        오늘{" "}
        <span className="font-bold text-amber-200">
          {count === null ? "–" : count.toLocaleString("ko-KR")}
        </span>
        명이 운세를 뽑았어요
      </span>
    </div>
  );
}
