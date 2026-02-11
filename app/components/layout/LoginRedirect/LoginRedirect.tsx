"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/types/rsvp";
import { useAuth } from "@/features//auth/provider/AuthProvider";

import GuardCard from "./GuardCard";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  redirectTo?: string;

  allowedRoles?: Role[];
  unauthorizedTitle?: string;
  unauthorizedDescription?: string;
  unauthorizedRedirectTo?: string;
};

export default function LoginRedirect({
  children,
  title = "Du er ikke logget ind",
  description = "Vælg en rolle for at kunne fortsætte.",
  redirectTo = "/login",

  allowedRoles,
  unauthorizedTitle = "Ingen adgang",
  unauthorizedDescription = "Din rolle har ikke adgang til denne side.",
  unauthorizedRedirectTo = "/login",
}: Props) {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  if (loading) return null;

  // Not logged in
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

  // Logged in but no role yet
  if (!role) {
    return (
      <GuardCard
        title="Afventer godkendelse"
        description={
          <>
            Din konto er oprettet, men en admin skal først tildele dig en rolle,
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
        footer={<>Tip: Hvis du lige er blevet godkendt, så tryk “Opdater”.</>}
      />
    );
  }

  // Wrong role
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <GuardCard
        title={unauthorizedTitle}
        description={
          <>
            {unauthorizedDescription}{" "}
            <span className="font-medium">({role})</span>
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
