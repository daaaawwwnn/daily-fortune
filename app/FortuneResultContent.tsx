import { scoreLabel } from "./scoreLabel";

const ACCENTS = {
  amber: {
    label: "text-amber-700",
    bar: "bg-gradient-to-r from-amber-400 to-orange-500",
    barTrack: "bg-amber-100",
    box: "bg-amber-100/70",
  },
  violet: {
    label: "text-violet-700",
    bar: "bg-gradient-to-r from-violet-400 to-fuchsia-500",
    barTrack: "bg-violet-100",
    box: "bg-violet-100/70",
  },
} as const;

type FortuneResultContentProps = {
  icon: string;
  score: number;
  message: string;
  luckyItem: string;
  luckyColor: string;
  luckyNumber: number;
  direction: string;
  accent: keyof typeof ACCENTS;
};

// 랜덤 카드·AI 카드가 공유하는 결과 화면(운세 지수 + 메시지 + 행운 정보).
export default function FortuneResultContent({
  icon,
  score,
  message,
  luckyItem,
  luckyColor,
  luckyNumber,
  direction,
  accent,
}: FortuneResultContentProps) {
  const c = ACCENTS[accent];
  return (
    <>
      <div className="text-4xl">{icon}</div>
      <div className="w-full">
        <div className="mb-1 flex items-baseline justify-between text-sm">
          <span className={`font-semibold ${c.label}`}>오늘의 운세 지수</span>
          <span className="font-bold text-slate-800">
            {score}점 · {scoreLabel(score)}
          </span>
        </div>
        <div className={`h-3 w-full overflow-hidden rounded-full ${c.barTrack}`}>
          <div
            className={`h-full rounded-full transition-[width] duration-700 ease-out ${c.bar}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      <p className="whitespace-pre-line text-base font-medium leading-relaxed text-slate-800">
        {message}
      </p>
      <div className={`mt-2 w-full space-y-2 rounded-xl px-4 py-3 text-sm text-slate-700 ${c.box}`}>
        <div className="flex items-center justify-between">
          <span className={`font-semibold ${c.label}`}>행운의 아이템</span>
          <span>{luckyItem}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`font-semibold ${c.label}`}>행운의 색</span>
          <span>{luckyColor}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`font-semibold ${c.label}`}>행운의 숫자</span>
          <span>{luckyNumber}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`font-semibold ${c.label}`}>행운의 방향</span>
          <span>{direction}</span>
        </div>
      </div>
    </>
  );
}
