"use client";

import * as React from "react";
import { useAuth } from "@/features/auth/provider/AuthProvider";
import { useUsersAdmin } from "@/features/users/hooks/useUsersAdmin";

import UserListTable from "@/features/users/views/UserListTable";
import UserListView from "@/features/users/views/UserListView";

import {
  isSystemAdmin,
  SYSTEM_ROLE,
  type SystemRole,
} from "@/types/systemRoles";

import { deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase/client";
import ViewModeToggle, {
  ViewMode,
} from "@/components/ui/patterns/ViewModeToggle";

import { useUndoStack } from "@/features/users/hooks/useUndoStack";
import { UserDoc } from "@/lib/firestore/users.client";

export default function UsersPage() {
  type UserDocWithSystemRole = UserDoc & {
    systemRole?: SystemRole | null;
  };

  const { systemRole, loading } = useAuth();
  const isAllowed = isSystemAdmin(systemRole);

  const { users, busy } = useUsersAdmin(isAllowed);
  const { push: pushUndo } = useUndoStack();

  // Helper to read current snapshot for a user from already-loaded list
  const getUserSnapshot = React.useCallback(
    (uid: string) => users.find((u) => u.uid === uid)?.data ?? null,
    [users],
  );

  // ✅ Apply system role
  const applySystemRole = React.useCallback(
    async (uid: string, next: SystemRole | null) => {
      await updateDoc(doc(db, "users", uid), {
        systemRole: next,
        updatedAt: serverTimestamp(),
      });
    },
    [],
  );

  // ✅ SYSTEM ROLE change with undo/redo
  const setUserRole = React.useCallback(
    async (uid: string, nextRole: SystemRole | null) => {
      const prev = getUserSnapshot(uid) as UserDocWithSystemRole | null;
      const prevRole = (prev?.systemRole ?? null) as SystemRole | null;

      await applySystemRole(uid, nextRole);

      pushUndo({
        label: "Systemrolle ændret",
        undo: async () => {
          await applySystemRole(uid, prevRole);
        },
        redo: async () => {
          await applySystemRole(uid, nextRole);
        },
      });
    },
    [applySystemRole, getUserSnapshot, pushUndo],
  );

  // ✅ system roles don’t have subRole; keep a no-op so the table compiles
  const setUserSubRole = React.useCallback(async () => {}, []);

  // ✅ DELETE with grace period + undo/redo
  const pendingDeletesRef = React.useRef(new Map<string, number>());

  const deleteUser = React.useCallback(
    async (uid: string) => {
      if (pendingDeletesRef.current.has(uid)) return;

      const timeoutId = window.setTimeout(async () => {
        pendingDeletesRef.current.delete(uid);
        await deleteDoc(doc(db, "users", uid));
      }, 7000);

      pendingDeletesRef.current.set(uid, timeoutId);

      pushUndo({
        label: "Bruger slettet",
        undo: async () => {
          const t = pendingDeletesRef.current.get(uid);
          if (t != null) {
            window.clearTimeout(t);
            pendingDeletesRef.current.delete(uid);
          }
        },
        redo: async () => {
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

  React.useEffect(() => {
    localStorage.setItem("users:view", view);
  }, [view]);

  // ✅ options for dropdown
  const selectableSystemRoles = React.useMemo<SystemRole[]>(
    () => Object.values(SYSTEM_ROLE),
    [],
  );

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
          roles={selectableSystemRoles}
          setUserRole={setUserRole}
          deleteUser={deleteUser}
        />
      ) : (
        <UserListView
          users={users}
          busy={busy}
          // @ts-expect-error migrating: view expects RSVP Role strings, but it’s just a string list in UI
          roles={selectableSystemRoles}
          crewSubRoles={[]}
          // @ts-expect-error migrating: setter now assigns systemRole
          setUserRole={setUserRole}
          setUserSubRole={setUserSubRole}
          deleteUser={deleteUser}
        />
      )}
    </div>
  );
}
