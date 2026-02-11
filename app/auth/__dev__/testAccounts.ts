import { type Role, type CrewSubRole, ROLE } from "@/types/rsvp";

type Creds = { email: string; password: string };

const BASE: Record<string, Creds> = {
  Admin: { email: "admin@eventops.dev", password: "password123" },
  Logfører: { email: "log@eventops.dev", password: "password123" },
  Kontrollør: { email: "kontrol@eventops.dev", password: "password123" },

  "Crew:Scanning": { email: "scan@eventops.dev", password: "password123" },
  "Crew:Billet salg": { email: "billet@eventops.dev", password: "password123" },
  "Crew:Boldbørn": { email: "bold@eventops.dev", password: "password123" },
};

export function getTestCreds(role: Role, subRole?: CrewSubRole | null): Creds {
  if (role === ROLE.Crew) {
    if (!subRole) throw new Error("Crew subrole required");
    const key = `Crew:${subRole}`;
    const creds = BASE[key];
    if (!creds) throw new Error(`Missing creds for ${key}`);
    return creds;
  }

  const creds = BASE[role];
  if (!creds) throw new Error(`Missing creds for role ${role}`);
  return creds;
}
