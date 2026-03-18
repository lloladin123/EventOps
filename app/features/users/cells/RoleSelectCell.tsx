"use client";

import * as React from "react";
import { SYSTEM_ROLE } from "@/types/systemRoles";
import type { SystemRole } from "@/types/systemRoles";

import { roleSelectClass } from "../config/userSelectStyles";
import { RoleOptions } from "../config/RoleOptions";

type Props = {
  uid: string;
  role: SystemRole | null;
  systemRoles: readonly SystemRole[];
  setRoleRef: (uid: string, el: HTMLSelectElement | null) => void;
  setUserSystemRole: (
    uid: string,
    nextRole: SystemRole | null,
  ) => void | Promise<void>;
  disabled?: boolean;
};

export function RoleSelectCell({
  uid,
  role,
  systemRoles,
  setRoleRef,
  setUserSystemRole,
  disabled = false,
}: Props) {
  const [selected, setSelected] = React.useState<SystemRole | "">(role ?? "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (saving) return;
    setSelected(role ?? "");
  }, [role, saving]);

  return (
    <select
      ref={(el) => setRoleRef(uid, el)}
      data-uid={uid}
      className={roleSelectClass(false)}
      value={selected}
      tabIndex={-1}
      disabled={disabled || saving}
      onKeyDown={(e) => {
        if (disabled) return;

        if (e.key === "Escape") {
          e.preventDefault();
          (e.currentTarget as HTMLSelectElement).blur();
          const row = (e.currentTarget as HTMLElement).closest(
            "[data-uid]",
          ) as HTMLElement | null;
          row?.focus();
        }
      }}
      onChange={async (e) => {
        if (disabled) return;

        const row = (e.currentTarget as HTMLElement).closest(
          "[data-uid]",
        ) as HTMLElement | null;

        const nextRole: SystemRole | null =
          e.target.value === "" ? null : (e.target.value as SystemRole);

        if (nextRole === SYSTEM_ROLE.Superadmin) return;

        const prev = selected;
        setSelected(nextRole ?? "");
        setSaving(true);

        try {
          await Promise.resolve(setUserSystemRole(uid, nextRole));
        } catch (err) {
          console.error("Failed to set systemRole", err);
          setSelected(prev);
        } finally {
          setSaving(false);
          requestAnimationFrame(() => row?.focus());
        }
      }}
      onPointerDownCapture={(e) => {
        e.stopPropagation();
        if (!disabled) e.currentTarget.focus();
      }}
    >
      <RoleOptions roles={systemRoles} value={selected} />
    </select>
  );
}
