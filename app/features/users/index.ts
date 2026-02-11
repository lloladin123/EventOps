// app/components/users/index.ts

// Views (public)
export { default as UserListTable } from "./views/UserListTable";
export { default as UserListView } from "./views/UserListView";
export { UsersViewState } from "./views/UsersViewState";

// Common metadata / config (public-ish)
export { usersGroupMeta } from "./config/UsersGroupMetaa";
export * from "./utils/usersVisible";

// If you want external callers to use these directly, keep them.
// Otherwise, delete these exports and keep them internal only.
export { confirmDeleteUser } from "./utils/confirmDeleteUser";
