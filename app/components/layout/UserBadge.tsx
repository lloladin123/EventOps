"use client";

import * as React from "react";
import type { Role } from "@/types/rsvp";

export default function UserBadge() {
  const [role, setRole] = React.useState<Role | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const read = () => {
      setRole(localStorage.getItem("role") as Role | null);
      setUserId(localStorage.getItem("userId"));
    };

    read(); // initial

    window.addEventListener("auth-changed", read);
    window.addEventListener("storage", read); // nice bonus (other tabs)

    return () => {
      window.removeEventListener("auth-changed", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  if (!role || !userId) {
    return <div className="text-sm text-slate-500">Ikke logget ind</div>;
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm">
      <span className="font-medium text-slate-900">ID</span>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
        {userId}
      </span>

      <span className="font-medium text-slate-900">Rolle</span>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
        {role}
      </span>
    </div>
  );
}
