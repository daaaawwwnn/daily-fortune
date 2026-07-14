import FortuneCard from "./FortuneCard";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 bg-gradient-to-br from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-600 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] sm:text-4xl">
          🌈 오늘의 운세
        </h1>
        <p className="text-sm font-medium text-white/90 drop-shadow sm:text-base">
          카드를 눌러 오늘의 운세와 행운의 아이템을 확인해보세요
        </p>
      </div>
      <FortuneCard />
    </main>
  );
}
