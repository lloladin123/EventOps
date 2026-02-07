"use client";

import * as React from "react";
import { ROLE } from "@/types/rsvp";
import type { Role, CrewSubRole } from "@/types/rsvp";
import type { UserDoc } from "@/utils/users.firestore";

import GroupedList from "@/components/ui/GroupedList";
import { UsersViewState } from "./UsersViewState";
import { usersGroupMeta } from "./usersGroupMeta";

import { useFlashUid } from "./useFlashUid";
import { useMissingRoleNavigator } from "./useMissingRoleNavigator";
import { useUserHotkeys } from "./useUserHotkeys";
import { confirmDeleteUser } from "./confirmDeleteUser";
import { useUserListRowFocus } from "./useUserListRowFocus";
import { useUserListRenderRow } from "./useUserListRenderRow";
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
  deleteUser: (uid: string) => void | Promise<void>;
};

type Row = { uid: string; data: UserDoc };
type GroupId = "all";

export default function UserListView({
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

  const { setRowRef, setRoleRef, focusRoleSelect } = useUserListRowFocus();

  const focusRoleSelectFlash = useFlashFocus(flash, focusRoleSelect);

  const { focusMissingRelative } = useMissingRoleNavigator({
    visibleUsers,
    focusRole: focusRoleSelectFlash,
  });

  useUserHotkeys({
    enabled: true,
    users: visibleUsers,
    onJumpMissing: focusMissingRelative,
    onDeleteUser: deleteUser,
    confirmDelete: (_label, row) => confirmDeleteUser(row.uid, row.data),
  });

  const renderRow = useUserListRenderRow({
    roles,
    crewSubRoles,
    setUserRole,
    setUserSubRole,
    deleteUser,
    focusMissingRelative,
    flashUid,
    setRowRef,
    setRoleRef,
  });

  return (
    <UsersViewState busy={busy} isEmpty={visibleUsers.length === 0}>
      <GroupedList<Row, GroupId>
        rows={visibleUsers}
        getGroupId={() => "all"}
        getGroupMeta={usersGroupMeta}
        getRowKey={(r) => r.uid}
        renderRow={renderRow}
      />
    </UsersViewState>
  );
}
