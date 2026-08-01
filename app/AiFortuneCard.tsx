"use client";

import { useEffect, useState } from "react";
import type { Fortune } from "./fortunes";
import { drawAiFortune } from "./actions";
import { getSavedBirthDate, saveBirthDate } from "./birthDate";
import FlipCard from "./FlipCard";
import FortuneResultContent from "./FortuneResultContent";

type AiFortuneCardProps = {
  onDraw?: (fortune: Fortune, extra: { direction: string; score: number }) => void;
};

export default function AiFortuneCard({ onDraw }: AiFortuneCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [score, setScore] = useState(0);
  const [direction, setDirection] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [showBirthModal, setShowBirthModal] = useState(false);
  const [birthInput, setBirthInput] = useState("");

  useEffect(() => {
    setBirthDate(getSavedBirthDate());
  }, []);

  const runAiDraw = async (bd: string) => {
    setLoading(true);
    setError(null);
    try {
      const ai = await drawAiFortune(bd);
      const nextFortune: Fortune = {
        message: ai.message,
        luckyItem: ai.luckyItem,
        luckyColor: ai.luckyColor,
        luckyNumber: ai.luckyNumber,
      };
      setFortune(nextFortune);
      setScore(ai.score);
      setDirection(ai.direction);
      setFlipped(true);
      onDraw?.(nextFortune, { direction: ai.direction, score: ai.score });
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI 운세 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (loading) return;
    if (flipped) {
      setFlipped(false);
      return;
    }
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
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-lg font-bold text-violet-200">🤖 AI 운세</h2>
      <FlipCard
        flipped={flipped}
        onClick={handleClick}
        disabled={loading}
        ariaLabel={
          loading
            ? "AI가 운세를 만드는 중"
            : flipped
              ? "카드를 다시 뒤집기"
              : "카드를 뒤집어 AI 운세 보기"
        }
        backFaceClassName="border border-violet-300/40 bg-gradient-to-br from-violet-950 via-fuchsia-950 to-slate-900"
        frontFaceClassName="border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 text-center"
        frontBadge={
          <span className="absolute right-3 top-3 z-10 rounded-full bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
            🤖 AI 생성
          </span>
        }
        back={
          loading ? (
            <>
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-violet-300 border-t-transparent" />
              <p className="text-lg font-semibold tracking-wide text-violet-200">
                AI가 운세를 쓰는 중…
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl">🤖</div>
              <p className="text-lg font-semibold tracking-wide text-violet-200">
                AI 오늘의 운세
              </p>
              <p className="px-6 text-center text-sm text-violet-200/80">
                카드를 눌러서 AI가 즉석에서 써주는 운세를 확인해보세요
              </p>
            </>
          )
        }
        front={
          fortune && (
            <FortuneResultContent
              icon="🤖"
              score={score}
              message={fortune.message}
              luckyItem={fortune.luckyItem}
              luckyColor={fortune.luckyColor}
              luckyNumber={fortune.luckyNumber}
              direction={direction}
              accent="violet"
            />
          )
        }
      />
      <p className="text-sm text-slate-400">
        {flipped ? "카드를 다시 누르면 새로운 AI 운세를 볼 수 있어요" : "카드를 클릭해보세요"}
      </p>
      {error && <p className="max-w-xs text-center text-sm text-red-300">⚠️ {error}</p>}
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
