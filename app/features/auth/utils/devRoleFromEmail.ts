import { ROLE, CREW_SUBROLE, type Role, type CrewSubRole } from "@/types/rsvp";

type RoleAssignment = { role: Role; subRole: CrewSubRole | null };

function normEmail(v: string | undefined | null) {
  return v?.trim().toLowerCase() || null;
}

const DEV_ROLE_RULES = [
  {
    email: process.env.NEXT_TEST_ADMIN_EMAIL,
    value: { role: ROLE.Admin, subRole: null },
  },
  {
    email: process.env.NEXT_TEST_LOG_EMAIL,
    value: { role: ROLE.Logfører, subRole: null },
  },
  {
    email: process.env.NEXT_TEST_KONTROL_EMAIL,
    value: { role: ROLE.Kontrollør, subRole: null },
  },
  {
    email: process.env.NEXT_TEST_CREW_SCAN_EMAIL,
    value: { role: ROLE.Crew, subRole: CREW_SUBROLE.Scanning },
  },
  {
    email: process.env.NEXT_TEST_CREW_BILLET_EMAIL,
    value: { role: ROLE.Crew, subRole: CREW_SUBROLE.BilletSalg },
  },
  {
    email: process.env.NEXT_TEST_CREW_BOLD_EMAIL,
    value: { role: ROLE.Crew, subRole: CREW_SUBROLE.Boldbørn },
  },
] satisfies ReadonlyArray<{ email: string | undefined; value: RoleAssignment }>;

export function devRoleFromEmail(email: string | null): RoleAssignment | null {
  const e = normEmail(email);
  if (!e) return null;

  for (const rule of DEV_ROLE_RULES) {
    const env = normEmail(rule.email);
    if (env && env === e) return rule.value;
  }
  return null;
}
