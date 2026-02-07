"use client";

import * as React from "react";
import { ROLE } from "@/types/rsvp";
import type { Role, CrewSubRole } from "@/types/rsvp";
import type { UserDoc } from "@/utils/users.firestore";

import GroupedTable from "@/components/ui/GroupedTable";
import type { SortState } from "@/components/ui/GroupedTable";
import { useUserHotkeys } from "./useUserHotkeys";
import { useFlashUid } from "./useFlashUid";
import { useUserRowFocus } from "./useUserRowFocus";
import { useMissingRoleNavigator } from "./useMissingRoleNavigator";
import { confirmDeleteUser } from "./confirmDeleteUser";
import { UsersViewState } from "./UsersViewState";
import { usersGroupMeta } from "./usersGroupMeta";
import { buildUserTableColumns } from "./buildUserTableColumns";
import { visibleNonAdminUsers } from "./usersVisible";
import { useFlashFocus } from "./useFlashFocus";

type Props = {
  users: Array<{ uid: string; data: UserDoc }>;
  busy: boolean;
  roles: readonly Role[];
  crewSubRoles: readonly CrewSubRole[];
  setUserRole: (uid: string, nextRole: Role) => void | Promise<void>;
  setUserSubRole: (
    uid: string,
    nextSubRole: CrewSubRole | null
  ) => void | Promise<void>;

  // ✅ NEW
  deleteUser: (uid: string) => void | Promise<void>;
};

type Row = { uid: string; data: UserDoc };

// Single group id
type GroupId = "all";

type ColumnKey = "user" | "uid" | "role" | "subRole" | "actions";
type SortKey = Exclude<ColumnKey, "actions">;

function asText(v: unknown) {
  return (v ?? "").toString().trim().toLowerCase();
}

export default function UserListTable({
  users,
  busy,
  roles,
  crewSubRoles,
  setUserRole,
  setUserSubRole,
  deleteUser,
}: Props) {
  const visibleUsers = React.useMemo(
    () => visibleNonAdminUsers(users),
    [users]
  );

  const { flashUid, flash } = useFlashUid(2200);

  const {
    setRowRef,
    setRoleRef,
    setSubRoleRef,
    focusRoleSelect,
    focusSubRoleSelect,
  } = useUserRowFocus();

  const focusRoleSelectFlash = useFlashFocus(flash, focusRoleSelect);

  const { focusMissingRelative } = useMissingRoleNavigator({
    visibleUsers,
    focusRole: focusRoleSelectFlash,
  });

  const columns = React.useMemo(
    () =>
      buildUserTableColumns({
        roles,
        crewSubRoles,
        setUserRole,
        setUserSubRole,
        deleteUser,
        setRowRef,
        setRoleRef,
        setSubRoleRef,
        focusSubRoleSelect,
        focusMissingRelative,
        flashUid,
      }),
    [
      roles,
      crewSubRoles,
      setUserRole,
      setUserSubRole,
      deleteUser,
      setRowRef,
      setRoleRef,
      setSubRoleRef,
      focusSubRoleSelect,
      focusMissingRelative,
      flashUid,
    ]
  );

  useUserHotkeys({
    enabled: true,
    users: visibleUsers,
    onJumpMissing: focusMissingRelative,
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
        getGroupMeta={usersGroupMeta}
        columns={columns}
      />
    </UsersViewState>
  );
}
