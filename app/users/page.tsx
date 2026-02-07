"use client";

import * as React from "react";
import { doc, deleteDoc } from "firebase/firestore";

import { db } from "@/app/lib/firebase/client";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { useUsersAdmin } from "@/utils/useUsersAdmin";
import UserListTable from "@/components/users/UserListTable";
import { ROLES, CREW_SUBROLES, isAdmin } from "@/types/rsvp";

export default function UsersPage() {
  const { role: myRole, loading } = useAuth();

  const { users, busy, setUserRole, setUserSubRole } = useUsersAdmin(
    isAdmin(myRole)
  );

  const deleteUser = React.useCallback(async (uid: string) => {
    // Deletes the user document in Firestore: /users/{uid}
    await deleteDoc(doc(db, "users", uid));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  // ⚠️ your current check is wrong: `if (!isAdmin)` checks the function, not your role
  if (!isAdmin(myRole)) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-6">
        <h1 className="text-lg font-semibold text-slate-900">Users</h1>
        <p className="mt-2 text-sm text-slate-600">No access.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <UserListTable
        users={users}
        busy={busy}
        roles={ROLES}
        crewSubRoles={CREW_SUBROLES}
        setUserRole={setUserRole}
        setUserSubRole={setUserSubRole}
        deleteUser={deleteUser}
      />
    </div>
  );
}
