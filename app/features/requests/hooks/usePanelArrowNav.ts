"use client";

import * as React from "react";

type FocusKey = { eventId: string; uid: string };

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

function getFocusableRequests(panel: HTMLElement) {
  return Array.from(
    panel.querySelectorAll<HTMLElement>("[data-eventid][data-uid]")
  ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
}

function keyFromEl(el: HTMLElement): FocusKey | null {
  const eventId = el.getAttribute("data-eventid");
  const uid = el.getAttribute("data-uid");
  return eventId && uid ? { eventId, uid } : null;
}

function uniqueEventIdsInOrder(items: HTMLElement[]) {
  const ids: string[] = [];
  for (const el of items) {
    const eventId = el.getAttribute("data-eventid");
    if (eventId && !ids.includes(eventId)) ids.push(eventId);
  }
  return ids;
}

/**
 * ArrowUp/Down navigates between focusable request rows inside `ref`.
 * Shift+ArrowUp/Down jumps between event groups (data-eventid) while trying to keep uid.
 *
 * Requirements:
 * - Focus targets must have: data-eventid, data-uid, and be focusable (tabIndex != -1 or button/link)
 */
export function usePanelArrowNav(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean
) {
  React.useEffect(() => {
    const panel = ref.current;
    if (!panel) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!enabled) return;

      const active = document.activeElement as HTMLElement | null;
      if (!active || !panel.contains(active)) return;
      if (isTypingTarget(e.target)) return;

      const key = e.key;
      const isUp = key === "ArrowUp";
      const isDown = key === "ArrowDown";
      if (!isUp && !isDown) return;

      const items = getFocusableRequests(panel);
      if (items.length === 0) return;

      e.preventDefault();

      const curIndex = items.indexOf(active);
      const safeIndex = curIndex >= 0 ? curIndex : 0;

      const dir: 1 | -1 = isDown ? 1 : -1;

      // ArrowUp/Down: move row-by-row (wrap)
      if (!e.shiftKey) {
        const nextIndex = (safeIndex + dir + items.length) % items.length;
        items[nextIndex]?.focus();
        return;
      }

      // Shift+Arrow: jump between events (wrap)
      const curKey = keyFromEl(items[safeIndex]!);
      if (!curKey) return;

      const eventIds = uniqueEventIdsInOrder(items);
      const curEventIdx = eventIds.indexOf(curKey.eventId);
      if (curEventIdx < 0) return;

      const nextEventIdx =
        (curEventIdx + dir + eventIds.length) % eventIds.length;
      const nextEventId = eventIds[nextEventIdx]!;

      const keepUid = curKey.uid;

      const sameUidTarget =
        items.find((el) => {
          const k = keyFromEl(el);
          return k?.eventId === nextEventId && k.uid === keepUid;
        }) ?? null;

      const firstInEvent =
        items.find((el) => keyFromEl(el)?.eventId === nextEventId) ?? null;

      (sameUidTarget ?? firstInEvent)?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, ref]);
}
