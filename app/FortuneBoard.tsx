"use client";

import { useEffect, useState } from "react";
import FortuneCard from "./FortuneCard";
import HistoryTable from "./HistoryTable";
import {
  addHistoryEntry,
  clearHistory,
  loadHistory,
  type HistoryEntry,
} from "./history";

export default function FortuneBoard() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // 최초 마운트 시 localStorage에서 기록을 불러옵니다. (하이드레이션 불일치 방지)
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  return (
    <>
      <FortuneCard
        onDraw={(fortune, extra) => {
          setHistory(addHistoryEntry(fortune, extra));
        }}
      />
      <HistoryTable
        entries={history}
        onClear={() => setHistory(clearHistory())}
      />
    </>
  );
}
