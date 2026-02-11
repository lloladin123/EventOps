// useFlashFocus.ts
import * as React from "react";

export function useFlashFocus(
  flash: (uid: string) => void,
  focus: (uid: string) => void
) {
  return React.useCallback(
    (uid: string) => {
      flash(uid);
      focus(uid);
    },
    [flash, focus]
  );
}
