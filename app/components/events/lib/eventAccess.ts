import { isApproved } from "@/features//rsvp";
import { ROLE, Role } from "@/types/rsvp";
type Args = {
  eventId: string;
  uid: string | null | undefined;
  role: Role | null | undefined;
};

// Admin always allowed. Everyone else must be approved.
export function canAccessEventDetails({ eventId, uid, role }: Args): boolean {
  if (role === ROLE.Admin || role === ROLE.Logfører || ROLE.Sikkerhedsledelse)
    return true;
  if (!uid) return false;
  return isApproved(eventId, uid);
}
