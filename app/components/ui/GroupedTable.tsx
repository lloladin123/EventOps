"use client";

import * as React from "react";

export type SortDir = "asc" | "desc";
export type SortState<K extends string> = { key: K; dir: SortDir };

type Column<Row, ColumnKey extends string> = {
  key: ColumnKey;
  header: React.ReactNode;
  headerTitle?: string;
  className?: string;

  // If present, the column is sortable.
  sortValue?: (row: Row) => string | number;

  // Render cell
  cell: (row: Row) => React.ReactNode;

  // Optional alignment
  align?: "left" | "right";

  // ✅ clamp/truncate long content with ellipsis
  truncate?: boolean;

  // ✅ optional max width helper (works best with truncate)
  maxWidthClassName?: string; // e.g. "max-w-[320px]"
};

type GroupMeta = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode; // e.g. button(s)
};

type Props<
  Row,
  GroupId extends string,
  ColumnKey extends string,
  SortKey extends ColumnKey
> = {
  rows: Row[];

  // grouping
  getGroupId: (row: Row) => GroupId;
  getGroupMeta: (groupId: GroupId, groupRows: Row[]) => GroupMeta;

  // table
  columns: Array<Column<Row, ColumnKey>>;
  sortHint?: React.ReactNode; // e.g. "Klik på kolonner for at sortere"
  tableMinWidthClassName?: string; // e.g. "min-w-[1000px]"

  // ✅ add row props hook
  getRowProps?: (row: Row) => React.HTMLAttributes<HTMLTableRowElement>;

  disableRowHover?: boolean;

  // sorting (only sortable keys)
  initialSort: SortState<SortKey>;

  // ✅ filter the rows shown in the main table per group
  filterGroupRows?: (groupId: GroupId, groupRows: Row[]) => Row[];

  // ✅ render extra content under each group (e.g. a second table)
  renderGroupAfter?: (groupId: GroupId, groupRows: Row[]) => React.ReactNode;
};

function asText(v: unknown) {
  return (v ?? "").toString().trim().toLowerCase();
}

function cmp(a: string | number, b: string | number) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function nodeToTitle(node: React.ReactNode): string | undefined {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  return undefined;
}

function tdClassName(align: "left" | "right" | undefined, className?: string) {
  const a = align === "right" ? "text-right" : "text-left";
  return ["px-4 py-2 align-top", a, className].filter(Boolean).join(" ");
}

function wrapClassName(maxWidthClassName?: string) {
  return ["truncate", maxWidthClassName ?? "max-w-[320px]", "block"].join(" ");
}

export default function GroupedTable<
  Row,
  GroupId extends string,
  ColumnKey extends string,
  SortKey extends ColumnKey
>({
  rows,
  getGroupId,
  getGroupMeta,
  columns,
  sortHint = "Klik på kolonner for at sortere",
  tableMinWidthClassName = "min-w-[900px]",
  initialSort,
  filterGroupRows,
  renderGroupAfter,
  getRowProps,
  disableRowHover = false,
}: Props<Row, GroupId, ColumnKey, SortKey>) {
  const [sort, setSort] = React.useState<SortState<SortKey>>(initialSort);

  const toggleSort = (key: SortKey) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" };
      return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
    });
  };

  const hasSortable = React.useMemo(
    () => columns.some((c) => typeof c.sortValue === "function"),
    [columns]
  );

  const grouped = React.useMemo(() => {
    const map = new Map<GroupId, Row[]>();
    for (const r of rows) {
      const gid = getGroupId(r);
      if (!map.has(gid)) map.set(gid, []);
      map.get(gid)!.push(r);
    }
    return map;
  }, [rows, getGroupId]);

  const sortGroup = React.useCallback(
    (groupRows: Row[]) => {
      const dir = sort.dir === "asc" ? 1 : -1;

      const activeCol = columns.find(
        (c) => c.key === (sort.key as unknown as ColumnKey)
      );

      const getVal = activeCol?.sortValue;
      if (!getVal) return groupRows;

      const withIndex = groupRows.map((r, idx) => ({ r, idx }));
      withIndex.sort((A, B) => {
        const a = getVal(A.r);
        const b = getVal(B.r);

        const av = typeof a === "string" ? asText(a) : a;
        const bv = typeof b === "string" ? asText(b) : b;

        const res = cmp(av as any, bv as any);
        if (res !== 0) return res * dir;

        return A.idx - B.idx;
      });

      return withIndex.map((x) => x.r);
    },
    [sort, columns]
  );

  if (!rows.length) return null;

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([groupId, groupRows]) => {
        const meta = getGroupMeta(groupId, groupRows);

        const visibleRows = filterGroupRows
          ? filterGroupRows(groupId, groupRows)
          : groupRows;

        const sortedRows = sortGroup(visibleRows);

        return (
          <section
            key={groupId}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-slate-900">
                  {meta.title}
                </div>
                {meta.subtitle ? (
                  <div className="text-xs text-slate-500">{meta.subtitle}</div>
                ) : null}
                {hasSortable && sortHint ? (
                  <div className="mt-1 text-xs text-slate-400">{sortHint}</div>
                ) : null}
              </div>

              {meta.right ? <div className="shrink-0">{meta.right}</div> : null}
            </div>

            <div className="overflow-x-auto">
              <table className={`${tableMinWidthClassName} w-full`}>
                <thead className="bg-slate-50"></thead>

                <tbody>
                  {sortedRows.map((row, idx) => {
                    const rp = getRowProps?.(row);

                    return (
                      <tr
                        key={idx}
                        {...rp}
                        className={[
                          "border-t transition-colors",
                          !disableRowHover && "hover:bg-amber-50",
                          "focus:bg-amber-50 focus:outline-none", // ✅ row itself can be focused
                          "focus-within:bg-amber-50", // keep old behavior too
                          rp?.className ?? "",
                        ].join(" ")}
                      >
                        {columns.map((c) => {
                          const content = c.cell(row);
                          const autoTitle = nodeToTitle(content);

                          return (
                            <td
                              key={c.key}
                              className={tdClassName(c.align, c.className)}
                            >
                              {c.truncate ? (
                                <span
                                  className={wrapClassName(c.maxWidthClassName)}
                                  title={autoTitle}
                                >
                                  {content}
                                </span>
                              ) : (
                                content
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {renderGroupAfter ? (
              <div className="border-t border-slate-200 p-4">
                {renderGroupAfter(groupId, groupRows)}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
