"use client";

import * as React from "react";
import { countUsersWithoutRole } from "@/features//users/lib/userCounts";
import { subscribeUsers } from "@/lib//firestore/users.client";

export function useUsersWithoutRoleCount(admin: boolean) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!admin) {
      setCount(0);
      return;
    }

    const unsub = subscribeUsers((rows) => {
      setCount(countUsersWithoutRole(rows));
    });

    return () => unsub();
  }, [admin]);

  return count;
}
