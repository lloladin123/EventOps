export const SYSTEM_ROLE = {
  User: "Bruger",
  Admin: "Admin",
  Superadmin: "Superadmin",
} as const;

export type SystemRole = (typeof SYSTEM_ROLE)[keyof typeof SYSTEM_ROLE];

export const isSystemAdmin = (r: SystemRole | null | undefined) =>
  r === SYSTEM_ROLE.Admin || r === SYSTEM_ROLE.Superadmin;

export const isSystemSuperAdmin = (r: SystemRole | null | undefined) =>
  r === SYSTEM_ROLE.Superadmin;

export const SYSTEM_ROLE_GROUP = {
  AdminOnly: [SYSTEM_ROLE.Admin, SYSTEM_ROLE.Superadmin] as const,
  SuperadminOnly: [SYSTEM_ROLE.Superadmin] as const,
  All: [SYSTEM_ROLE.User, SYSTEM_ROLE.Admin, SYSTEM_ROLE.Superadmin] as const,
} as const;
