"use client";

import * as React from "react";
import type { Role } from "@/types/rsvp";
import { roleSelectClass } from "../config/userSelectStyles";
import { RoleOptions } from "../config/RoleOptions";
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
      className={roleSelectClass(pending)}
      value={role ?? ""}
      onKeyDown={onKeyDown}
      onChange={onChange}
    >
      {/* ✅ reset / placeholder */}
      <option value="">{role ? "— Nulstil rolle —" : "Vælg rolle…"}</option>

      <RoleOptions roles={roles} />
    </select>
  );
}
