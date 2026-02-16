export const SYSTEM_ROLE = {
  User: "user",
  Support: "support",
  Admin: "admin",
  Superadmin: "superadmin",
} as const;

export type SystemRole = (typeof SYSTEM_ROLE)[keyof typeof SYSTEM_ROLE];

export const isSystemAdmin = (r: SystemRole | null | undefined) =>
  r === SYSTEM_ROLE.Admin || r === SYSTEM_ROLE.Superadmin;

export const isSystemStaff = (r: SystemRole | null | undefined) =>
  r === SYSTEM_ROLE.Support || isSystemAdmin(r);
