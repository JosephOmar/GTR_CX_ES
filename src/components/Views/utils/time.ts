// utils/time.ts
export function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of ['00','30']) {
      const hh = h.toString().padStart(2,'0');
      times.push(`${hh}:${m}`);
    }
  }
  return times;
}
