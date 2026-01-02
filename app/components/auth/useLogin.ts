"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/types/rsvp";
import type { CrewSubRole } from "./roles";

function makeUserId(role: string) {
  return `${role.toLowerCase()}_${Math.random().toString(16).slice(2, 6)}`;
}

export function useLogin() {
  const [role, setRole] = React.useState<Role | "">("");
  const [crewRole, setCrewRole] = React.useState<CrewSubRole | "">("");
  const router = useRouter();

  const canLogin = !!role && (role !== "Crew" || !!crewRole);

  const onChangeRole = (next: Role | "") => {
    setRole(next);
    if (next !== "Crew") setCrewRole("");
  };

  const login = () => {
    if (!role) return;
    if (role === "Crew" && !crewRole) return;

    const existingId = localStorage.getItem("userId");
    const userId = existingId ?? makeUserId(role);

    localStorage.setItem("role", role);
    localStorage.setItem("userId", userId);

    if (role === "Crew") {
      localStorage.setItem("crewRole", crewRole);
    } else {
      localStorage.removeItem("crewRole");
    }

    window.dispatchEvent(new Event("auth-changed"));

    router.replace("/events");
    router.refresh();
  };

  return {
    role,
    crewRole,
    setCrewRole,
    onChangeRole,
    canLogin,
    login,
  };
}
