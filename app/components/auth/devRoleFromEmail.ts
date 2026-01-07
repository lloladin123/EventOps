import { type Role, type CrewSubRole, ROLE, CREW_SUBROLE } from "@/types/rsvp";

export function devRoleFromEmail(email: string | null): {
  role: Role;
  subRole: CrewSubRole | null;
} | null {
  if (!email) return null;

  const e = email.trim().toLowerCase();

  const admin = process.env.NEXT_PUBLIC_TEST_ADMIN_EMAIL?.trim().toLowerCase();
  const log = process.env.NEXT_PUBLIC_TEST_LOG_EMAIL?.trim().toLowerCase();
  const kontrol =
    process.env.NEXT_PUBLIC_TEST_KONTROL_EMAIL?.trim().toLowerCase();

  const scan =
    process.env.NEXT_PUBLIC_TEST_CREW_SCAN_EMAIL?.trim().toLowerCase();
  const billet =
    process.env.NEXT_PUBLIC_TEST_CREW_BILLET_EMAIL?.trim().toLowerCase();
  const bold =
    process.env.NEXT_PUBLIC_TEST_CREW_BOLD_EMAIL?.trim().toLowerCase();

  if (admin && e === admin) return { role: ROLE.Admin, subRole: null };

  if (log && e === log) return { role: ROLE.Logfører, subRole: null };

  if (kontrol && e === kontrol) return { role: ROLE.Kontrollør, subRole: null };

  if (scan && e === scan)
    return { role: ROLE.Crew, subRole: CREW_SUBROLE.Scanning };

  if (billet && e === billet)
    return { role: ROLE.Crew, subRole: CREW_SUBROLE.BilletSalg };

  if (bold && e === bold)
    return { role: ROLE.Crew, subRole: CREW_SUBROLE.Boldbørn };

  return null;
}
