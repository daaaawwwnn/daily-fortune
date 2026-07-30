"use client";

import { formatDrawnAt, type HistoryEntry } from "./history";

type HistoryTableProps = {
  entries: HistoryEntry[];
  onClear: () => void;
};

export default function HistoryTable({ entries, onClear }: HistoryTableProps) {
  return (
    <section className="w-full max-w-3xl px-6 pb-16">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-amber-200">📜 내 운세 기록</h2>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-indigo-400/40 px-3 py-1 text-xs text-indigo-200/80 transition hover:bg-indigo-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
          >
            기록 지우기
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="rounded-xl border border-indigo-400/20 bg-indigo-950/40 px-4 py-6 text-center text-sm text-indigo-200/60">
          아직 뽑은 운세가 없어요. 카드를 눌러 첫 운세를 확인해보세요!
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-indigo-400/20 bg-indigo-950/40">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-indigo-400/20 text-left text-indigo-200/70">
                <th className="whitespace-nowrap px-4 py-3 font-semibold">뽑은 시각</th>
                <th className="px-4 py-3 font-semibold">운세</th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-semibold">지수</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">행운의 아이템</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">방향</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={`${entry.drawnAt}-${i}`}
                  className="border-b border-indigo-400/10 text-indigo-100/90 last:border-b-0"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-indigo-200/70">
                    {formatDrawnAt(entry.drawnAt)}
                  </td>
                  <td className="px-4 py-3">{entry.message}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-center font-semibold text-amber-200">
                    {entry.score}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{entry.luckyItem}</td>
                  <td className="whitespace-nowrap px-4 py-3">{entry.direction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
