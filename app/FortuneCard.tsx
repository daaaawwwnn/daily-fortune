"use client";

import { useEffect, useState } from "react";
import { FORTUNES, type Fortune } from "./fortunes";
import { drawAiFortune } from "./actions";
import { getSavedBirthDate, saveBirthDate } from "./birthDate";

function pickFortune(exclude?: Fortune): Fortune {
  if (FORTUNES.length === 1) return FORTUNES[0];
  let next = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  while (exclude && next === exclude) {
    next = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  }
  return next;
}

// 40~100 사이의 오늘의 운세 지수를 생성합니다.
function pickScore(): number {
  return Math.floor(Math.random() * 61) + 40;
}

const DIRECTIONS = [
  "동쪽 →",
  "서쪽 ←",
  "남쪽 ↓",
  "북쪽 ↑",
  "북동쪽 ↗",
  "남동쪽 ↘",
  "남서쪽 ↙",
  "북서쪽 ↖",
];

function pickDirection(): string {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
}

function scoreLabel(score: number): string {
  if (score >= 90) return "대길 🍀";
  if (score >= 75) return "길 😊";
  if (score >= 60) return "평 🙂";
  return "조심 🌿";
}

type FortuneCardProps = {
  onDraw?: (fortune: Fortune, extra: { direction: string; score: number }) => void;
};

export default function FortuneCard({ onDraw }: FortuneCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [score, setScore] = useState(0);
  const [direction, setDirection] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAi, setIsAi] = useState(false);
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [showBirthModal, setShowBirthModal] = useState(false);
  const [birthInput, setBirthInput] = useState("");

  useEffect(() => {
    setBirthDate(getSavedBirthDate());
  }, []);

  const handleClick = () => {
    if (aiLoading) return;
    if (!flipped) {
      const nextFortune = pickFortune(fortune ?? undefined);
      const nextScore = pickScore();
      const nextDirection = pickDirection();
      setIsAi(false);
      setFortune(nextFortune);
      setScore(nextScore);
      setDirection(nextDirection);
      setFlipped(true);
      onDraw?.(nextFortune, { direction: nextDirection, score: nextScore });
    } else {
      setFlipped(false);
    }
  };

  const runAiDraw = async (bd: string) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const ai = await drawAiFortune(bd);
      const nextFortune: Fortune = {
        message: ai.message,
        luckyItem: ai.luckyItem,
        luckyColor: ai.luckyColor,
        luckyNumber: ai.luckyNumber,
      };
      setIsAi(true);
      setFortune(nextFortune);
      setScore(ai.score);
      setDirection(ai.direction);
      setFlipped(true);
      onDraw?.(nextFortune, { direction: ai.direction, score: ai.score });
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : "AI 운세 생성에 실패했습니다.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (aiLoading) return;
    if (!birthDate) {
      setBirthInput("");
      setShowBirthModal(true);
      return;
    }
    runAiDraw(birthDate);
  };

  const handleBirthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthInput) return;
    saveBirthDate(birthInput);
    setBirthDate(birthInput);
    setShowBirthModal(false);
    runAiDraw(birthInput);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <button
        type="button"
        onClick={handleClick}
        aria-label={flipped ? "카드를 다시 뒤집기" : "카드를 뒤집어 운세 보기"}
        className="perspective h-[30rem] w-72 cursor-pointer select-none rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60 sm:h-[36rem] sm:w-80"
      >
        <div className={`flip-card-inner ${flipped ? "flipped" : ""}`}>
          {/* Card back (shown first) */}
          <div className="flip-card-face rounded-2xl border border-amber-300/40 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 shadow-2xl">
            {/* 3D 플립 요소 자체에는 overflow를 주지 않고, 안쪽 래퍼에서만 스크롤되게 분리 */}
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 overflow-y-auto p-6">
              <div className="sparkle text-6xl">✨</div>
              <p className="text-lg font-semibold tracking-wide text-amber-200">
                오늘의 운세
              </p>
              <p className="px-6 text-center text-sm text-indigo-200/80">
                카드를 눌러서 확인해보세요
              </p>
            </div>
          </div>

          {/* Card front (fortune result) */}
          <div className="flip-card-face flip-card-back relative rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-2xl">
            {isAi && (
              <span className="absolute right-3 top-3 z-10 rounded-full bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
                🤖 AI 생성
              </span>
            )}
            {/* 3D 플립 요소 자체에는 overflow를 주지 않고, 안쪽 래퍼에서만 스크롤되게 분리 */}
            <div className="flex h-full w-full flex-col items-center justify-start gap-5 overflow-y-auto p-6 pt-8 text-center">
              <div className="text-4xl">🔮</div>
              <div className="w-full">
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-amber-700">오늘의 운세 지수</span>
                  <span className="font-bold text-slate-800">
                    {score}점 · {scoreLabel(score)}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-amber-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-[width] duration-700 ease-out"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
              <p className="whitespace-pre-line text-base font-medium leading-relaxed text-slate-800">
                {fortune?.message}
              </p>
              <div className="mt-2 w-full space-y-2 rounded-xl bg-amber-100/70 px-4 py-3 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-700">행운의 아이템</span>
                  <span>{fortune?.luckyItem}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-700">행운의 색</span>
                  <span>{fortune?.luckyColor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-700">행운의 숫자</span>
                  <span>{fortune?.luckyNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-700">행운의 방향</span>
                  <span>{direction}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>

      <p className="text-sm text-slate-400">
        {flipped ? "카드를 다시 누르면 새로운 운세를 볼 수 있어요" : "카드를 클릭해보세요"}
      </p>

      <button
        type="button"
        onClick={handleAiClick}
        disabled={aiLoading}
        className="flex items-center gap-2 rounded-full border border-violet-400/50 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60"
      >
        {aiLoading ? (
          <>
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-violet-300 border-t-transparent" />
            AI가 운세를 만드는 중…
          </>
        ) : (
          <>🤖 AI 운세 생성</>
        )}
      </button>
      {aiError && <p className="max-w-xs text-center text-sm text-red-300">⚠️ {aiError}</p>}
      {birthDate && (
        <p className="text-xs text-indigo-300/70">
          🎂 {birthDate} 기준으로 반영돼요 ·{" "}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setBirthInput(birthDate);
              setShowBirthModal(true);
            }}
            className="underline underline-offset-2 hover:text-indigo-200"
          >
            변경
          </button>
        </p>
      )}

      {showBirthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowBirthModal(false)}
        >
          <form
            onSubmit={handleBirthSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-violet-400/30 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-violet-200">생년월일을 알려줘</h3>
              <button
                type="button"
                onClick={() => setShowBirthModal(false)}
                aria-label="닫기"
                className="text-indigo-200/60 hover:text-indigo-100"
              >
                ✕
              </button>
            </div>
            <p className="mb-4 text-sm text-indigo-200/70">
              나이·띠·별자리를 반영한 운세를 만들어줄게요. 이 브라우저에만 저장돼요.
            </p>
            <input
              type="date"
              required
              value={birthInput}
              onChange={(e) => setBirthInput(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              min="1900-01-01"
              className="w-full rounded-lg border border-indigo-400/30 bg-slate-800 px-3 py-2 text-sm text-indigo-50 focus:border-violet-300/60 focus:outline-none"
            />
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-violet-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              확인하고 운세 보기
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
