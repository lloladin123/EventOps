"use client";

import * as React from "react";
import { useAuth } from "@/features/auth/provider/AuthProvider";
import { useUsersAdmin } from "@/features/users/hooks/useUsersAdmin";

import UserListTable from "@/features/users/views/UserListTable";
import UserListView from "@/features/users/views/UserListView";

import {
  ROLE,
  ROLES,
  CREW_SUBROLES,
  isAdmin,
  type Role,
  type CrewSubRole,
} from "@/types/rsvp";

import { deleteDoc, deleteField, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase/client";
import ViewModeToggle, {
  ViewMode,
} from "@/components/ui/patterns/ViewModeToggle";

import { useUndoStack } from "@/features/users/hooks/useUndoStack";

export default function UsersPage() {
  const { role: myRole, loading } = useAuth();
  const isAllowed = isAdmin(myRole);

  const {
    users,
    busy,
    setUserRole: setUserRoleStrict,
    setUserSubRole: setUserSubRoleStrict,
  } = useUsersAdmin(isAllowed);

  // ✅ UNDO stack (Ctrl+Z)
  const { stack: undoStack, push: pushUndo, popUndo } = useUndoStack();

  // Helper to read current snapshot for a user from already-loaded list
  const getUserSnapshot = React.useCallback(
    (uid: string) => users.find((u) => u.uid === uid)?.data ?? null,
    [users],
  );

  // ✅ ROLE change with undo (restore previous role + subRole)
  const setUserRole = React.useCallback(
    async (uid: string, nextRole: Role | null) => {
      const prev = getUserSnapshot(uid);
      const prevRole = (prev?.role ?? null) as Role | null;
      const prevSubRole = (prev?.subRole ?? null) as CrewSubRole | null;

      // Apply change
      if (nextRole === null) {
        await updateDoc(doc(db, "users", uid), {
          role: deleteField(),
          subRole: deleteField(),
        });
      } else {
        await Promise.resolve(setUserRoleStrict(uid, nextRole));
      }

      // Push undo action
      pushUndo({
        label: `Rolle ændret`,
        undo: async () => {
          if (prevRole === null) {
            await updateDoc(doc(db, "users", uid), {
              role: deleteField(),
              subRole: deleteField(),
            });
          } else {
            await updateDoc(doc(db, "users", uid), {
              role: prevRole,
              // if previous subRole was null/undefined, remove it
              subRole: prevSubRole == null ? deleteField() : prevSubRole,
            });
          }
        },
      });
    },
    [getUserSnapshot, pushUndo, setUserRoleStrict],
  );

  // ✅ SUBROLE change with undo
  const setUserSubRole = React.useCallback(
    async (uid: string, nextSubRole: CrewSubRole | null) => {
      const prev = getUserSnapshot(uid);
      const prevSubRole = (prev?.subRole ?? null) as CrewSubRole | null;

      await Promise.resolve(setUserSubRoleStrict(uid, nextSubRole));

      pushUndo({
        label: `Underrolle ændret`,
        undo: async () => {
          await Promise.resolve(setUserSubRoleStrict(uid, prevSubRole));
        },
      });
    },
    [getUserSnapshot, pushUndo, setUserSubRoleStrict],
  );

  // ✅ DELETE with grace period + undo (Ctrl+Z cancels)
  const pendingDeletesRef = React.useRef(new Map<string, number>());

  const deleteUser = React.useCallback(
    async (uid: string) => {
      // If already pending, don't schedule twice
      if (pendingDeletesRef.current.has(uid)) return;

      const timeoutId = window.setTimeout(async () => {
        pendingDeletesRef.current.delete(uid);
        await deleteDoc(doc(db, "users", uid));
      }, 7000);

      pendingDeletesRef.current.set(uid, timeoutId);

      pushUndo({
        label: `Bruger slettet`,
        undo: async () => {
          const t = pendingDeletesRef.current.get(uid);
          if (t != null) {
            window.clearTimeout(t);
            pendingDeletesRef.current.delete(uid);
          }
        },
      });
    },
    [pushUndo],
  );

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
    [myRole],
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
    <div className="mx-auto max-w-6xl space-y-4 px-6 py-6">
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
