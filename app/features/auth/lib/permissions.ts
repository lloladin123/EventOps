"use client";

import { useAuth } from "@/features/auth/provider/AuthProvider";
import { ROLE, Role } from "@/types/rsvp";
import { SYSTEM_ROLE, type SystemRole } from "@/types/systemRoles";

const { Admin, Superadmin } = SYSTEM_ROLE;
const ADMIN = [Admin, Superadmin] as const;

type Rule = {
  system?: readonly SystemRole[];
  requireLogin?: boolean;
  requireAccepted?: boolean;

  // ✅ NEW: RSVP-based permission
  rsvpRoles?: readonly Role[];
  requireRsvpApproved?: boolean;
};

export type AccessCtx = {
  user: unknown | null | undefined;
  systemRole: SystemRole | null | undefined;

  // ✅ optional per-event context
  rsvpRole?: Role | null;
  rsvpApproved?: boolean | undefined;
};

export const PERMISSION = {
  auth: {
    loggedIn: "auth.loggedIn",
    accepted: "auth.accepted",
    bypass: "auth.bypass",
  },

  admin: { access: "admin.access" },

  requests: {
    dashboard: { view: "requests.dashboard.view" },
  },

  events: {
    details: { view: "events.details.view" },
    view: "events.view",
    create: "events.create",
    update: "events.update",
    delete: "events.delete",
    openToggle: "events.openToggle",
    rsvps: {
      selfWrite: "events.rsvps.self.write",
      adminManage: "events.rsvps.admin.manage",
    },

    incidents: { manage: "events.incidents.manage" },
  },

  users: {
    manage: "users.manage",
    rolesEdit: "users.roles.edit",
    dashboard: { view: "users.dashboard.view" },
  },

  config: { manage: "config.manage" },
  uploadSlots: { manage: "uploadSlots.manage" },
} as const;

type LeafValues<T> = T extends string
  ? T
  : T extends Record<string, any>
    ? { [K in keyof T]: LeafValues<T[K]> }[keyof T]
    : never;

export type Action = LeafValues<typeof PERMISSION>;

const PERMISSIONS: Record<Action, Rule> = {
  // auth building blocks
  [PERMISSION.auth.loggedIn]: { requireLogin: true },
  [PERMISSION.auth.accepted]: { requireLogin: true, requireAccepted: true },
  [PERMISSION.auth.bypass]: { system: ADMIN },

  // admin-ish
  [PERMISSION.admin.access]: { system: ADMIN },

  // requests
  [PERMISSION.requests.dashboard.view]: { system: ADMIN },

  // events
  [PERMISSION.events.details.view]: {
    system: ADMIN,
    rsvpRoles: [ROLE.Video, ROLE.Sikkerhedschef],
  },
  [PERMISSION.events.view]: { requireLogin: true, requireAccepted: true },
  [PERMISSION.events.create]: { system: ADMIN },
  [PERMISSION.events.update]: { system: ADMIN },
  [PERMISSION.events.delete]: { system: ADMIN },
  [PERMISSION.events.openToggle]: { system: ADMIN },

  [PERMISSION.events.incidents.manage]: { system: ADMIN },
  [PERMISSION.events.rsvps.adminManage]: { system: ADMIN },

  // users
  [PERMISSION.users.manage]: { system: ADMIN },
  [PERMISSION.users.rolesEdit]: { system: [Superadmin] },
  [PERMISSION.users.dashboard.view]: { system: ADMIN },

  // config / uploadSlots
  [PERMISSION.config.manage]: { system: ADMIN },
  [PERMISSION.uploadSlots.manage]: { system: ADMIN },

  // ownership-based later (Firestore)
  [PERMISSION.events.rsvps.selfWrite]: { requireLogin: true },
};

/**
 * ✅ NEW: Pure evaluator (NO hooks).
 * Use this in guards/components that might conditionally check permissions.
 */
export function canWith(action: Action, ctx: AccessCtx): boolean {
  const rule = PERMISSIONS[action];
  const { user, systemRole, rsvpRole, rsvpApproved } = ctx;

  if (rule.requireLogin && !user) return false;
  if (rule.requireAccepted && !systemRole) return false;

  // Superadmin override
  if (systemRole === Superadmin) return true;

  // ✅ system match
  const systemOk =
    !rule.system?.length || (!!systemRole && rule.system.includes(systemRole));

  // ✅ rsvp match (only relevant if rule declares it)
  const rsvpOk =
    !rule.rsvpRoles?.length ||
    (rsvpRole != null &&
      rule.rsvpRoles.includes(rsvpRole) &&
      (!rule.requireRsvpApproved || rsvpApproved === true));

  // If rule has rsvpRoles, allow if systemOk OR rsvpOk.
  // If rule doesn't have rsvpRoles, allow if systemOk (and requirements passed).
  if (rule.rsvpRoles?.length) return systemOk || rsvpOk;

  return systemOk;
}

/**
 * ⚠️ UPDATED: can() still exists, but it calls useAuth() (a hook).
 * Only safe if you call it unconditionally during render.
 *
 * In guards like LoginRedirect, prefer canWith().
 */
export function canAccess(action: Action): boolean {
  const { user, systemRole } = useAuth();
  return canWith(action, { user, systemRole });
}
