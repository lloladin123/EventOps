"use client";

import * as React from "react";
import LoginRedirect from "@/components/layout/LoginRedirect/LoginRedirect";
import { useUsersAdmin } from "@/features/users/hooks/useUsersAdmin";

import UserListTable from "@/features/users/views/UserListTable";
import UserListView from "@/features/users/views/UserListView";

import { SYSTEM_ROLE, type SystemRole } from "@/types/systemRoles";
import { PERMISSION } from "@/features/auth/lib/permissions";

import { deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase/client";
import ViewModeToggle, {
  ViewMode,
} from "@/components/ui/patterns/ViewModeToggle";

import { useUndoStack } from "@/features/users/hooks/useUndoStack";
import { UserDoc } from "@/lib/firestore/users.client";

function UsersPageContent() {
  type UserDocWithSystemRole = UserDoc & {
    systemRole?: SystemRole | null;
  };

  const [pendingDeleteUids, setPendingDeleteUids] = React.useState<string[]>(
    [],
  );

  const { users, busy } = useUsersAdmin(true);
  const { push: pushUndo } = useUndoStack();

  const getUserSnapshot = React.useCallback(
    (uid: string) => users.find((u) => u.uid === uid)?.data ?? null,
    [users],
  );

  const applySystemRole = React.useCallback(
    async (uid: string, next: SystemRole | null) => {
      await updateDoc(doc(db, "users", uid), {
        systemRole: next,
        updatedAt: serverTimestamp(),
      });
    },
    [],
  );

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

  const pendingDeletesRef = React.useRef(new Map<string, number>());

  const deleteUser = React.useCallback(
    async (uid: string) => {
      if (pendingDeletesRef.current.has(uid)) return;

      setPendingDeleteUids((prev) =>
        prev.includes(uid) ? prev : [...prev, uid],
      );

      const timeoutId = window.setTimeout(async () => {
        pendingDeletesRef.current.delete(uid);
        setPendingDeleteUids((prev) => prev.filter((x) => x !== uid));
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
            setPendingDeleteUids((prev) => prev.filter((x) => x !== uid));
          }
        },
        redo: async () => {
          if (pendingDeletesRef.current.has(uid)) return;

          setPendingDeleteUids((prev) =>
            prev.includes(uid) ? prev : [...prev, uid],
          );

          const t2 = window.setTimeout(async () => {
            pendingDeletesRef.current.delete(uid);
            setPendingDeleteUids((prev) => prev.filter((x) => x !== uid));
            await deleteDoc(doc(db, "users", uid));
          }, 7000);

          pendingDeletesRef.current.set(uid, t2);
        },
      });
    },
    [pushUndo],
  );

  const [view, setView] = React.useState<ViewMode>(() => {
    if (typeof window === "undefined") return "table";
    return (localStorage.getItem("users:view") as ViewMode) ?? "table";
  });

  React.useEffect(() => {
    localStorage.setItem("users:view", view);
  }, [view]);

  const selectableSystemRoles = React.useMemo<SystemRole[]>(
    () => Object.values(SYSTEM_ROLE),
    [],
  );

  React.useEffect(() => {
    console.log("pendingDeleteUids", pendingDeleteUids);
  }, [pendingDeleteUids]);

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
          systemRoles={selectableSystemRoles}
          setUserSystemRole={setUserRole}
          deleteUser={deleteUser}
          pendingDeleteUids={pendingDeleteUids}
        />
      ) : (
        <UserListView
          users={users}
          busy={busy}
          systemRoles={selectableSystemRoles}
          setUserSystemRole={setUserRole}
          deleteUser={deleteUser}
          pendingDeleteUids={pendingDeleteUids}
        />
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <LoginRedirect
      action={PERMISSION.users.dashboard.view}
      unauthorizedRedirectTo="/login"
      description="Du har ikke adgang til Users."
    >
      <UsersPageContent />
    </LoginRedirect>
  );
}
