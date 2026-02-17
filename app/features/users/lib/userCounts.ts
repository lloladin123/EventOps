import type { UserDoc } from "@/lib/firestore/users.client";
import type { SystemRole } from "@/types/systemRoles";

export type UserRow = {
  uid: string;
  data: UserDoc & { systemRole?: SystemRole | null };
};

type CountUsersOpts = {
  excludeSystemRoles?: readonly SystemRole[];
};

export function countUsers(
  rows: readonly UserRow[],
  opts: CountUsersOpts = {},
) {
  const exclude = new Set<SystemRole>(opts.excludeSystemRoles ?? []);
  let n = 0;

  for (const r of rows) {
    const role = (r.data.systemRole ?? null) as SystemRole | null;
    if (role && exclude.has(role)) continue;
    n++;
  }
  return n;
}

/** Count users that are NOT admins/superadmins */
export function countNonAdminUsers(rows: readonly UserRow[]) {
  return countUsers(rows, {
    excludeSystemRoles: ["Admin", "Superadmin"],
  });
}

/** Users that have no system role assigned yet (or default "Bruger") */
export function countUsersWithoutRole(rows: readonly UserRow[]) {
  let n = 0;
  for (const r of rows) {
    const role = r.data.systemRole ?? null;
    if (!role || role === "Bruger") n++;
  }
  return n;
}
