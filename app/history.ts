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

const CLIENT_ID_KEY = "fortune-client-id";

// 브라우저별 익명 식별자. 인증 없이 "내 기록"을 구분하기 위해 사용합니다.
// (localStorage에 한 번 생성해 재사용)
export function getClientId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
  } catch {
    // localStorage 사용 불가 시 임시 id (기록이 유지되지 않을 수 있음)
    return crypto.randomUUID();
  }
}

// 뽑은 운세로부터 저장용 기록 항목을 만듭니다. (시각은 뽑은 순간의 로컬 시간)
export function buildEntry(
  fortune: Fortune,
  extra: { direction: string; score: number },
): HistoryEntry {
  return {
    drawnAt: new Date().toISOString(),
    message: fortune.message,
    luckyItem: fortune.luckyItem,
    luckyColor: fortune.luckyColor,
    luckyNumber: fortune.luckyNumber,
    direction: extra.direction,
    score: extra.score,
  };
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
