"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/provider/AuthProvider";

type Props = {
  /** Where to send signed-in users (e.g. /events) */
  whenAuthedTo?: string;

  /** Where to send signed-out users (optional). If omitted, render children. */
  whenUnauthedTo?: string;

  /** What to render while auth is loading or redirecting */
  loadingFallback?: React.ReactNode;

  /** Rendered when no redirect happens (usually your page content) */
  children?: React.ReactNode;
};

export default function AuthRedirect({
  whenAuthedTo = "/events",
  whenUnauthedTo,
  loadingFallback = (
    <div className="mx-auto max-w-md p-6 text-sm text-slate-500">
      Redirecting...
    </div>
  ),
  children,
}: Props) {
  const router = useRouter();
  const { user, loading } = useAuth();

  const shouldRedirectAuthed = !loading && !!user && !!whenAuthedTo;
  const shouldRedirectUnauthed = !loading && !user && !!whenUnauthedTo;

  React.useEffect(() => {
    if (loading) return;

    if (shouldRedirectAuthed) {
      router.replace(whenAuthedTo);
      return;
    }

    if (shouldRedirectUnauthed) {
      router.replace(whenUnauthedTo);
    }
  }, [
    loading,
    shouldRedirectAuthed,
    shouldRedirectUnauthed,
    router,
    whenAuthedTo,
    whenUnauthedTo,
  ]);

  // Show "Redirecting..." while loading OR while a redirect is about to happen
  if (loading || shouldRedirectAuthed || shouldRedirectUnauthed) {
    return <>{loadingFallback}</>;
  }

  // Otherwise show normal page content (e.g. login/signup)
  return <>{children}</>;
}
