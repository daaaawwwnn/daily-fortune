"use server";

import { getSupabaseAdmin } from "./lib/supabaseServer";
import type { HistoryEntry } from "./history";

const TABLE = "fortune_history";
const MAX_ENTRIES = 100;

type Row = {
  drawn_at: string;
  message: string;
  lucky_item: string;
  lucky_color: string;
  lucky_number: number;
  direction: string;
  score: number;
};

function rowToEntry(row: Row): HistoryEntry {
  return {
    drawnAt: row.drawn_at,
    message: row.message,
    luckyItem: row.lucky_item,
    luckyColor: row.lucky_color,
    luckyNumber: row.lucky_number,
    direction: row.direction,
    score: row.score,
  };
}

const SELECT_COLS =
  "drawn_at, message, lucky_item, lucky_color, lucky_number, direction, score";

// 특정 브라우저(client_id)의 운세 기록을 최신순으로 가져옵니다.
export async function fetchHistory(clientId: string): Promise<HistoryEntry[]> {
  if (!clientId) return [];
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT_COLS)
    .eq("client_id", clientId)
    .order("drawn_at", { ascending: false })
    .limit(MAX_ENTRIES);

  if (error) throw new Error(`운세 기록을 불러오지 못했습니다: ${error.message}`);
  return (data ?? []).map(rowToEntry);
}

// 새 운세 기록을 저장하고, 갱신된 목록(최신순)을 반환합니다.
export async function insertHistory(
  clientId: string,
  entry: HistoryEntry,
): Promise<HistoryEntry[]> {
  if (!clientId) throw new Error("client_id가 없습니다.");
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(TABLE).insert({
    client_id: clientId,
    drawn_at: entry.drawnAt,
    message: entry.message,
    lucky_item: entry.luckyItem,
    lucky_color: entry.luckyColor,
    lucky_number: entry.luckyNumber,
    direction: entry.direction,
    score: entry.score,
  });

  if (error) throw new Error(`운세 기록 저장에 실패했습니다: ${error.message}`);
  return fetchHistory(clientId);
}

// 특정 브라우저(client_id)의 모든 운세 기록을 삭제합니다.
export async function clearHistory(clientId: string): Promise<HistoryEntry[]> {
  if (!clientId) return [];
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(TABLE).delete().eq("client_id", clientId);
  if (error) throw new Error(`운세 기록 삭제에 실패했습니다: ${error.message}`);
  return [];
}
