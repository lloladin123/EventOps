"use client";

import * as React from "react";
import type { Column, GroupMeta, SortState } from "./types";
import { sortRows, hasSortable } from "./sort";
import { nodeToTitle, tdClassName, wrapClassName } from "./cells";
import { groupBy } from "../../utils/groupBy";

type Props<
  Row,
  GroupId extends string,
  ColumnKey extends string,
  SortKey extends ColumnKey,
> = {
  rows: Row[];

  getGroupId: (row: Row) => GroupId;
  getGroupMeta: (groupId: GroupId, groupRows: Row[]) => GroupMeta;

  columns: Array<Column<Row, ColumnKey>>;
  sortHint?: React.ReactNode;
  tableMinWidthClassName?: string;

  getRowProps?: (row: Row) => React.HTMLAttributes<HTMLTableRowElement>;
  disableRowHover?: boolean;

  initialSort: SortState<SortKey>;

  filterGroupRows?: (groupId: GroupId, groupRows: Row[]) => Row[];
  renderGroupAfter?: (groupId: GroupId, groupRows: Row[]) => React.ReactNode;

  renderEmpty?: React.ReactNode | (() => React.ReactNode);
};

function useSortState<K extends string>(initial: SortState<K>) {
  const [sort, setSort] = React.useState<SortState<K>>(initial);
  const toggleSort = React.useCallback((key: K) => {
    setSort((prev) =>
      prev.key !== key
        ? { key, dir: "asc" }
        : { key, dir: prev.dir === "asc" ? "desc" : "asc" },
    );
  }, []);
  return { sort, toggleSort };
}

export default function GroupedTable<
  Row,
  GroupId extends string,
  ColumnKey extends string,
  SortKey extends ColumnKey,
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
  renderEmpty = null,
}: Props<Row, GroupId, ColumnKey, SortKey>) {
  const { sort } = useSortState(initialSort);
  const sortable = React.useMemo(() => hasSortable(columns), [columns]);

  const grouped = React.useMemo(
    () => groupBy(rows, getGroupId),
    [rows, getGroupId],
  );

  if (!rows.length) {
    return typeof renderEmpty === "function" ? (
      <>{renderEmpty()}</>
    ) : (
      <>{renderEmpty}</>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([groupId, groupRows]) => {
        const meta = getGroupMeta(groupId, groupRows);

        const visibleRows = filterGroupRows
          ? filterGroupRows(groupId, groupRows)
          : groupRows;
        const sortedRows = sortRows(visibleRows, sort, columns);

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
                {sortable && sortHint ? (
                  <div className="mt-1 text-xs text-slate-400">{sortHint}</div>
                ) : null}
              </div>
              {meta.right ? <div className="shrink-0">{meta.right}</div> : null}
            </div>

            <div className="overflow-x-auto">
              <table className={`${tableMinWidthClassName} w-full`}>
                <thead className="bg-slate-50">
                  {/* header rendering can go here */}
                </thead>

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
                          "focus:bg-amber-50 focus:outline-none",
                          "focus-within:bg-amber-50",
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
