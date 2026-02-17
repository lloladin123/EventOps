import type { SystemRole } from "@/types/systemRoles";
import type { UserDoc } from "@/lib/firestore/users.client";

import { UserIdentityCell } from "../cells/UserIdentityCell";
import { RoleSelectCell } from "../cells/RoleSelectCell";
import { DeleteUserButton } from "../cells/DeleteUserButton";
import { confirmDeleteUser } from "../utils/confirmDeleteUser";

type Row = { uid: string; data: UserDoc };
type ColumnKey = "user" | "uid" | "systemRole" | "actions";

function asText(v: unknown) {
  return (v ?? "").toString().trim().toLowerCase();
}

type Params = {
  systemRoles: readonly SystemRole[];
  setUserSystemRole: (
    uid: string,
    nextRole: SystemRole | null,
  ) => void | Promise<void>;
  deleteUser: (uid: string) => void | Promise<void>;

  setRowRef: (uid: string, el: HTMLElement | null) => void;
  setRoleRef: (uid: string, el: HTMLSelectElement | null) => void;

  focusMissingRelative: (fromUid: string | null, dir: 1 | -1) => void;

  flashUid: string | null;
  flash: (uid: string) => void;
};

export function buildUserTableColumns({
  systemRoles,
  setUserSystemRole,
  deleteUser,
  setRowRef,
  setRoleRef,
  focusMissingRelative,
  flash,
}: Params) {
  const columns = [
    {
      key: "user",
      header: "Bruger",
      headerTitle: "Sortér efter navn",
      sortValue: (r: Row) =>
        r.data.displayName?.trim() || r.data.email?.split("@")[0] || r.uid,
      cell: (r: Row) => (
        <UserIdentityCell
          uid={r.uid}
          data={r.data}
          setRowRef={setRowRef}
          onActivate={() => flash(r.uid)}
        />
      ),
    },
    {
      key: "uid",
      header: "UID",
      headerTitle: "Sortér efter UID",
      sortValue: (r: Row) => asText(r.uid),
      cell: (r: Row) => <code className="text-xs text-slate-700">{r.uid}</code>,
    },
    {
      key: "systemRole",
      header: "System rolle",
      headerTitle: "Sortér efter systemrolle",
      sortValue: (r: Row) => asText(r.data.systemRole ?? ""),
      cell: (r: Row) => (
        <RoleSelectCell
          uid={r.uid}
          role={(r.data.systemRole ?? null) as SystemRole | null}
          roles={systemRoles}
          setRoleRef={setRoleRef}
          setUserRole={setUserSystemRole}
          focusSubRoleSelect={() => {}}
          focusMissingRelative={focusMissingRelative}
        />
      ),
    },
    {
      key: "actions",
      header: " ",
      align: "right" as const,
      cell: (r: Row) => (
        <DeleteUserButton
          uid={r.uid}
          data={r.data}
          deleteUser={deleteUser}
          confirmDelete={confirmDeleteUser}
        />
      ),
    },
  ];

  return columns as any;
}
