// userSelectStyles.ts
export function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const baseSelect =
  "w-full rounded-md border bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2";

export function roleSelectClass(pending: boolean) {
  return cx(
    baseSelect,
    pending
      ? "border-amber-400 ring-amber-200 focus:ring-amber-400"
      : "border-slate-200 ring-slate-300 focus:ring-slate-400"
  );
}

export const neutralSelectClass = cx(
  baseSelect,
  "border-slate-200 ring-slate-300 focus:ring-slate-400"
);
