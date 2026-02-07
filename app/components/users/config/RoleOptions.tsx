// RoleOptions.tsx
"use client";
import * as React from "react";
import { ROLE } from "@/types/rsvp";
import type { Role } from "@/types/rsvp";

export function RoleOptions({ roles }: { roles: readonly Role[] }) {
  return (
    <>
      <option value="" disabled>
        Select role…
      </option>
      {roles
        .filter((x) => x !== ROLE.Admin)
        .map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
    </>
  );
}
