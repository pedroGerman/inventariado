"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Branch as DismissableLayerBranch } from "@radix-ui/react-dismissable-layer";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Children, isValidElement, useRef, useState } from "react";
import type * as React from "react";

import { liftedPopoverSurfaceClassName } from "@/lib/utils/ff-surfaces";
import { cn } from "@/lib/utils/cn";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

type SelectSize = "sm" | "md";

function SelectTrigger({
  className,
  children,
  size = "md",
  type = "button",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: SelectSize;
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      type={type}
      className={cn(
        "group flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg border-0 font-medium outline-none",
        "bg-surface-3 text-foreground shadow-overview-metric hover:bg-surface-2",
        "dark:bg-ff-surface-3 dark:text-foreground dark:shadow-ff-surface-3 dark:hover:bg-ff-surface-4 dark:hover:shadow-ff-surface-4",
        "aria-invalid:ring-2 aria-invalid:ring-destructive/40 disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:ring-2 focus-visible:ring-ring/40",
        "data-[placeholder]:text-foreground/80",
        size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-sm",
        "[&>[data-slot=select-value]]:min-w-0 [&>[data-slot=select-value]]:flex-1 [&>[data-slot=select-value]]:truncate",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-3.5 opacity-60 transition-transform group-data-[state=open]:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function isSelectTriggerTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest('[data-slot="select-trigger"]') != null
  );
}

function SelectFieldTrigger({
  open,
  dismiss,
  className,
  onPointerDownCapture,
  ...props
}: React.ComponentProps<typeof SelectTrigger> & {
  open: boolean;
  dismiss: () => void;
}) {
  return (
    <DismissableLayerBranch className={cn(open && "pointer-events-auto")}>
      <SelectTrigger
        {...props}
        className={cn(className, open && "pointer-events-auto")}
        onPointerDownCapture={(event) => {
          onPointerDownCapture?.(event);
          if (!open) return;
          event.preventDefault();
          event.stopPropagation();
          dismiss();
        }}
      />
    </DismissableLayerBranch>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  onCloseAutoFocus,
  onPointerDownOutside,
  onDismiss,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & {
  onDismiss?: () => void;
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          liftedPopoverSurfaceClassName,
          "relative z-[110] max-h-44 min-w-[8rem] overflow-hidden rounded-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onCloseAutoFocus?.(event);
        }}
        onPointerDownOutside={(event) => {
          if (isSelectTriggerTarget(event.target)) {
            event.preventDefault();
            return;
          }
          event.preventDefault();
          onDismiss?.();
          onPointerDownOutside?.(event);
        }}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "max-h-40 overflow-y-auto p-1",
            position === "popper" &&
              "w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-sm font-medium", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-2 overflow-hidden rounded-md py-1.5 pl-2 pr-8 text-sm outline-none",
        "focus:bg-surface-2 focus:text-foreground dark:focus:bg-ff-surface-4",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUp className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDown className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

function getSelectedLabel(
  children: React.ReactNode,
  value: string | undefined,
): React.ReactNode {
  if (value == null) return undefined;

  for (const child of Children.toArray(children)) {
    if (!isValidElement<{ value?: string; children?: React.ReactNode }>(child)) {
      continue;
    }

    if (child.props.value === value) {
      return child.props.children;
    }

    if (child.props.children) {
      const nested = getSelectedLabel(child.props.children, value);
      if (nested !== undefined) return nested;
    }
  }

  return undefined;
}

export interface SelectFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  size?: SelectSize;
  id?: string;
  labelClassName?: string;
  contentSide?: "top" | "right" | "bottom" | "left";
  avoidCollisions?: boolean;
}

function SelectField({
  label,
  error,
  helperText,
  fullWidth = true,
  value,
  onValueChange,
  placeholder,
  disabled,
  children,
  className,
  triggerClassName,
  size = "md",
  id,
  labelClassName,
  contentSide = "bottom",
  avoidCollisions = false,
}: SelectFieldProps) {
  const fieldId =
    id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const [open, setOpen] = useState(false);
  const suppressOpenRef = useRef(false);

  function dismiss() {
    suppressOpenRef.current = true;
    setOpen(false);
    window.setTimeout(() => {
      suppressOpenRef.current = false;
    }, 400);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && suppressOpenRef.current) return;
    setOpen(nextOpen);
  }

  const selectedLabel = getSelectedLabel(children, value);
  const displayText =
    selectedLabel != null && selectedLabel !== ""
      ? selectedLabel
      : placeholder ?? "";

  return (
    <div className={cn(fullWidth && "w-full", className)}>
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(
            "mb-1 block text-sm font-medium text-slate-700",
            labelClassName,
          )}
        >
          {label}
        </label>
      )}
      <Select
        open={open}
        onOpenChange={handleOpenChange}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectFieldTrigger
          id={fieldId}
          open={open}
          dismiss={dismiss}
          size={size}
          aria-invalid={error ? true : undefined}
          className={triggerClassName}
        >
          <SelectValue asChild placeholder={placeholder}>
            <span className="pointer-events-none min-w-0 flex-1 truncate text-left text-foreground">
              {displayText || placeholder || "\u00A0"}
            </span>
          </SelectValue>
        </SelectFieldTrigger>
        <SelectContent
          side={contentSide}
          avoidCollisions={avoidCollisions}
          sideOffset={4}
          onDismiss={dismiss}
        >
          {children}
        </SelectContent>
      </Select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      {helperText && !error && (
        <p className="mt-2 text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

export {
  Select,
  SelectContent,
  SelectField,
  SelectFieldTrigger,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
