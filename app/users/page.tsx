"use client";

import * as React from "react";
import { useAuth } from "@/features//auth/provider/AuthProvider";
import { useUsersAdmin } from "@/features//users/hooks/useUsersAdmin";

import UserListTable from "@/features//users/views/UserListTable";
import UserListView from "@/features//users/views/UserListView";
import ViewModeToggle, { type ViewMode } from "@/components/ui/ViewModeToggle";

import { ROLE, ROLES, CREW_SUBROLES, isAdmin, Role } from "@/types/rsvp";
import { deleteDoc, deleteField, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase/client";

export default function UsersPage() {
  const { role: myRole, loading } = useAuth();
  const isAllowed = isAdmin(myRole);

  const {
    users,
    busy,
    setUserRole: setUserRoleStrict,
    setUserSubRole,
  } = useUsersAdmin(isAllowed);

  const setUserRole = React.useCallback(
    async (uid: string, nextRole: Role | null) => {
      if (nextRole === null) {
        // reset role + subRole in Firestore
        await updateDoc(doc(db, "users", uid), {
          role: deleteField(),
          subRole: deleteField(),
        });
        return;
      }

      await Promise.resolve(setUserRoleStrict(uid, nextRole));
    },
    [setUserRoleStrict]
  );

  const deleteUser = React.useCallback(async (uid: string) => {
    await deleteDoc(doc(db, "users", uid));
  }, []);

  // 🔁 view mode (persisted)
  const [view, setView] = React.useState<ViewMode>(() => {
    if (typeof window === "undefined") return "table";
    return (localStorage.getItem("users:view") as ViewMode) ?? "table";
  });

  const selectableRoles = React.useMemo(
    () =>
      myRole === ROLE.Admin
        ? ROLES
        : ROLES.filter((r) => r !== ROLE.Sikkerhedsledelse),
    [myRole]
  );

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
          roles={selectableRoles}
          crewSubRoles={CREW_SUBROLES}
          setUserRole={setUserRole}
          setUserSubRole={setUserSubRole}
          deleteUser={deleteUser}
        />
      ) : (
        <UserListView
          users={users}
          busy={busy}
          roles={selectableRoles}
          crewSubRoles={CREW_SUBROLES}
          setUserRole={setUserRole}
          setUserSubRole={setUserSubRole}
          deleteUser={deleteUser}
        />
      )}
    </div>
  );
}
