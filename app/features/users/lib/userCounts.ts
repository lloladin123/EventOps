import type { UserDoc } from "@/lib/firestore/users.client";
import type { Role } from "@/types/rsvp";
import { ROLE } from "@/types/rsvp";

export type UserRow = { uid: string; data: UserDoc };

type CountUsersOpts = {
  excludeRoles?: readonly Role[];
};

export function countUsers(
  rows: readonly UserRow[],
  opts: CountUsersOpts = {},
) {
  const exclude = new Set<Role>(opts.excludeRoles ?? []);
  let n = 0;

  for (const r of rows) {
    const role = (r.data.role ?? null) as Role | null;
    if (role && exclude.has(role)) continue;
    n++;
  }
  return n;
}

export function countNonAdminUsers(rows: readonly UserRow[]) {
  return countUsers(rows, { excludeRoles: [ROLE.Admin] });
}

/** ✅ NEW: users that have no role assigned yet */
export function countUsersWithoutRole(rows: readonly UserRow[]) {
  let n = 0;
  for (const r of rows) {
    if (!r.data.role) n++;
  }
  return n;
}
