"use client";

import * as React from "react";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { useUsersAdmin } from "@/utils/useUsersAdmin";

import UserListTable from "@/components/users/views/UserListTable";
import UserListView from "@/components/users/views/UserListView";
import ViewModeToggle, { type ViewMode } from "@/components/ui/ViewModeToggle";

import { ROLE, ROLES, CREW_SUBROLES, isAdmin } from "@/types/rsvp";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase/client";

export default function UsersPage() {
  const { role: myRole, loading } = useAuth();
  const isAllowed = isAdmin(myRole);

  const { users, busy, setUserRole, setUserSubRole } = useUsersAdmin(isAllowed);

  const deleteUser = React.useCallback(async (uid: string) => {
    await deleteDoc(doc(db, "users", uid));
  }, []);

  // 🔁 view mode (persisted)
  const [view, setView] = React.useState<ViewMode>(() => {
    if (typeof window === "undefined") return "table";
    return (localStorage.getItem("users:view") as ViewMode) ?? "table";
  });

  React.useEffect(() => {
    localStorage.setItem("users:view", view);
  }, [view]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-6">
        <h1 className="text-lg font-semibold text-slate-900">Users</h1>
        <p className="mt-2 text-sm text-slate-600">No access.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 space-y-4">
      {/* Header */}
      <div className="flex gap-4">
        <h1 className="text-lg font-semibold text-slate-900">Users</h1>
        <ViewModeToggle value={view} onChange={setView} />
      </div>

      {/* Content */}
      {view === "table" ? (
        <UserListTable
          users={users}
          busy={busy}
          roles={ROLES}
          crewSubRoles={CREW_SUBROLES}
          setUserRole={setUserRole}
          setUserSubRole={setUserSubRole}
          deleteUser={deleteUser}
        />
      ) : (
        <UserListView
          users={users}
          busy={busy}
          roles={ROLES}
          crewSubRoles={CREW_SUBROLES}
          setUserRole={setUserRole}
          setUserSubRole={setUserSubRole}
          deleteUser={deleteUser}
        />
      )}
    </div>
  );
}
