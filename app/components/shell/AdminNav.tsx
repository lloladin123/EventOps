"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features//auth/provider/AuthProvider";
import { isAdmin } from "@/types/rsvp";

import { cx } from "./cx";
import AdminNavLink from "./AdminNavLink";
import Badge from "./Badge";
import KbdHint from "./KbdHint";

import { useAdminRsvpRequestsCount } from "./hooks/useAdminRsvpRequestsCount";
import { useUsersWithoutRoleCount } from "./hooks/useUsersWithoutRoleCount";
import { useAdminNavKeybindings } from "./hooks/useAdminNavKeybindings";

type AdminNavProps = {
  className?: string;
};

export default function AdminNav({ className }: AdminNavProps) {
  const { role } = useAuth();
  const admin = isAdmin(role);
  const router = useRouter();

  const newRequestsCount = useAdminRsvpRequestsCount(admin);
  const usersNoRoleCount = useUsersWithoutRoleCount(admin);

  useAdminNavKeybindings(admin, router.push);

  return (
    <nav
      className={cx(
        "flex flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:gap-2",
        className,
      )}
      aria-label="Admin navigation"
    >
      <AdminNavLink
        href="/events"
        label={
          <span className="group inline-flex items-center">
            Events
            <KbdHint>g e</KbdHint>
          </span>
        }
      />

      <AdminNavLink
        href="/users"
        label={
          <span className="group inline-flex items-center">
            Brugere
            {admin && <Badge count={usersNoRoleCount} tone="amber" />}
            <KbdHint>g b</KbdHint>
          </span>
        }
      />

      <AdminNavLink
        href="/requests"
        label={
          <span className="group inline-flex items-center">
            Anmodninger
            {admin && <Badge count={newRequestsCount} tone="amber" />}
            <KbdHint>g a</KbdHint>
          </span>
        }
      />
    </nav>
  );
}
