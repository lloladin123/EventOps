"use client";

import { useAuth } from "@/features/auth/provider/AuthProvider";

export function useUserDisplay() {
  const { user, displayName, loading } = useAuth();

  // Single source of truth for display name logic
  const name =
    displayName?.trim() ||
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "Ukendt bruger";

  return {
    name,
    email: user?.email ?? "—",
    loading,
    user,
  };
}
