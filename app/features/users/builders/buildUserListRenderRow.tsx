"use client";

import * as React from "react";
import type { UserDoc } from "@/lib/firestore/users.client";
import { SYSTEM_ROLE } from "@/types/systemRoles";
import type { SystemRole } from "@/types/systemRoles";

import { roleSelectClass } from "../config/userSelectStyles";

type Row = { uid: string; data: UserDoc };

type Params = {
  systemRoles: readonly SystemRole[];
  setUserSystemRole: (
    uid: string,
    nextRole: SystemRole | null,
  ) => void | Promise<void>;
  deleteUser: (uid: string) => void | Promise<void>;

  flashUid: string | null;
  flash: (uid: string) => void;
  focusRoleSelect: (uid: string) => void;

  setRowRef: (uid: string, el: HTMLElement | null) => void;
  setRoleRef: (uid: string, el: HTMLSelectElement | null) => void;

  canEditRoles: boolean;
  canManageUsers: boolean;

  confirmDeleteUser: (uid: string, data: UserDoc) => boolean;
  pendingDeleteUids: string[];
};

function SystemRolePicker({
  uid,
  role,
  systemRoles,
  setRoleRef,
  setUserSystemRole,
  disabled = false,
}: {
  uid: string;
  role: SystemRole | null;
  systemRoles: readonly SystemRole[];
  setRoleRef: (uid: string, el: HTMLSelectElement | null) => void;
  setUserSystemRole: (
    uid: string,
    nextRole: SystemRole | null,
  ) => void | Promise<void>;
  disabled?: boolean;
}) {
  const [selected, setSelected] = React.useState<SystemRole | "">(role ?? "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (saving) return;
    setSelected(role ?? "");
  }, [role, saving]);

  const selectedAsRole: SystemRole | null =
    selected === "" ? null : (selected as SystemRole);

  const currentAsRole: SystemRole | null = role ?? null;

  const commit = async (next: SystemRole | null) => {
    if (disabled) return;
    if (next === SYSTEM_ROLE.Superadmin) return;

    const prev = selected;
    setSaving(true);
    try {
      await Promise.resolve(setUserSystemRole(uid, next));
    } catch (err) {
      console.error("Failed to set systemRole", err);
      setSelected(prev);
    } finally {
      setSaving(false);
    }
  };

  const effectiveRoles = systemRoles?.length
    ? systemRoles
    : (Object.values(SYSTEM_ROLE) as SystemRole[]);

  return (
    <select
      ref={(el) => setRoleRef(uid, el)}
      data-uid={uid}
      className={roleSelectClass(false)}
      value={selected}
      disabled={disabled || saving}
      onChange={(e) => {
        setSelected((e.target.value as SystemRole) ?? "");
      }}
      onKeyDown={(e) => {
        if (disabled) return;

        if (e.key === "Enter") {
          e.preventDefault();
          if (selectedAsRole !== currentAsRole) void commit(selectedAsRole);
        }

        if (e.key === "Escape") {
          setSelected(role ?? "");
          (e.currentTarget as HTMLSelectElement).blur();
        }
      }}
      onBlur={() => {
        if (disabled) return;
        if (selectedAsRole !== currentAsRole) void commit(selectedAsRole);
      }}
      onPointerDownCapture={(e) => {
        e.stopPropagation();
        if (!disabled) e.currentTarget.focus();
      }}
    >
      <option value="" disabled>
        Select system role…
      </option>

      {effectiveRoles
        .filter((r) => r !== SYSTEM_ROLE.Superadmin)
        .map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
    </select>
  );
}

function UserRow({
  r,
  systemRoles,
  setUserSystemRole,
  deleteUser,
  flashUid,
  flash,
  focusRoleSelect,
  setRowRef,
  setRoleRef,
  canEditRoles,
  canManageUsers,
  confirmDeleteUser,
  pendingDeleteUids,
}: {
  r: Row;
} & Params) {
  const deleting = pendingDeleteUids.includes(r.uid);
  const displayName = r.data.displayName?.trim() || "—";
  const email = r.data.email?.trim() || "—";
  const systemRole = (r.data.systemRole ?? null) as SystemRole | null;

  const handleDelete = async () => {
    if (deleting) return;
    if (!confirmDeleteUser(r.uid, r.data)) return;

    try {
      await deleteUser(r.uid);
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };
  return (
    <div
      ref={(el) => setRowRef(r.uid, el)}
      tabIndex={0}
      data-userfocus="row"
      data-uid={r.uid}
      onClick={(e) => {
        const t = e.target as HTMLElement | null;
        if (t?.closest("button,a,input,select,textarea,[role='button']")) {
          return;
        }

        flash(r.uid);
        (e.currentTarget as HTMLElement).focus();
      }}
      onKeyDown={(e) => {
        const t = e.target as HTMLElement | null;
        if (t && t !== e.currentTarget) return;

        if ((e.key === " " || e.code === "Space") && canEditRoles) {
          e.preventDefault();
          focusRoleSelect(r.uid);
          return;
        }

        if (e.key === "Enter" && canEditRoles) {
          e.preventDefault();
          focusRoleSelect(r.uid);
        }
      }}
      className={[
        "flex flex-col gap-3 p-4 transition-colors duration-150 sm:flex-row sm:items-start sm:justify-between",
        "focus:bg-amber-100 focus:outline-none",
        flashUid === r.uid ? "bg-amber-100" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-slate-900">
          {displayName}
        </div>

        <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
          <div className="min-w-0 flex-1">
            <dt className="font-semibold text-slate-500">Email</dt>
            <dd className="truncate text-slate-700">{email}</dd>
          </div>

          <div className="min-w-0 flex-1">
            <dt className="font-semibold text-slate-500">UID</dt>
            <dd className="text-slate-700">
              <code className="block truncate text-slate-700" title={r.uid}>
                {r.uid}
              </code>
            </dd>
          </div>
        </dl>

        <div className="mt-3">
          <div className="mb-1 text-xs font-semibold text-slate-600">
            System role
          </div>

          <SystemRolePicker
            uid={r.uid}
            role={systemRole}
            systemRoles={systemRoles}
            setRoleRef={setRoleRef}
            setUserSystemRole={setUserSystemRole}
            disabled={!canEditRoles || deleting}
          />
        </div>
      </div>

      {canManageUsers ? (
        <div className="shrink-0 sm:pt-0.5">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className={[
              "inline-flex min-w-[92px] items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
              deleting
                ? "cursor-not-allowed border-rose-200 bg-rose-50 text-rose-500 opacity-70"
                : "border-rose-200 bg-white text-rose-700 hover:bg-rose-50 active:scale-[0.99]",
            ].join(" ")}
            title={deleting ? "Sletter bruger..." : "Slet bruger"}
            aria-label={deleting ? "Sletter bruger" : "Slet bruger"}
            aria-busy={deleting}
          >
            {deleting ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Sletter...
              </span>
            ) : (
              "Slet"
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function buildUserListRenderRow(params: Params) {
  return function renderRow(r: Row) {
    return <UserRow key={r.uid} r={r} {...params} />;
  };
}
