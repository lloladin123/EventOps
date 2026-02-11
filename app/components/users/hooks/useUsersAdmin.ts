"use client";

import * as React from "react";
import type { Role, CrewSubRole } from "@/types/rsvp";
import {
  subscribeUsers,
  updateUserRole,
  updateUserSubRole,
  type UserDoc,
} from "@/data/users.firestore";

export function useUsersAdmin(enabled: boolean) {
  const [users, setUsers] = React.useState<
    Array<{ uid: string; data: UserDoc }>
  >([]);
  const [busy, setBusy] = React.useState(true);

  React.useEffect(() => {
    if (!enabled) {
      setUsers([]);
      setBusy(false);
      return;
    }

    setBusy(true);

    const unsub = subscribeUsers(
      (rows) => {
        setUsers(rows);
        setBusy(false);
      },
      () => setBusy(false)
    );

    return () => unsub();
  }, [enabled]);

  const setUserRole = React.useCallback(async (uid: string, nextRole: Role) => {
    await updateUserRole(uid, nextRole);
  }, []);

  const setUserSubRole = React.useCallback(
    async (uid: string, nextSubRole: CrewSubRole | null) => {
      await updateUserSubRole(uid, nextSubRole);
    },
    []
  );

  return { users, busy, setUserRole, setUserSubRole };
}
