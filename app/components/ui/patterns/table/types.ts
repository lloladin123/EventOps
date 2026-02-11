import * as React from "react";

export type SortDir = "asc" | "desc";
export type SortState<K extends string> = { key: K; dir: SortDir };

export type Column<Row, ColumnKey extends string> = {
  key: ColumnKey;
  header: React.ReactNode;
  headerTitle?: string;
  className?: string;

  sortValue?: (row: Row) => string | number;
  cell: (row: Row) => React.ReactNode;

  align?: "left" | "right";
  truncate?: boolean;
  maxWidthClassName?: string;
};

export type GroupMeta = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
};
