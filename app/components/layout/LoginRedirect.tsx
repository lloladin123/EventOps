"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/types/rsvp";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  redirectTo?: string;
};

export default function LoginRedirect({
  children,
  title = "Du er ikke logget ind",
  description = "Vælg en rolle for at kunne fortsætte.",
  redirectTo = "/login",
}: Props) {
  const router = useRouter();
  const [role, setRole] = React.useState<Role | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const read = () => {
      setRole(localStorage.getItem("role") as Role | null);
      setReady(true);
    };

    read();
    window.addEventListener("auth-changed", read);
    window.addEventListener("storage", read);

    return () => {
      window.removeEventListener("auth-changed", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  // avoid a flash before localStorage is read
  if (!ready) return null;

  if (!role) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{description}</p>

          <button
            type="button"
            onClick={() => router.push(redirectTo)}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Gå til login
          </button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
