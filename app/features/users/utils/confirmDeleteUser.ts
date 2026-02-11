"use client";

import type { UserDoc } from "@/lib/firestore/users.client";

export function confirmDeleteUser(uid: string, data: UserDoc): boolean {
  const name =
    data.displayName?.trim() || data.email?.trim() || uid.slice(0, 8);

  return window.confirm(`Slet bruger "${name}"?\n\nDette kan ikke fortrydes.`);
}
