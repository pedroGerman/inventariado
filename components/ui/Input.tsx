import * as React from "react";

import { cn } from "@/lib/utils/cn";

const inputSurfacePreset = [
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border-0 bg-input-surface px-3 py-1 text-base shadow-input-edge transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "focus-visible:ring-[2px] focus-visible:ring-neutral-200",
  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
] as const;

const selectSurfacePreset = [
  ...inputSurfacePreset,
  "select-chevron cursor-pointer",
] as const;

/** Blends into parent row (popover search, inline fields) — no well / edge shadow */
const inputUnstyledPreset =
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 rounded-none border-0 bg-transparent px-0 py-0 text-base outline-none shadow-none transition-[color] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-0 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40";

type InputProps = React.ComponentProps<"input"> & {
  unstyled?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type, unstyled, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={
        unstyled
          ? cn(inputUnstyledPreset, className)
          : cn(...inputSurfacePreset, className)
      }
      {...props}
    />
  );
});
Input.displayName = "Input";

export interface TextFieldProps extends Omit<InputProps, "unstyled"> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  labelClassName?: string;
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      error,
      helperText,
      fullWidth = true,
      leftIcon,
      rightElement,
      className,
      labelClassName,
      id,
      ...props
    },
    ref,
  ) {
    const inputId =
      id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={cn(fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn("mb-1.5 block text-xs font-medium text-slate-700", labelClassName)}
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <Input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            className={cn(
              leftIcon ? "pl-9" : undefined,
              rightElement ? "pr-10" : undefined,
              className,
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 text-muted-foreground">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  },
);
TextField.displayName = "TextField";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, helperText, fullWidth = true, className, id, ...props },
    ref,
  ) {
    const inputId =
      id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={cn(fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(
            ...inputSurfacePreset,
            "h-auto min-h-[80px] py-2",
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  labelClassName?: string;
}

export const NativeSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
  function NativeSelect(
    {
      label,
      error,
      helperText,
      fullWidth = true,
      className,
      labelClassName,
      id,
      children,
      ...props
    },
    ref,
  ) {
    const inputId =
      id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={cn(fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "mb-1.5 block text-xs font-medium text-slate-700",
              labelClassName,
            )}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(...selectSurfacePreset, className)}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  },
);
NativeSelect.displayName = "NativeSelect";

export { Input, TextField, inputSurfacePreset, selectSurfacePreset };
export type { InputProps };
