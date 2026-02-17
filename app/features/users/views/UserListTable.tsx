"use client";

import * as React from "react";
import type { UserDoc } from "@/lib/firestore/users.client";
import GroupedTable from "@/components/ui/patterns/table/GroupedTable";
import { SortState } from "@/components/ui/patterns/table/types";
import { getAuth } from "firebase/auth";

import { UsersViewState } from "./UsersViewState";
import { usersGroupMeta } from "../config/UsersGroupMeta";
import { UserHotkeysHint } from "./UserHotkeysHint";

import { useUserHotkeys } from "../hooks/useUserHotkeys";
import { useFlashUid } from "../hooks/useFlashUid";
import { useUserRowFocus } from "../hooks/useUserRowFocus";
import { useMissingRoleNavigator } from "../hooks/useMissingRoleNavigator";
import { useFlashFocus } from "../hooks/useFlashFocus";
import { confirmDeleteUser } from "../utils/confirmDeleteUser";

import {
  SYSTEM_ROLE,
  type SystemRole,
  isSystemAdmin,
  isSystemStaff,
} from "@/types/systemRoles";
// ^ move your SYSTEM_ROLE helpers into their own module instead of keeping them in this file

import { buildUserTableColumns } from "../builders/buildUserTableColumns";

type Props = {
  users: Array<{ uid: string; data: UserDoc }>;
  busy: boolean;

  systemRoles: readonly SystemRole[];
  setUserSystemRole: (
    uid: string,
    nextRole: SystemRole | null,
  ) => void | Promise<void>;

  deleteUser: (uid: string) => void | Promise<void>;
};

type Row = { uid: string; data: UserDoc };
type GroupId = "all";

type ColumnKey = "user" | "uid" | "systemRole" | "actions";
type SortKey = Exclude<ColumnKey, "actions">;

export default function UserListTable({
  users,
  busy,
  systemRoles,
  setUserSystemRole,
  deleteUser,
}: Props) {
  const uid = getAuth().currentUser?.uid ?? null;

  const currentSystemRole = React.useMemo(() => {
    if (!uid) return null;
    return (users.find((u) => u.uid === uid)?.data.systemRole ??
      null) as SystemRole | null;
  }, [users, uid]);

  const visibleUsers = React.useMemo(() => {
    if (isSystemAdmin(currentSystemRole)) return users;

    // non-admins: hide staff accounts
    return users.filter((u) => !isSystemStaff(u.data.systemRole ?? null));
  }, [users, currentSystemRole]);

  const { flashUid, flash } = useFlashUid(2200);

  const { setRowRef, setRoleRef, focusRoleSelect } = useUserRowFocus();
  const focusRoleSelectFlash = useFlashFocus(flash, focusRoleSelect);

  const { focusMissingRelative } = useMissingRoleNavigator({
    visibleUsers,
    focusRole: focusRoleSelectFlash,
  });

  const columns = React.useMemo(
    () =>
      buildUserTableColumns({
        systemRoles,
        setUserSystemRole,
        deleteUser,
        setRowRef,
        setRoleRef,
        flashUid,
        flash,
        focusMissingRelative,

        // permissions (recommended)
        currentSystemRole,
      }),
    [
      systemRoles,
      setUserSystemRole,
      deleteUser,
      setRowRef,
      setRoleRef,
      flashUid,
      flash,
      focusMissingRelative,
      currentSystemRole,
    ],
  );

  useUserHotkeys({
    enabled: true,
    users: visibleUsers,
    onDeleteUser: deleteUser,
    confirmDelete: (_label, row) => confirmDeleteUser(row.uid, row.data),
  });

  const initialSort: SortState<SortKey> = { key: "user", dir: "asc" };

  if (busy) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
        Loading users…
      </div>
    );
  }

  if (visibleUsers.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
        No users found.
      </div>
    );
  }

  return (
    <UsersViewState busy={busy} isEmpty={visibleUsers.length === 0}>
      <GroupedTable<Row, GroupId, ColumnKey, SortKey>
        rows={visibleUsers}
        initialSort={initialSort}
        tableMinWidthClassName="min-w-[980px]"
        getGroupId={() => "all"}
        sortHint={<UserHotkeysHint />}
        getGroupMeta={usersGroupMeta}
        columns={columns}
      />
    </UsersViewState>
  );
}
