"use client";

import type { ReactNode } from "react";

type FlipCardProps = {
  flipped: boolean;
  onClick: () => void;
  ariaLabel: string;
  disabled?: boolean;
  // 뒷면(표지)/앞면(결과) 각각의 테두리·배경 등 카드별 스타일
  backFaceClassName: string;
  frontFaceClassName: string;
  back: ReactNode;
  front: ReactNode;
  // 앞면 우상단에 얹는 배지(선택)
  frontBadge?: ReactNode;
};

// 두 운세 카드(랜덤/AI)가 공유하는 3D 뒤집기 카드 셸.
// 뒤집기 애니메이션이 걸린 요소(.flip-card-face) 자체에는 overflow를 주지 않고,
// 안쪽 래퍼에서만 스크롤되게 분리해야 backface-visibility가 깨지지 않습니다.
export default function FlipCard({
  flipped,
  onClick,
  ariaLabel,
  disabled,
  backFaceClassName,
  frontFaceClassName,
  back,
  front,
  frontBadge,
}: FlipCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="perspective h-[30rem] w-72 cursor-pointer select-none rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70 sm:h-[36rem] sm:w-80"
    >
      <div className={`flip-card-inner ${flipped ? "flipped" : ""}`}>
        <div className={`flip-card-face rounded-2xl shadow-2xl ${backFaceClassName}`}>
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 overflow-y-auto p-6">
            {back}
          </div>
        </div>

        <div
          className={`flip-card-face flip-card-back relative rounded-2xl shadow-2xl ${frontFaceClassName}`}
        >
          {frontBadge}
          <div className="flex h-full w-full flex-col items-center justify-start gap-5 overflow-y-auto p-6 pt-8 text-center">
            {front}
          </div>
        </div>
      </div>
    </button>
  );
}
