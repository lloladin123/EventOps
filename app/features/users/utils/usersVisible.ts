// usersVisible.ts
import type { UserDoc } from "@/lib/firestore/users.client";
import type { SystemRole } from "@/types/systemRoles";

type UserRow = {
  uid: string;
  data: UserDoc & { systemRole?: SystemRole | null };
};

export function visibleNonAdminUsers(users: UserRow[]) {
  return users.filter(({ data }) => {
    const role = data.systemRole ?? null;
    return role !== "Admin" && role !== "Superadmin";
  });
}
