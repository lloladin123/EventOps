"use client";
import { ROLE } from "@/types/rsvp";
import type { Role } from "@/types/rsvp";

const PUBLIC_ROLES = Object.values(ROLE).filter(
  (r) => r !== ROLE.Admin,
) as Role[];

export function RoleOptions({ roles }: { roles: readonly Role[] }) {
  // Only allow roles that are both:
  // 1) explicitly public
  // 2) passed into this component
  const safeRoles = roles.filter((r) => PUBLIC_ROLES.includes(r));

  return (
    <>
      <option value="" disabled>
        Select role…
      </option>
      {safeRoles.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </>
  );
}
