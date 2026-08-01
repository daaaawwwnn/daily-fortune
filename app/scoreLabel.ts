// 운세 지수(0~100)에 대응하는 등급 라벨. 랜덤 카드와 AI 카드가 공유합니다.
export function scoreLabel(score: number): string {
  if (score >= 90) return "대길 🍀";
  if (score >= 75) return "길 😊";
  if (score >= 60) return "평 🙂";
  return "조심 🌿";
}
