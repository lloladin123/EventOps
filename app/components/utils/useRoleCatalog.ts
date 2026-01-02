"use client";

import * as React from "react";
import type { Role, CrewSubRole } from "@/types/rsvp";
import { ROLES, CREW_SUBROLES } from "@/types/rsvp";
import { fetchRolesConfig } from "@/utils/users.firestore";

export function useRoleCatalog() {
  const [roles, setRoles] = React.useState<readonly Role[]>(ROLES);
  const [crewSubRoles, setCrewSubRoles] =
    React.useState<readonly CrewSubRole[]>(CREW_SUBROLES);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const cfg = await fetchRolesConfig();
        if (!alive || !cfg) return;

        if (Array.isArray(cfg.roles)) setRoles(cfg.roles);
        if (Array.isArray(cfg.crewSubRoles)) setCrewSubRoles(cfg.crewSubRoles);
      } catch {
        // ignore
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { roles, crewSubRoles };
}
