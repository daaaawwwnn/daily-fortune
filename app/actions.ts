"use server";

import { getSupabaseAdmin } from "./lib/supabaseServer";
import { getSupabaseServer } from "./lib/supabaseServerClient";
import { generateAiFortune, type AiFortune } from "./lib/openrouter";
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

// 기록의 소유자를 정합니다.
// 로그인한 사용자면 세션에서 검증된 user.id를, 아니면 브라우저의 익명 id를 사용합니다.
// (클라이언트가 남의 user.id를 위조할 수 없도록 항상 세션을 우선합니다.)
async function resolveOwnerId(anonId: string): Promise<string> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? anonId;
}

// 현재 소유자(로그인 사용자 또는 익명)의 운세 기록을 최신순으로 가져옵니다.
export async function fetchHistory(anonId: string): Promise<HistoryEntry[]> {
  const ownerId = await resolveOwnerId(anonId);
  if (!ownerId) return [];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT_COLS)
    .eq("client_id", ownerId)
    .order("drawn_at", { ascending: false })
    .limit(MAX_ENTRIES);

  if (error) throw new Error(`운세 기록을 불러오지 못했습니다: ${error.message}`);
  return (data ?? []).map(rowToEntry);
}

// 새 운세 기록을 저장하고, 갱신된 목록(최신순)을 반환합니다.
export async function insertHistory(
  anonId: string,
  entry: HistoryEntry,
): Promise<HistoryEntry[]> {
  const ownerId = await resolveOwnerId(anonId);
  if (!ownerId) throw new Error("소유자를 확인할 수 없습니다.");

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(TABLE).insert({
    client_id: ownerId,
    drawn_at: entry.drawnAt,
    message: entry.message,
    lucky_item: entry.luckyItem,
    lucky_color: entry.luckyColor,
    lucky_number: entry.luckyNumber,
    direction: entry.direction,
    score: entry.score,
  });

  if (error) throw new Error(`운세 기록 저장에 실패했습니다: ${error.message}`);
  return fetchHistory(anonId);
}

// 현재 소유자의 모든 운세 기록을 삭제합니다.
export async function clearHistory(anonId: string): Promise<HistoryEntry[]> {
  const ownerId = await resolveOwnerId(anonId);
  if (!ownerId) return [];

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(TABLE).delete().eq("client_id", ownerId);
  if (error) throw new Error(`운세 기록 삭제에 실패했습니다: ${error.message}`);
  return [];
}

// 로그인 시, 그동안 익명(anonId)으로 쌓은 기록을 현재 계정으로 이전합니다.
export async function claimAnonymousHistory(anonId: string): Promise<void> {
  if (!anonId) return;
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || anonId === user.id) return;

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from(TABLE)
    .update({ client_id: user.id })
    .eq("client_id", anonId);
  if (error) throw new Error(`기록 이전에 실패했습니다: ${error.message}`);
}

// OpenRouter의 LLM으로 오늘의 운세를 새로 생성합니다. (API Key는 서버에만 존재)
// birthDate(YYYY-MM-DD)가 있으면 만 나이·띠·별자리를 반영합니다.
export async function drawAiFortune(birthDate?: string): Promise<AiFortune> {
  return generateAiFortune(birthDate);
}

// 주어진 구간(오늘)에 운세를 뽑은 서로 다른 소유자 수를 셉니다.
export async function countTodayDrawers(
  startISO: string,
  endISO: string,
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("client_id")
    .gte("drawn_at", startISO)
    .lt("drawn_at", endISO);

  if (error) throw new Error(`오늘 참여자 수를 불러오지 못했습니다: ${error.message}`);
  return new Set((data ?? []).map((r) => r.client_id)).size;
}
