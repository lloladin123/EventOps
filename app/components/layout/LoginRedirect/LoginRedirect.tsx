"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";

import GuardCard from "./GuardCard";
import { Button } from "@/components/ui/primitives/button";

import type { Action } from "@/features/auth/lib/permissions";
import { useAccess } from "@/features/auth/hooks/useAccess";

import { db } from "@/app/lib/firebase/client";
import type { Role } from "@/types/rsvp";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  redirectTo?: string;

  action: Action;

  // ✅ RSVP gate (optional)
  eventId?: string;
  allowedRsvpRoles?: readonly Role[];
  requireApprovedRsvp?: boolean;

  unauthorizedTitle?: string;
  unauthorizedDescription?: string;
  unauthorizedRedirectTo?: string;
};

type MyRsvpMini = {
  approved?: boolean;
  rsvpRole?: Role | null;
};

export default function LoginRedirect({
  children,
  title = "Du er ikke logget ind",
  description = "Log ind for at fortsætte.",
  redirectTo = "/login",

  action,

  eventId,
  allowedRsvpRoles,
  requireApprovedRsvp = false,

  unauthorizedTitle = "Ingen adgang",
  unauthorizedDescription = "Du har ikke adgang til denne side.",
  unauthorizedRedirectTo = "/events",
}: Props) {
  const router = useRouter();
  const access = useAccess();

  const uid = access.user?.uid ?? null;

  const needsRsvpGate =
    !!eventId && (!!allowedRsvpRoles?.length || requireApprovedRsvp);

  const [myRsvp, setMyRsvp] = React.useState<MyRsvpMini | null>(null);
  const [rsvpLoading, setRsvpLoading] = React.useState(false);

  React.useEffect(() => {
    if (!needsRsvpGate) {
      setMyRsvp(null);
      setRsvpLoading(false);
      return;
    }
    if (!eventId || !uid) {
      setMyRsvp(null);
      setRsvpLoading(false);
      return;
    }

    setRsvpLoading(true);
    const ref = doc(db, "events", eventId, "rsvps", uid);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.exists() ? (snap.data() as any) : null;
        setMyRsvp({
          approved: data?.approved ?? undefined,
          rsvpRole: (data?.rsvpRole ?? null) as Role | null,
        });
        setRsvpLoading(false);
      },
      () => {
        setMyRsvp(null);
        setRsvpLoading(false);
      },
    );

    return () => unsub();
  }, [needsRsvpGate, eventId, uid]);

  // loading gates
  if (access.loading) return null;
  if (needsRsvpGate && rsvpLoading) return null;

  // not logged in
  if (!access.user) {
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

  // logged in but not accepted
  if (!access.systemRole) {
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

  // ✅ system permission (admin path)
  const systemAllowed = access.canAccess(action);

  // ✅ RSVP gate (event path)
  const rsvpRoleOk =
    !allowedRsvpRoles?.length ||
    (myRsvp?.rsvpRole != null && allowedRsvpRoles.includes(myRsvp.rsvpRole));

  const rsvpApprovedOk = !requireApprovedRsvp || myRsvp?.approved === true;

  const rsvpAllowed = !needsRsvpGate || (rsvpRoleOk && rsvpApprovedOk);

  // ✅ final decision: admin OR RSVP allowed
  const allowed = systemAllowed || rsvpAllowed;

  if (!allowed) {
    const detailBits: string[] = [];
    if (needsRsvpGate) {
      if (allowedRsvpRoles?.length)
        detailBits.push(`rolle: ${myRsvp?.rsvpRole ?? "ingen"}`);
      if (requireApprovedRsvp)
        detailBits.push(`godkendt: ${myRsvp?.approved ? "ja" : "nej"}`);
    } else {
      detailBits.push(`${access.systemRole}`);
    }

    return (
      <GuardCard
        title={unauthorizedTitle}
        description={
          <>
            {unauthorizedDescription}{" "}
            <span className="font-medium">({detailBits.join(", ")})</span>
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
