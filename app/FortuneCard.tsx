"use client";

import { useState } from "react";
import { FORTUNES, type Fortune } from "./fortunes";

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

  const handleClick = () => {
    if (!flipped) {
      const nextFortune = pickFortune(fortune ?? undefined);
      const nextScore = pickScore();
      const nextDirection = pickDirection();
      setFortune(nextFortune);
      setScore(nextScore);
      setDirection(nextDirection);
      setFlipped(true);
      onDraw?.(nextFortune, { direction: nextDirection, score: nextScore });
    } else {
      setFlipped(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <button
        type="button"
        onClick={handleClick}
        aria-label={flipped ? "카드를 다시 뒤집기" : "카드를 뒤집어 운세 보기"}
        className="perspective h-96 w-64 cursor-pointer select-none rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60 sm:h-[26rem] sm:w-72"
      >
        <div className={`flip-card-inner ${flipped ? "flipped" : ""}`}>
          {/* Card back (shown first) */}
          <div className="flip-card-face flex flex-col items-center justify-center gap-4 rounded-2xl border border-amber-300/40 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 shadow-2xl">
            <div className="sparkle text-6xl">✨</div>
            <p className="text-lg font-semibold tracking-wide text-amber-200">
              오늘의 운세
            </p>
            <p className="px-6 text-center text-sm text-indigo-200/80">
              카드를 눌러서 확인해보세요
            </p>
          </div>

          {/* Card front (fortune result) */}
          <div className="flip-card-face flip-card-back flex flex-col items-center justify-center gap-5 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 text-center shadow-2xl">
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
            <p className="text-base font-medium leading-relaxed text-slate-800">
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
      </button>

      <p className="text-sm text-slate-400">
        {flipped ? "카드를 다시 누르면 새로운 운세를 볼 수 있어요" : "카드를 클릭해보세요"}
      </p>
    </div>
  );
}
