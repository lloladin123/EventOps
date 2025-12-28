export function nowHHmm() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function parseTimeToHHmm(input: string): string | null {
  const raw = input.trim();

  const colonMatch = raw.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (colonMatch) return raw;

  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 4) return null;

  const hh = Number(digits.slice(0, 2));
  const mm = Number(digits.slice(2, 4));

  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  if (hh < 0 || hh > 23) return null;
  if (mm < 0 || mm > 59) return null;

  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
