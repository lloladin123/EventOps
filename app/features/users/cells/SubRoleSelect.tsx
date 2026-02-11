"use client";

import * as React from "react";
import { ROLE } from "@/types/rsvp";
import type { Role, CrewSubRole } from "@/types/rsvp";

type Props = {
  uid: string;
  role: Role | null;
  subRole: CrewSubRole | null;
  crewSubRoles: readonly CrewSubRole[];
  setSubRoleRef?: (uid: string, el: HTMLSelectElement | null) => void;
  setUserSubRole: (
    uid: string,
    next: CrewSubRole | null
  ) => void | Promise<void>;
};

export function SubRoleSelect({
  uid,
  role,
  subRole,
  crewSubRoles,
  setSubRoleRef,
  setUserSubRole,
}: Props) {
  const isCrew = role === ROLE.Crew;

  if (!isCrew) return <span className="text-sm text-slate-400">—</span>;

  return (
    <select
      ref={(el) => setSubRoleRef?.(uid, el)}
      data-uid={uid}
      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
      value={subRole ?? ""}
      onChange={(e) =>
        setUserSubRole(
          uid,
          e.target.value ? (e.target.value as CrewSubRole) : null
        )
      }
    >
      <option value="">(none)</option>
      {crewSubRoles.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
