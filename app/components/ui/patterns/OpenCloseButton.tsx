"use client";

import * as React from "react";
import {
  Button,
  type ButtonProps,
} from "@/app/components/ui/primitives/button";

export type OpenCloseButtonProps = Omit<ButtonProps, "children"> & {
  target: "open" | "close";
  children?: React.ReactNode;
};

export default function OpenCloseButton({
  target,
  children,
  variant = "secondary",
  ...props
}: OpenCloseButtonProps) {
  return (
    <Button variant={variant} {...props}>
      {children ?? (target === "open" ? "Vis" : "Skjul")}
    </Button>
  );
}
