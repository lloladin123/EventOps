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
    next: CrewSubRole | null,
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
      className="className={`
    h-7 min-w-[160px]
    rounded-xl border border-slate-200
    bg-white px-3
    text-sm text-slate-900
    shadow-sm
    transition
    hover:border-slate-300
    focus:border-slate-900 focus:ring-1 focus:ring-slate-900
    disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      value={subRole ?? ""}
      onChange={(e) =>
        setUserSubRole(
          uid,
          e.target.value ? (e.target.value as CrewSubRole) : null,
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
