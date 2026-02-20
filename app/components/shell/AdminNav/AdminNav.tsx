"use client";

import { useRouter } from "next/navigation";

import AdminNavLink from "./AdminNavLink";
import Badge from "../Badge";
import KbdHint from "./KbdHint";

import { useAdminRsvpRequestsCount } from "./hooks/useAdminRsvpRequestsCount";
import { useAdminNavKeybindings } from "./hooks/useAdminNavKeybindings";
import { cn } from "@/components/ui/utils/cn";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { PERMISSION } from "@/features/auth/lib/permissions";

type AdminNavProps = {
  className?: string;
};

export default function AdminNav({ className }: AdminNavProps) {
  const access = useAccess();
  const viewRequests = access.canAccess(PERMISSION.requests.dashboard.view);
  const viewUsers = access.canAccess(PERMISSION.users.dashboard.view);
  const router = useRouter();

  const newRequestsCount = useAdminRsvpRequestsCount(viewRequests);

  useAdminNavKeybindings(viewRequests, router.push);

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
      {viewUsers && (
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
            {viewRequests && <Badge count={newRequestsCount} tone="amber" />}
            <KbdHint>g a</KbdHint>
          </span>
        }
      />
    </nav>
  );
}
