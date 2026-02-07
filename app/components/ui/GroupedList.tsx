"use client";

import * as React from "react";

type GroupMeta = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
};

type Props<Row, GroupId extends string> = {
  rows: Row[];

  getGroupId: (row: Row) => GroupId;
  getGroupMeta: (groupId: GroupId, groupRows: Row[]) => GroupMeta;

  getRowKey: (row: Row) => string;
  renderRow: (row: Row) => React.ReactNode;

  sortHint?: React.ReactNode;

  // ✅ NEW: filter the rows shown in the main list per group
  filterGroupRows?: (groupId: GroupId, groupRows: Row[]) => Row[];

  // ✅ NEW: render extra content under each group (e.g. a "No" section)
  renderGroupAfter?: (groupId: GroupId, groupRows: Row[]) => React.ReactNode;

  className?: string;
};

export default function GroupedList<Row, GroupId extends string>({
  rows,
  getGroupId,
  getGroupMeta,
  getRowKey,
  renderRow,
  filterGroupRows,
  renderGroupAfter,
  sortHint,
  className,
}: Props<Row, GroupId>) {
  const grouped = React.useMemo(() => {
    const map = new Map<GroupId, Row[]>();
    for (const r of rows) {
      const gid = getGroupId(r);
      if (!map.has(gid)) map.set(gid, []);
      map.get(gid)!.push(r);
    }
    return map;
  }, [rows, getGroupId]);

  if (!rows.length) return null;

  return (
    <div className={["space-y-4", className].filter(Boolean).join(" ")}>
      {Array.from(grouped.entries()).map(([groupId, groupRows]) => {
        const meta = getGroupMeta(groupId, groupRows);

        const visibleRows = filterGroupRows
          ? filterGroupRows(groupId, groupRows)
          : groupRows;

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

                {sortHint ? (
                  <div className="mt-1 text-xs text-slate-400">{sortHint}</div>
                ) : null}
              </div>

              {meta.right ? <div className="shrink-0">{meta.right}</div> : null}
            </div>

            {/* Rows */}
            <ul className="divide-y divide-slate-200">
              {visibleRows.map((row) => (
                <li key={getRowKey(row)}>{renderRow(row)}</li>
              ))}
            </ul>

            {/* Extra content under each group */}
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
