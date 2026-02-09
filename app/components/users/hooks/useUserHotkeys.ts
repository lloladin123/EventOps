"use client";

import * as React from "react";

type UserLike = {
  uid: string;
  data: { displayName?: string | null; email?: string | null };
};

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

const ROW_SELECTOR = '[data-userfocus="row"][data-uid]';

function currentRowElFromFocus(): HTMLElement | null {
  const a = document.activeElement as HTMLElement | null;
  if (!a) return null;
  return a.closest<HTMLElement>(ROW_SELECTOR) ?? null;
}

function currentUidFromFocus(): string | null {
  const row = currentRowElFromFocus();
  return row?.getAttribute("data-uid") ?? null;
}

function orderedRowEls(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(ROW_SELECTOR));
}

function defaultDeleteLabel<TUser extends UserLike>(row: TUser) {
  return (
    row.data.displayName?.trim() ||
    row.data.email?.trim() ||
    row.uid.slice(0, 8)
  );
}

function useLatestRef<T>(value: T) {
  const ref = React.useRef(value);
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

type Params<TUser extends UserLike> = {
  enabled: boolean;
  users: readonly TUser[];
  onJumpMissing: (fromUid: string | null, dir: 1 | -1) => void;
  onDeleteUser: (uid: string) => void | Promise<void>;

  getDeleteLabel?: (row: TUser) => string;
  confirmDelete?: (label: string, row: TUser) => boolean;
};

export function useUserHotkeys<TUser extends UserLike>({
  enabled,
  users,
  onJumpMissing,
  onDeleteUser,
  getDeleteLabel = defaultDeleteLabel,
  confirmDelete = (label) =>
    window.confirm(`Slet bruger "${label}"?\n\nDette kan ikke fortrydes.`),
}: Params<TUser>) {
  const enabledRef = useLatestRef(enabled);
  const usersRef = useLatestRef(users);
  const onJumpMissingRef = useLatestRef(onJumpMissing);
  const onDeleteUserRef = useLatestRef(onDeleteUser);
  const getDeleteLabelRef = useLatestRef(getDeleteLabel);
  const confirmDeleteRef = useLatestRef(confirmDelete);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!enabledRef.current) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      const key = e.key;

      // ✅ Arrow navigation by DOM order (respects sorting)
      if (key === "ArrowDown" || key === "ArrowUp") {
        const dir: 1 | -1 = key === "ArrowDown" ? 1 : -1;

        // Shift+Arrow: keep your "missing role" jump behavior
        if (e.shiftKey) {
          e.preventDefault();
          const uidNow = currentUidFromFocus();
          onJumpMissingRef.current(uidNow, dir);
          return;
        }

        const rows = orderedRowEls();
        if (rows.length === 0) return;

        e.preventDefault();

        const cur = currentRowElFromFocus();
        const idx = cur ? rows.indexOf(cur) : -1;

        const nextIndex = (idx + dir + rows.length) % rows.length;
        rows[nextIndex]?.focus();
        return;
      }

      // n / Shift+n => cycle missing role
      if (key === "n" || key === "N") {
        e.preventDefault();
        const uidNow = currentUidFromFocus();
        onJumpMissingRef.current(uidNow, e.shiftKey ? -1 : 1);
        return;
      }

      // s => delete focused user
      if (key === "s" || key === "S") {
        e.preventDefault();

        const uidNow = currentUidFromFocus();
        if (!uidNow) return;

        const row = usersRef.current.find((u) => u.uid === uidNow);
        if (!row) return;

        const label = getDeleteLabelRef.current(row);
        if (!confirmDeleteRef.current(label, row)) return;

        void onDeleteUserRef.current(uidNow);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
