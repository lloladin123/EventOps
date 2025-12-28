"use client";

import * as React from "react";
import type { Role } from "@/types/rsvp";

export function useRole() {
  const [role, setRole] = React.useState<Role | null>(null);

  React.useEffect(() => {
    const read = () => {
      const raw = localStorage.getItem("role");
      setRole((raw ? raw.trim() : null) as Role | null);
    };

    read();
    window.addEventListener("auth-changed", read);
    window.addEventListener("storage", read);

    return () => {
      window.removeEventListener("auth-changed", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  return role;
}
