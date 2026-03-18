import { isApproved } from "@/features/rsvp";
import { canWith, PERMISSION } from "@/features/auth/lib/permissions";
import type { SystemRole } from "@/types/systemRoles";
import type { Role } from "@/types/rsvp";

type Args = {
  eventId: string;
  uid: string | null | undefined;
  user: unknown | null | undefined;
  systemRole: SystemRole | null | undefined;
  rsvpRole: Role | null | undefined;
  rsvpApproved?: boolean | undefined;
};

export function canAccessEventDetails({
  eventId,
  uid,
  user,
  systemRole,
  rsvpRole,
  rsvpApproved,
}: Args): boolean {
  const hasPrivilegedAccess = canWith(PERMISSION.events.details.view, {
    user,
    systemRole,
    rsvpRole,
    rsvpApproved,
  });

  if (hasPrivilegedAccess) return true;

  if (!uid) return false;
  return isApproved(eventId, uid);
}
