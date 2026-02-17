"use client";

import { SYSTEM_ROLE } from "@/types/systemRoles";
import type { SystemRole } from "@/types/systemRoles";

type Props = {
  roles?: readonly SystemRole[]; // 👈 make optional
  value?: SystemRole | "";
};

const PUBLIC_SYSTEM_ROLES = Object.values(SYSTEM_ROLE).filter(
  (r) => r !== SYSTEM_ROLE.Superadmin,
) as SystemRole[];

export function RoleOptions({ roles = [] }: Props) {
  const safeRoles = roles.filter((r) => PUBLIC_SYSTEM_ROLES.includes(r));

  return (
    <>
      <option value="" disabled>
        Select system role…
      </option>
      {safeRoles.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </>
  );
}
