"use client";
import * as React from "react";

export function useUserRowFocus() {
  const rowRefs = React.useRef(new Map<string, HTMLElement | null>());
  const roleRefs = React.useRef(new Map<string, HTMLSelectElement | null>());
  const subRoleRefs = React.useRef(new Map<string, HTMLSelectElement | null>());

  const setRowRef = React.useCallback((uid: string, el: HTMLElement | null) => {
    rowRefs.current.set(uid, el);
  }, []);

  const setRoleRef = React.useCallback(
    (uid: string, el: HTMLSelectElement | null) => {
      roleRefs.current.set(uid, el);
    },
    []
  );

  const setSubRoleRef = React.useCallback(
    (uid: string, el: HTMLSelectElement | null) => {
      subRoleRefs.current.set(uid, el);
    },
    []
  );

  const scrollToUid = React.useCallback((uid: string) => {
    const row = rowRefs.current.get(uid);
    if (!row) return;
    row.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const focusRoleSelect = React.useCallback(
    (uid: string) => {
      scrollToUid(uid);
      requestAnimationFrame(() => {
        const el = roleRefs.current.get(uid);
        if (!el) return;
        el.focus();
      });
    },
    [scrollToUid]
  );

  const focusSubRoleSelect = React.useCallback(
    (uid: string) => {
      scrollToUid(uid);
      requestAnimationFrame(() => {
        const el = subRoleRefs.current.get(uid);
        if (!el) return;
        el.focus();
      });
    },
    [scrollToUid]
  );

  return {
    setRowRef,
    setRoleRef,
    setSubRoleRef,
    scrollToUid,
    focusRoleSelect,
    focusSubRoleSelect,
  };
}
