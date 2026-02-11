"use client";

import * as React from "react";
import { Button, type ButtonProps } from "./button";

export type IconButtonProps = Omit<ButtonProps, "children"> & {
  title: string;
  children: React.ReactNode;
};

export function IconButton({
  title,
  className,
  variant = "secondary",
  size = "sm",
  ...props
}: IconButtonProps) {
  return (
    <Button
      aria-label={title}
      title={title}
      variant={variant}
      size={size}
      className={[
        "h-8 w-8 px-0 py-0", // square
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
