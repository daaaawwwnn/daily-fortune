import FortuneBoard from "./FortuneBoard";
import TodayCounter from "./TodayCounter";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-start gap-10 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 px-6 pb-8 pt-16">
      <TodayCounter />
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold text-amber-200 sm:text-4xl">
          🔮 오늘의 운세
        </h1>
        <p className="text-sm text-indigo-200/70 sm:text-base">
          카드를 눌러 오늘의 운세와 행운의 아이템을 확인해보세요
        </p>
      </div>
      <FortuneBoard />
    </main>
  );
}
