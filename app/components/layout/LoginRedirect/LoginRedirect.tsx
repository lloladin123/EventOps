"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { SystemRole } from "@/types/systemRoles";
import { useAuth } from "@/features/auth/provider/AuthProvider";

import GuardCard from "./GuardCard";
import { Button } from "@/components/ui/primitives/button";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  redirectTo?: string;

  // ✅ Only system roles now
  allowedSystemRoles?: SystemRole[];

  unauthorizedTitle?: string;
  unauthorizedDescription?: string;
  unauthorizedRedirectTo?: string;
};

export default function LoginRedirect({
  children,
  title = "Du er ikke logget ind",
  description = "Log ind for at fortsætte.",
  redirectTo = "/login",

  allowedSystemRoles,

  unauthorizedTitle = "Ingen adgang",
  unauthorizedDescription = "Din systemrolle har ikke adgang til denne side.",
  unauthorizedRedirectTo = "/events",
}: Props) {
  const router = useRouter();
  const { user, systemRole, loading } = useAuth();

  if (loading) return null;

  // ❌ Not logged in
  if (!user) {
    return (
      <GuardCard
        title={title}
        description={description}
        actions={
          <Button onClick={() => router.push(redirectTo)}>Gå til login</Button>
        }
      />
    );
  }

  // ⏳ Logged in but no system role yet (very common right after Firebase edit)
  if (!systemRole) {
    return (
      <GuardCard
        title="Afventer systemrolle"
        description={
          <>
            Din konto er oprettet, men en admin skal tildele dig en systemrolle,
            før du kan bruge systemet.
          </>
        }
        actions={
          <>
            <Button onClick={() => window.location.reload()}>Opdater</Button>
            <Button variant="secondary" onClick={() => router.push("/login")}>
              Skift bruger
            </Button>
          </>
        }
        footer={
          <>
            Tip: Hvis du lige har ændret rollen i Firebase, så tryk “Opdater”.
          </>
        }
      />
    );
  }

  // 🚫 Wrong system role
  if (allowedSystemRoles && !allowedSystemRoles.includes(systemRole)) {
    return (
      <GuardCard
        title={unauthorizedTitle}
        description={
          <>
            {unauthorizedDescription}{" "}
            <span className="font-medium">({systemRole})</span>
          </>
        }
        actions={
          <Button onClick={() => router.push(unauthorizedRedirectTo)}>
            Videre
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}
