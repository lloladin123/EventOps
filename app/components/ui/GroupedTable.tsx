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

  // ✅ NEW: if true, clamp/truncate long content with ellipsis
  truncate?: boolean;

  // ✅ NEW: optional max width helper (works best with truncate)
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

  // sorting (only sortable keys)
  initialSort: SortState<SortKey>;
};

function asText(v: unknown) {
  return (v ?? "").toString().trim().toLowerCase();
}

function cmp(a: string | number, b: string | number) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function thBtnCls(active: boolean) {
  return [
    "group inline-flex items-center gap-1 select-none",
    "hover:text-slate-900",
    active ? "text-slate-900" : "text-slate-600",
  ].join(" ");
}

function arrow(dir: SortDir) {
  return dir === "asc" ? "↑" : "↓";
}

function nodeToTitle(node: React.ReactNode): string | undefined {
  // Only auto-title if it's a simple primitive. Otherwise user can set title themselves in cell().
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  return undefined;
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

      // Find the active sort column (must be sortable)
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

        // stable fallback
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
        const sortedRows = sortGroup(groupRows);

        return (
          <section
            key={groupId}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            {/* Card header */}
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

            {/* Scroll container */}
            <div className="overflow-x-auto">
              <table className={`${tableMinWidthClassName} w-full`}>
                <thead className="bg-slate-50">
                  <tr>
                    {columns.map((c) => {
                      const align =
                        c.align === "right" ? "text-right" : "text-left";

                      const isSortable = typeof c.sortValue === "function";
                      const isActive =
                        isSortable &&
                        (sort.key as unknown as string) ===
                          (c.key as unknown as string);

                      const showArrow = isSortable
                        ? isActive
                          ? arrow(sort.dir)
                          : "↕"
                        : "";

                      return (
                        <th
                          key={c.key}
                          className={[
                            "px-4 py-2 text-xs font-semibold text-slate-600",
                            align,
                            c.className,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {isSortable ? (
                            <button
                              type="button"
                              onClick={() =>
                                toggleSort(c.key as unknown as SortKey)
                              }
                              className={thBtnCls(isActive)}
                              title={c.headerTitle}
                            >
                              {c.header}{" "}
                              <span className="text-slate-400">
                                {showArrow}
                              </span>
                            </button>
                          ) : (
                            c.header
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {sortedRows.map((row, idx) => (
                    <tr key={idx} className="group border-t">
                      {columns.map((c) => {
                        const align =
                          c.align === "right" ? "text-right" : "text-left";

                        const content = c.cell(row);
                        const autoTitle = nodeToTitle(content);

                        // ✅ If truncating, we need a block wrapper w/ max width + truncate
                        const wrapClass = c.truncate
                          ? [
                              "truncate",
                              // pick a sensible default max width, can be overridden per column
                              c.maxWidthClassName ?? "max-w-[320px]",
                              // helps truncate work predictably
                              "block",
                            ].join(" ")
                          : undefined;

                        return (
                          <td
                            key={c.key}
                            className={[
                              "px-4 py-2 align-top",
                              align,
                              c.className,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {c.truncate ? (
                              <span className={wrapClass} title={autoTitle}>
                                {content}
                              </span>
                            ) : (
                              content
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
