"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { SystemRole } from "@/types/systemRoles";
import { useAuth } from "@/features/auth/provider/AuthProvider";

import GuardCard from "./GuardCard";
import { Button } from "@/components/ui/primitives/button";

import { db } from "@/app/lib/firebase/client";
import { doc, onSnapshot } from "firebase/firestore";
import type { Role } from "@/types/rsvp";
import { isSystemAdmin } from "@/types/systemRoles";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  redirectTo?: string;

  // ✅ system role gate (global)
  allowedSystemRoles?: readonly SystemRole[];

  // ✅ optional RSVP gate (event-scoped)
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

  allowedSystemRoles,

  eventId,
  allowedRsvpRoles,
  requireApprovedRsvp = false,

  unauthorizedTitle = "Ingen adgang",
  unauthorizedDescription = "Du har ikke adgang til denne side.",
  unauthorizedRedirectTo = "/events",
}: Props) {
  const router = useRouter();
  const { user, systemRole, loading } = useAuth();

  const uid = user?.uid ?? null;

  // 🔎 RSVP state (only if RSVP gating is used)
  const [myRsvp, setMyRsvp] = React.useState<MyRsvpMini | null>(null);
  const [rsvpLoading, setRsvpLoading] = React.useState(false);

  const needsRsvpGate =
    !!eventId && (!!allowedRsvpRoles?.length || requireApprovedRsvp);

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

  // ✅ still loading auth or RSVP
  if (loading) return null;
  if (needsRsvpGate && rsvpLoading) return null;

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

  // ⏳ Logged in but no system role yet
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

  // ✅ system role gate: if provided, user must match
  const systemRoleOk =
    !allowedSystemRoles || allowedSystemRoles.includes(systemRole);

  // ✅ RSVP gate: passes if role matches OR approved (when required)
  const rsvpRoleOk =
    !allowedRsvpRoles?.length ||
    (myRsvp?.rsvpRole != null && allowedRsvpRoles.includes(myRsvp.rsvpRole));

  const rsvpApprovedOk = !requireApprovedRsvp || myRsvp?.approved === true;

  const rsvpOk = !needsRsvpGate || (rsvpRoleOk && rsvpApprovedOk);

  // If you want: admins always bypass RSVP gates (usually desirable)
  const adminBypass = isSystemAdmin(systemRole);

  const allowed = (systemRoleOk && rsvpOk) || adminBypass;

  if (!allowed) {
    const detailBits: string[] = [];
    if (needsRsvpGate) {
      if (allowedRsvpRoles?.length)
        detailBits.push(`rolle: ${myRsvp?.rsvpRole ?? "ingen"}`);
      if (requireApprovedRsvp)
        detailBits.push(`godkendt: ${myRsvp?.approved ? "ja" : "nej"}`);
    } else {
      detailBits.push(`${systemRole}`);
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
