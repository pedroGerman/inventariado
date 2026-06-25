"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import type * as React from "react";

import { cn } from "@/lib/utils/cn";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border-0 outline-none transition-[background-color,box-shadow]",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=unchecked]:bg-[var(--switch-track-off)] data-[state=unchecked]:shadow-switch-track",
        "data-[state=checked]:bg-[var(--switch-track-on)] data-[state=checked]:shadow-switch-track-on",
        "dark:data-[state=unchecked]:bg-ff-surface-3 dark:data-[state=unchecked]:shadow-ff-surface-3",
        "dark:data-[state=checked]:bg-[var(--button-success)] dark:data-[state=checked]:shadow-switch-track-on",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-3.5 rounded-full transition-[transform,background-color,box-shadow] duration-200 ease-out",
          "translate-x-[3px] group-data-[state=checked]:translate-x-[18px]",
          "bg-[var(--switch-thumb-on)] shadow-switch-thumb-off",
          "group-data-[state=checked]:shadow-switch-thumb-on",
          "dark:bg-ff-surface-5 dark:shadow-ff-surface-7",
          "dark:group-data-[state=checked]:bg-white dark:group-data-[state=checked]:shadow-switch-thumb-on",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
