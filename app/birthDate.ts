const KEY = "fortune-birth-date";

// 생년월일(YYYY-MM-DD)을 브라우저에 저장해두고, 다음 방문부터는 다시 묻지 않습니다.
export function getSavedBirthDate(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveBirthDate(date: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, date);
  } catch {
    // 저장 실패 시 다음에 다시 물어보게 됩니다.
  }
}
