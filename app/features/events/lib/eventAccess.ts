import { isApproved } from "@/features/rsvp";
import { isSystemAdmin, type SystemRole } from "@/types/systemRoles";
import { ROLE, type Role } from "@/types/rsvp";

type Args = {
  eventId: string;
  uid: string | null | undefined;
  systemRole: SystemRole | null | undefined;
  rsvpRole: Role | null | undefined; // ✅ event-scoped role
};

// System admins always allowed.
// Otherwise: Video (RSVP role) allowed.
// Otherwise: must be approved.
export function canAccessEventDetails({
  eventId,
  uid,
  systemRole,
  rsvpRole,
}: Args): boolean {
  if (isSystemAdmin(systemRole)) return true;

  // ✅ RSVP-based special access
  if (rsvpRole === ROLE.Video || rsvpRole === ROLE.Sikkerhedschef) return true;

  if (!uid) return false;
  return isApproved(eventId, uid);
}
