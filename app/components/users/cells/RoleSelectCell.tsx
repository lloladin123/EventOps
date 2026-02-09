"use client";

import * as React from "react";
import type { Role } from "@/types/rsvp";
import { ROLE } from "@/types/rsvp";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { roleSelectClass } from "../config/userSelectStyles";
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
  const pending = !role;

  const { user, role: myRole } = useAuth();

  const isSelf = user?.uid === uid;
  const isAdmin = myRole === ROLE.Admin;
  const isSafetyManager = myRole === ROLE.Sikkerhedsledelse;

  // ❌ Rule 1: SafetyManager cannot edit themself
  const disableSelect = isSafetyManager && !isAdmin && isSelf;

  // ❌ Rule 2: SafetyManager cannot promote to SafetyManager
  const visibleRoles =
    isSafetyManager && !isAdmin
      ? roles.filter((r) => r !== ROLE.Sikkerhedsledelse)
      : roles;

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
      className={roleSelectClass(pending || disableSelect)}
      value={role ?? ""}
      disabled={disableSelect}
      onKeyDown={onKeyDown}
      onChange={onChange}
    >
      {/* reset / placeholder */}
      <option value="">{role ? "— Nulstil rolle —" : "Vælg rolle…"}</option>

      {visibleRoles.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
