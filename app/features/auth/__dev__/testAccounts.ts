import { SYSTEM_ROLE, type SystemRole } from "@/types/systemRoles";

type Creds = { email: string; password: string };

const BASE: Record<SystemRole, Creds> = {
  [SYSTEM_ROLE.User]: { email: "user@eventops.dev", password: "password123" },
  [SYSTEM_ROLE.Admin]: { email: "admin@eventops.dev", password: "password123" },
  [SYSTEM_ROLE.Superadmin]: {
    email: "superadmin@eventops.dev",
    password: "password123",
  },
};

export function getTestCreds(systemRole: SystemRole): Creds {
  const creds = BASE[systemRole];
  if (!creds) throw new Error(`Missing creds for systemRole ${systemRole}`);
  return creds;
}
