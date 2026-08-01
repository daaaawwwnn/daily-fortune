"use client";

import { useEffect, useState, useTransition } from "react";
import FortuneCard from "./FortuneCard";
import HistoryTable from "./HistoryTable";
import { buildEntry, getClientId, type HistoryEntry } from "./history";
import { clearHistory, fetchHistory, insertHistory } from "./actions";
import { FORTUNE_DRAWN_EVENT } from "./TodayCounter";
import { useAuth } from "./AuthProvider";

export default function FortuneBoard() {
  const { identity, ready } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // 로그인 상태(identity)가 정해지거나 바뀌면(로그인/로그아웃) 해당 소유자의 기록을 불러옵니다.
  useEffect(() => {
    if (!ready || !identity) return;
    setLoading(true);
    fetchHistory(getClientId())
      .then(setHistory)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "기록을 불러오지 못했습니다."),
      )
      .finally(() => setLoading(false));
  }, [identity, ready]);

  const handleDraw: React.ComponentProps<typeof FortuneCard>["onDraw"] = (
    fortune,
    extra,
  ) => {
    const entry = buildEntry(fortune, extra);
    setError(null);
    // 낙관적 업데이트: 화면에 먼저 반영
    setHistory((prev) => [entry, ...prev]);
    startTransition(async () => {
      try {
        const next = await insertHistory(getClientId(), entry);
        setHistory(next);
        // 상단 "오늘 뽑은 사람 수" 갱신
        window.dispatchEvent(new Event(FORTUNE_DRAWN_EVENT));
      } catch (e: unknown) {
        // 저장 실패 시 낙관적 항목을 되돌립니다.
        setHistory((prev) => prev.filter((h) => h !== entry));
        setError(e instanceof Error ? e.message : "기록 저장에 실패했습니다.");
      }
    });
  };

  const handleClear = () => {
    const prev = history;
    setError(null);
    setHistory([]);
    startTransition(async () => {
      try {
        await clearHistory(getClientId());
        window.dispatchEvent(new Event(FORTUNE_DRAWN_EVENT));
      } catch (e: unknown) {
        setHistory(prev);
        setError(e instanceof Error ? e.message : "기록 삭제에 실패했습니다.");
      }
    });
  };

  return (
    <>
      <FortuneCard onDraw={handleDraw} />
      <HistoryTable
        entries={history}
        onClear={handleClear}
        loading={loading}
        error={error}
      />
    </>
  );
}
