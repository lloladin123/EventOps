// usersVisible.ts
import { ROLE } from "@/types/rsvp";
import type { Role } from "@/types/rsvp";
import type { UserDoc } from "@/lib//firestore/users.firestore";

export function visibleNonAdminUsers(
  users: Array<{ uid: string; data: UserDoc }>
) {
  return users.filter(({ data }) => (data.role as Role | null) !== ROLE.Admin);
}
