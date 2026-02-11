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

  const { push: pushUndo } = useUndoStack();

  // Helper to read current snapshot for a user from already-loaded list
  const getUserSnapshot = React.useCallback(
    (uid: string) => users.find((u) => u.uid === uid)?.data ?? null,
    [users],
  );

  // Helpers to apply role/subRole in both directions (so undo/redo share code)
  const applyRole = React.useCallback(
    async (
      uid: string,
      roleValue: Role | null,
      subRoleValue: CrewSubRole | null,
    ) => {
      if (roleValue === null) {
        await updateDoc(doc(db, "users", uid), {
          role: deleteField(),
          subRole: deleteField(),
        });
        return;
      }

      // use existing strict helper for role (keeps your existing logic)
      await Promise.resolve(setUserRoleStrict(uid, roleValue));

      // ensure subRole matches intended state (remove if null)
      await updateDoc(doc(db, "users", uid), {
        subRole: subRoleValue == null ? deleteField() : subRoleValue,
      });
    },
    [setUserRoleStrict],
  );

  const applySubRole = React.useCallback(
    async (uid: string, subRoleValue: CrewSubRole | null) => {
      await Promise.resolve(setUserSubRoleStrict(uid, subRoleValue));
    },
    [setUserSubRoleStrict],
  );

  // ✅ ROLE change with undo/redo (restore previous role + subRole)
  const setUserRole = React.useCallback(
    async (uid: string, nextRole: Role | null) => {
      const prev = getUserSnapshot(uid);
      const prevRole = (prev?.role ?? null) as Role | null;
      const prevSubRole = (prev?.subRole ?? null) as CrewSubRole | null;

      // If role changes, we typically also clear subRole unless you do something else in setUserRoleStrict.
      // We'll treat "nextSubRole" as null for role changes (matches your original behavior).
      const nextSubRole: CrewSubRole | null = null;

      // Apply change (forward)
      await applyRole(uid, nextRole, nextSubRole);

      pushUndo({
        label: "Rolle ændret",
        undo: async () => {
          await applyRole(uid, prevRole, prevSubRole);
        },
        redo: async () => {
          await applyRole(uid, nextRole, nextSubRole);
        },
      });
    },
    [applyRole, getUserSnapshot, pushUndo],
  );

  // ✅ SUBROLE change with undo/redo
  const setUserSubRole = React.useCallback(
    async (uid: string, nextSubRole: CrewSubRole | null) => {
      const prev = getUserSnapshot(uid);
      const prevSubRole = (prev?.subRole ?? null) as CrewSubRole | null;

      await applySubRole(uid, nextSubRole);

      pushUndo({
        label: "Underrolle ændret",
        undo: async () => {
          await applySubRole(uid, prevSubRole);
        },
        redo: async () => {
          await applySubRole(uid, nextSubRole);
        },
      });
    },
    [applySubRole, getUserSnapshot, pushUndo],
  );

  // ✅ DELETE with grace period + undo/redo
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
        label: "Bruger slettet",
        undo: async () => {
          // "Undo" cancels the scheduled deletion
          const t = pendingDeletesRef.current.get(uid);
          if (t != null) {
            window.clearTimeout(t);
            pendingDeletesRef.current.delete(uid);
          }
        },
        redo: async () => {
          // "Redo" re-schedules the deletion (fresh 7s window)
          if (pendingDeletesRef.current.has(uid)) return;

          const t2 = window.setTimeout(async () => {
            pendingDeletesRef.current.delete(uid);
            await deleteDoc(doc(db, "users", uid));
          }, 7000);

          pendingDeletesRef.current.set(uid, t2);
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
      <div className="flex gap-4">
        <h1 className="text-lg font-semibold text-slate-900">Users</h1>
        <ViewModeToggle value={view} onChange={setView} />
      </div>

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
