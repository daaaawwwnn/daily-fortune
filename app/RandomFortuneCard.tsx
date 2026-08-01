"use client";

import { useState } from "react";
import { FORTUNES, type Fortune } from "./fortunes";
import FlipCard from "./FlipCard";
import FortuneResultContent from "./FortuneResultContent";

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

type RandomFortuneCardProps = {
  onDraw?: (fortune: Fortune, extra: { direction: string; score: number }) => void;
};

export default function RandomFortuneCard({ onDraw }: RandomFortuneCardProps) {
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
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-lg font-bold text-amber-200">🎲 랜덤 운세</h2>
      <FlipCard
        flipped={flipped}
        onClick={handleClick}
        ariaLabel={flipped ? "카드를 다시 뒤집기" : "카드를 뒤집어 운세 보기"}
        backFaceClassName="border border-amber-300/40 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900"
        frontFaceClassName="border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 text-center"
        back={
          <>
            <div className="sparkle text-6xl">✨</div>
            <p className="text-lg font-semibold tracking-wide text-amber-200">
              오늘의 운세
            </p>
            <p className="px-6 text-center text-sm text-indigo-200/80">
              카드를 눌러서 확인해보세요
            </p>
          </>
        }
        front={
          fortune && (
            <FortuneResultContent
              icon="🔮"
              score={score}
              message={fortune.message}
              luckyItem={fortune.luckyItem}
              luckyColor={fortune.luckyColor}
              luckyNumber={fortune.luckyNumber}
              direction={direction}
              accent="amber"
            />
          )
        }
      />
      <p className="text-sm text-slate-400">
        {flipped ? "카드를 다시 누르면 새로운 운세를 볼 수 있어요" : "카드를 클릭해보세요"}
      </p>
    </div>
  );
}
