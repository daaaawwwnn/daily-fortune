"use client";

import { useEffect, useState, useTransition } from "react";
import FortuneCard from "./FortuneCard";
import HistoryTable from "./HistoryTable";
import { buildEntry, getClientId, type HistoryEntry } from "./history";
import { clearHistory, fetchHistory, insertHistory } from "./actions";
import { FORTUNE_DRAWN_EVENT } from "./TodayCounter";

export default function FortuneBoard() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [clientId, setClientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // 최초 마운트 시 client_id를 확보하고 Supabase에서 기록을 불러옵니다.
  useEffect(() => {
    const id = getClientId();
    setClientId(id);
    fetchHistory(id)
      .then(setHistory)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "기록을 불러오지 못했습니다."),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleDraw: React.ComponentProps<typeof FortuneCard>["onDraw"] = (
    fortune,
    extra,
  ) => {
    if (!clientId) return;
    const entry = buildEntry(fortune, extra);
    setError(null);
    // 낙관적 업데이트: 화면에 먼저 반영
    setHistory((prev) => [entry, ...prev]);
    startTransition(async () => {
      try {
        const next = await insertHistory(clientId, entry);
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
    if (!clientId) return;
    const prev = history;
    setError(null);
    setHistory([]);
    startTransition(async () => {
      try {
        await clearHistory(clientId);
        // 내 오늘 기록이 사라지면 참여자 수도 달라질 수 있으니 갱신
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
