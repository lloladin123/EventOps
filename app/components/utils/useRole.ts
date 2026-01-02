"use client";

import * as React from "react";
import type { Role } from "@/types/rsvp";

function readRole(): Role | null {
  const raw = localStorage.getItem("role");
  const value = raw ? raw.trim() : "";
  return (value || null) as Role | null;
}

export function useRole() {
  const [role, setRole] = React.useState<Role | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const read = () => {
      setRole(readRole());
      setReady(true);
    };

    read();
    window.addEventListener("auth-changed", read);
    window.addEventListener("storage", read);

    return () => {
      window.removeEventListener("auth-changed", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  return {
    role,
    ready,
    isAdmin: role === "Admin",
    isLogfører: role === "Logfører",
    isKontrollør: role === "Kontrollør",
    isCrew: role === "Crew",
  };
}
