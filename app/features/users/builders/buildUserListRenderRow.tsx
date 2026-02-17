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

  // ui helpers
  flashUid: string | null;
  flash: (uid: string) => void;
  focusRoleSelect: (uid: string) => void;

  setRowRef: (uid: string, el: HTMLElement | null) => void;
  setRoleRef: (uid: string, el: HTMLSelectElement | null) => void;

  // confirm
  confirmDeleteUser: (uid: string, data: UserDoc) => boolean;
};

function SystemRolePicker({
  uid,
  role,
  systemRoles,
  setRoleRef,
  setUserSystemRole,
}: {
  uid: string;
  role: SystemRole | null;
  systemRoles: readonly SystemRole[];
  setRoleRef: (uid: string, el: HTMLSelectElement | null) => void;
  setUserSystemRole: (
    uid: string,
    nextRole: SystemRole | null,
  ) => void | Promise<void>;
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
      disabled={saving}
      onChange={(e) => {
        setSelected((e.target.value as SystemRole) ?? "");
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (selectedAsRole !== currentAsRole) commit(selectedAsRole);
        }
        if (e.key === "Escape") {
          setSelected(role ?? "");
          (e.currentTarget as HTMLSelectElement).blur();
        }
      }}
      onBlur={() => {
        if (selectedAsRole !== currentAsRole) commit(selectedAsRole);
      }}
      onPointerDownCapture={(e) => {
        e.stopPropagation();
        e.currentTarget.focus();
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

export function buildUserListRenderRow({
  systemRoles,
  setUserSystemRole,
  deleteUser,
  flashUid,
  flash,
  focusRoleSelect,
  setRowRef,
  setRoleRef,
  confirmDeleteUser,
}: Params) {
  return function renderRow(r: Row) {
    const displayName = r.data.displayName?.trim() || "—";
    const email = r.data.email?.trim() || "—";
    const systemRole = (r.data.systemRole ?? null) as SystemRole | null;

    return (
      <div
        ref={(el) => setRowRef(r.uid, el)}
        tabIndex={0}
        data-userfocus="row"
        data-uid={r.uid}
        onClick={(e) => {
          const t = e.target as HTMLElement | null;
          if (t?.closest("button,a,input,select,textarea,[role='button']"))
            return;

          flash(r.uid);
          (e.currentTarget as HTMLElement).focus();
        }}
        onKeyDown={(e) => {
          const t = e.target as HTMLElement | null;
          if (t && t !== e.currentTarget) return;

          if (e.key === " " || e.code === "Space") {
            e.preventDefault();
            focusRoleSelect(r.uid);
            return;
          }

          if (e.key === "Enter") {
            e.preventDefault();
            focusRoleSelect(r.uid);
          }
        }}
        className={[
          "flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between transition-colors duration-150",
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
            <div className="flex-1 min-w-0">
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
            />
          </div>
        </div>

        <div className="shrink-0 sm:pt-0.5">
          <button
            type="button"
            onClick={async () => {
              if (!confirmDeleteUser(r.uid, r.data)) return;
              await deleteUser(r.uid);
            }}
            className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 active:scale-[0.99]"
            title="Slet bruger"
            aria-label="Slet bruger"
          >
            Slet
          </button>
        </div>
      </div>
    );
  };
}
