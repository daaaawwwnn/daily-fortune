import "server-only";
import type { Fortune } from "../fortunes";

// OpenRouter를 통해 사용할 모델. 기본값: Anthropic Claude Sonnet 5
const DEFAULT_MODEL = "anthropic/claude-sonnet-5";

export type AiFortune = Fortune & {
  direction: string;
  score: number;
};

const DIRECTIONS = ["동쪽", "서쪽", "남쪽", "북쪽", "북동쪽", "남동쪽", "남서쪽", "북서쪽"];

const SCHEMA = {
  type: "object",
  properties: {
    message: {
      type: "string",
      description:
        "오늘의 운세 메시지. 정확히 세 줄, 줄바꿈 문자(\\n)로 구분. 다정하고 친근한 반말(한국어)로 작성",
    },
    luckyItem: { type: "string", description: "행운의 아이템 (한국어, 한 단어~짧은 구)" },
    luckyColor: { type: "string", description: "행운의 색 (한국어)" },
    luckyNumber: { type: "integer", description: "0~99 사이의 행운의 숫자" },
    direction: { type: "string", enum: DIRECTIONS },
    score: {
      type: "integer",
      description: "오늘의 운세 지수, 0~100 사이의 정수",
    },
  },
  required: [
    "message",
    "luckyItem",
    "luckyColor",
    "luckyNumber",
    "direction",
    "score",
  ],
  additionalProperties: false,
};

// 생년월일(YYYY-MM-DD) 문자열을 검증해 연/월/일로 분리합니다. 유효하지 않으면 null.
function parseBirthDate(
  birthDate: string | undefined,
): { year: number; month: number; day: number } | null {
  if (!birthDate) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  return { year, month, day };
}

// 만 나이를 계산합니다.
function computeInternationalAge(year: number, month: number, day: number): number {
  const now = new Date();
  let age = now.getFullYear() - year;
  const hasHadBirthdayThisYear =
    now.getMonth() + 1 > month || (now.getMonth() + 1 === month && now.getDate() >= day);
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

const CHINESE_ZODIAC = ["원숭이", "닭", "개", "돼지", "쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양"];

function chineseZodiac(year: number): string {
  return CHINESE_ZODIAC[((year % 12) + 12) % 12];
}

// 월별 별자리 전환일(그 날짜까지는 해당 별자리)과, 그 이후 시작되는 다음 별자리 목록
const WESTERN_ZODIAC_CUTOFF_DAY = [19, 18, 20, 19, 20, 21, 22, 22, 22, 23, 22, 21];
const WESTERN_ZODIAC_SIGN = [
  "염소자리", "물병자리", "물고기자리", "양자리", "황소자리", "쌍둥이자리",
  "게자리", "사자자리", "처녀자리", "천칭자리", "전갈자리", "사수자리",
];

function westernZodiac(month: number, day: number): string {
  const idx = month - 1;
  if (day <= WESTERN_ZODIAC_CUTOFF_DAY[idx]) return WESTERN_ZODIAC_SIGN[idx];
  return WESTERN_ZODIAC_SIGN[(idx + 1) % 12];
}

// 생년월일을 바탕으로 만 나이·띠·별자리를 계산해 프롬프트에 덧붙일 문장을 만듭니다.
// (LLM이 날짜 계산을 틀릴 수 있어 서버에서 직접 계산한 값을 알려줍니다.)
function buildPersonalizationNote(birthDate: string | undefined): string {
  const parsed = parseBirthDate(birthDate);
  if (!parsed) return "";
  const { year, month, day } = parsed;
  const age = computeInternationalAge(year, month, day);
  const animal = chineseZodiac(year);
  const sign = westernZodiac(month, day);
  return (
    `\n\n[참고 정보] 이 사람은 만 ${age}세, ${animal}띠, ${sign}야. ` +
    "이 정보를 직접 나열하지 말고, 나이대나 띠·별자리 느낌을 운세 내용에 자연스럽게 녹여서 반영해줘."
  );
}

// OpenRouter를 통해 LLM으로 오늘의 운세를 새로 생성합니다. (서버 전용)
// birthDate가 주어지면(YYYY-MM-DD) 만 나이·띠·별자리를 계산해 운세에 반영합니다.
export async function generateAiFortune(birthDate?: string): Promise<AiFortune> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.",
    );
  }
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // OpenRouter 랭킹 표기용 (선택이지만 넣어두는 것을 권장)
      "HTTP-Referer": "https://daily-fortune-dusky.vercel.app",
      "X-Title": "Daily Fortune",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "너는 재치있고 다정한 한국어 운세 작가야. 매번 다르고 창의적인 '오늘의 운세'를 만들어줘. " +
            "메시지는 정확히 세 줄로 나눠서 써줘(줄 사이는 \\n로 구분). 존댓말 말고 다정한 반말로, " +
            "친한 친구가 말해주듯이 편안하게 작성해. 반드시 주어진 JSON 스키마 형식으로만 응답해.",
        },
        {
          role: "user",
          content: "오늘의 운세를 새로 만들어줘." + buildPersonalizationNote(birthDate),
        },
      ],
      temperature: 1.0,
      response_format: {
        type: "json_schema",
        json_schema: { name: "fortune", strict: true, schema: SCHEMA },
      },
    }),
    // 매번 새로운 운세를 받기 위해 캐시하지 않음
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenRouter 요청 실패 (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) throw new Error("AI 응답이 비어 있습니다.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI 응답을 해석하지 못했습니다.");
  }

  return normalize(parsed);
}

function normalize(v: unknown): AiFortune {
  const o = v as Record<string, unknown>;
  const message = String(o.message ?? "").trim();
  const luckyItem = String(o.luckyItem ?? "").trim();
  const luckyColor = String(o.luckyColor ?? "").trim();
  const luckyNumber = clampInt(o.luckyNumber, 0, 99, 7);
  const score = clampInt(o.score, 0, 100, 70);
  const direction = DIRECTIONS.includes(String(o.direction))
    ? String(o.direction)
    : DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

  if (!message || !luckyItem || !luckyColor) {
    throw new Error("AI 응답 형식이 올바르지 않습니다.");
  }

  return {
    message,
    luckyItem,
    luckyColor,
    luckyNumber,
    direction: directionWithArrow(direction),
    score,
  };
}

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

const ARROWS: Record<string, string> = {
  동쪽: "→",
  서쪽: "←",
  남쪽: "↓",
  북쪽: "↑",
  북동쪽: "↗",
  남동쪽: "↘",
  남서쪽: "↙",
  북서쪽: "↖",
};

function directionWithArrow(dir: string): string {
  return `${dir} ${ARROWS[dir] ?? ""}`.trim();
}
