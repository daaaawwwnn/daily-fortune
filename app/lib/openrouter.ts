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

// OpenRouter를 통해 LLM으로 오늘의 운세를 새로 생성합니다. (서버 전용)
export async function generateAiFortune(): Promise<AiFortune> {
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
          content: "오늘의 운세를 새로 만들어줘.",
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
