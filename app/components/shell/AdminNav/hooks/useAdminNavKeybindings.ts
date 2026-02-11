"use client";

import * as React from "react";
import { isTypingTarget } from "../dom";

export function useAdminNavKeybindings(
  admin: boolean,
  push: (path: string) => void,
) {
  React.useEffect(() => {
    if (!admin) return;

    let pendingG = false;
    let timer: number | null = null;

    const clear = () => {
      pendingG = false;
      if (timer) window.clearTimeout(timer);
      timer = null;
    };

    const arm = () => {
      pendingG = true;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(clear, 500);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      const key = e.key.toLowerCase();

      if (!pendingG) {
        if (key === "g") {
          e.preventDefault();
          arm();
        }
        return;
      }

      if (key === "e") {
        e.preventDefault();
        clear();
        push("/events");
        return;
      }

      if (key === "b") {
        e.preventDefault();
        clear();
        push("/users");
        return;
      }

      if (key === "a") {
        e.preventDefault();
        clear();
        push("/requests");
        return;
      }

      clear();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      clear();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [admin, push]);
}
