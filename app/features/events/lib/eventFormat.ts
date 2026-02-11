export function formatDateDDMMYYYY(dateISO: string) {
  const [y, m, d] = dateISO.split("-").map(Number);
  return `${d}.${m}.${y}`;
}
