export function groupBy<Row, Key extends string>(
  rows: Row[],
  getKey: (row: Row) => Key,
) {
  const map = new Map<Key, Row[]>();
  for (const r of rows) {
    const k = getKey(r);
    const bucket = map.get(k);
    if (bucket) bucket.push(r);
    else map.set(k, [r]);
  }
  return map;
}
