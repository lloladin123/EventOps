export function normalizeTime(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  // 1400 -> 14:00
  if (/^\d{4}$/.test(raw)) {
    const hh = raw.slice(0, 2);
    const mm = raw.slice(2, 4);
    const h = Number(hh);
    const m = Number(mm);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) return `${hh}:${mm}`;
    return null;
  }

  // 14:00 -> 14:00
  if (/^\d{2}:\d{2}$/.test(raw)) {
    const [hh, mm] = raw.split(":");
    const h = Number(hh);
    const m = Number(mm);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) return `${hh}:${mm}`;
    return null;
  }

  return null;
}
