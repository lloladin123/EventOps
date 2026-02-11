"use client";

import type { Role } from "@/types/rsvp";
import { ROLE } from "@/types/rsvp";
import { useAuth } from "@/features/auth/provider/AuthProvider";
import { useRoleSelectHandlers } from "../hooks/useRoleSelectHandlers";

type Props = {
  uid: string;
  role: Role | null;
  roles: readonly Role[];
  setRoleRef?: (uid: string, el: HTMLSelectElement | null) => void;
  setUserRole: (uid: string, nextRole: Role | null) => void | Promise<void>;
  focusSubRoleSelect: (uid: string) => void;
  focusMissingRelative: (fromUid: string | null, dir: 1 | -1) => void;
};

export function RoleSelectCell({
  uid,
  role,
  roles,
  setRoleRef,
  setUserRole,
  focusSubRoleSelect,
  focusMissingRelative,
}: Props) {
  const { user, role: myRole } = useAuth();

  const isSelf = user?.uid === uid;
  const isAdmin = myRole === ROLE.Admin;
  const isSafetyManager = myRole === ROLE.Sikkerhedsledelse;

  // ❌ Rule 1: SafetyManager cannot edit themself
  const disableSelect = isSafetyManager && !isAdmin && isSelf;

  // ❌ Rule 2: SafetyManager cannot promote to SafetyManager
  const visibleRoles = roles.filter((r) => {
    if (r === ROLE.Admin) return false; // never show Admin
    if (r === ROLE.Sikkerhedsledelse && !isAdmin) return false; // only Admin sees it
    return true;
  });

  const { onKeyDown, onChange } = useRoleSelectHandlers({
    uid,
    setUserRole,
    focusSubRoleSelect,
    focusMissingRelative,
  });

  return (
    <select
      ref={(el) => setRoleRef?.(uid, el)}
      data-uid={uid}
      value={role ?? ""}
      disabled={disableSelect}
      onKeyDown={onKeyDown}
      onChange={onChange}
      className={`
    h-7 min-w-[160px]
    rounded-xl border border-slate-200
    bg-white px-3
    text-sm text-slate-900
    shadow-sm
    transition
    hover:border-slate-300
    focus:border-slate-900 focus:ring-1 focus:ring-slate-900
    disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400
  `}
    >
      <option value="" disabled>
        Vælg rolle
      </option>

      {visibleRoles.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
