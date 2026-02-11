import type { SortState } from "./types";

function asText(v: unknown) {
  return (v ?? "").toString().trim().toLowerCase();
}

function cmp(a: string | number, b: string | number) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

// stable sort
export function sortRows<
  Row,
  ColumnKey extends string,
  SortKey extends ColumnKey,
>(
  rows: Row[],
  sort: SortState<SortKey>,
  columns: Array<{ key: ColumnKey; sortValue?: (row: Row) => string | number }>,
) {
  const dir = sort.dir === "asc" ? 1 : -1;
  const col = columns.find((c) => c.key === (sort.key as unknown as ColumnKey));
  const getVal = col?.sortValue;
  if (!getVal) return rows;

  const withIndex = rows.map((r, idx) => ({ r, idx }));
  withIndex.sort((A, B) => {
    const a = getVal(A.r);
    const b = getVal(B.r);

    const av = typeof a === "string" ? asText(a) : a;
    const bv = typeof b === "string" ? asText(b) : b;

    const res = cmp(av, bv);
    if (res !== 0) return res * dir;
    return A.idx - B.idx;
  });

  return withIndex.map((x) => x.r);
}

export function hasSortable(columns: Array<{ sortValue?: unknown }>) {
  return columns.some((c) => typeof c.sortValue === "function");
}
