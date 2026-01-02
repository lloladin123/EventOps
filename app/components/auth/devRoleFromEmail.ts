import type { Role, CrewSubRole } from "@/types/rsvp";

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

  if (admin && e === admin) return { role: "Admin", subRole: null };
  if (log && e === log) return { role: "Logfører", subRole: null };
  if (kontrol && e === kontrol) return { role: "Kontrollør", subRole: null };

  if (scan && e === scan) return { role: "Crew", subRole: "Scanning" };
  if (billet && e === billet) return { role: "Crew", subRole: "Billet salg" };
  if (bold && e === bold) return { role: "Crew", subRole: "Boldbørn" };

  return null;
}
