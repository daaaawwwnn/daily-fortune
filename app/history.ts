import type { Fortune } from "./fortunes";

export type HistoryEntry = {
  // 뽑은 시각 (ISO 문자열)
  drawnAt: string;
  message: string;
  luckyItem: string;
  luckyColor: string;
  luckyNumber: number;
  direction: string;
  score: number;
};

const STORAGE_KEY = "fortune-history";
const MAX_ENTRIES = 100;

// localStorage에서 운세 기록을 읽어옵니다. (최신순으로 저장되어 있음)
export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

// 새 운세 기록을 맨 앞(최신)에 추가한 뒤 저장하고, 갱신된 목록을 반환합니다.
export function addHistoryEntry(
  fortune: Fortune,
  extra: { direction: string; score: number },
): HistoryEntry[] {
  const entry: HistoryEntry = {
    drawnAt: new Date().toISOString(),
    message: fortune.message,
    luckyItem: fortune.luckyItem,
    luckyColor: fortune.luckyColor,
    luckyNumber: fortune.luckyNumber,
    direction: extra.direction,
    score: extra.score,
  };
  const next = [entry, ...loadHistory()].slice(0, MAX_ENTRIES);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 저장 실패(용량 초과 등)는 조용히 무시합니다.
    }
  }
  return next;
}

// 모든 운세 기록을 삭제합니다.
export function clearHistory(): HistoryEntry[] {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 무시
    }
  }
  return [];
}

// 뽑은 시각을 한국어 형식으로 표시합니다.
export function formatDrawnAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
