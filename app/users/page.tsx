"use client";

import { useAuth } from "@/app/components/auth/AuthProvider";
import { useUsersAdmin } from "@/utils/useUsersAdmin";

import UserListTable from "@/components/users/UserListTable";
import { ROLE, ROLES, CREW_SUBROLES, isAdmin } from "@/types/rsvp";

export default function UsersPage() {
  const { role: myRole, loading } = useAuth();

  const { users, busy, setUserRole, setUserSubRole } = useUsersAdmin(
    isAdmin(myRole)
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-6">
        <h1 className="text-lg font-semibold text-slate-900">Users</h1>
        <p className="mt-2 text-sm text-slate-600">No access.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-600">
          Assign roles and crew subroles.
        </p>
      </div>

      <UserListTable
        users={users}
        busy={busy}
        roles={ROLES}
        crewSubRoles={CREW_SUBROLES}
        setUserRole={setUserRole}
        setUserSubRole={setUserSubRole}
      />
    </div>
  );
}
