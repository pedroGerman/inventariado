"use client";

import { useId } from "react";

import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/utils/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  id?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  className,
  id,
}: ToggleProps) {
  const generatedId = useId();
  const switchId = id ?? generatedId;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 py-3.5",
        className,
      )}
    >
      {label && (
        <label
          htmlFor={switchId}
          className="cursor-pointer text-sm text-card-foreground"
        >
          {label}
        </label>
      )}
      <Switch
        id={switchId}
        checked={checked}
        onCheckedChange={onChange}
        aria-label={label}
      />
    </div>
  );
}
