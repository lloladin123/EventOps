import { ROLE, type Role } from "@/types/rsvp";
import { isApproved } from "@/components/utils/rsvpIndex/index";

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
