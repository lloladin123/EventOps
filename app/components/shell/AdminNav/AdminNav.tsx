"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/provider/AuthProvider";

import AdminNavLink from "./AdminNavLink";
import Badge from "../Badge";
import KbdHint from "./KbdHint";

import { useAdminRsvpRequestsCount } from "./hooks/useAdminRsvpRequestsCount";
import { useAdminNavKeybindings } from "./hooks/useAdminNavKeybindings";
import { cn } from "@/components/ui/utils/cn";
import { isSystemAdmin, isSystemSuperAdmin } from "@/types/systemRoles";

type AdminNavProps = {
  className?: string;
};

export default function AdminNav({ className }: AdminNavProps) {
  const { systemRole } = useAuth();
  const admin = isSystemAdmin(systemRole);
  const superAdmin = isSystemSuperAdmin(systemRole);
  const router = useRouter();

  const newRequestsCount = useAdminRsvpRequestsCount(admin);

  useAdminNavKeybindings(admin, router.push);

  return (
    <nav
      className={cn(
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
      {superAdmin && (
        <AdminNavLink
          href="/users"
          label={
            <span className="group inline-flex items-center">
              Brugere
              <KbdHint>g b</KbdHint>
            </span>
          }
        />
      )}

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
