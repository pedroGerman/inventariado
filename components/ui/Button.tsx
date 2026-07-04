import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-xl text-[13px] font-medium transition-[color,background-color,box-shadow,transform] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "border-0 bg-[oklch(0.21_0_0)] text-primary-foreground shadow-button-tone-primary-rest active:bg-[oklch(0.18_0_0)] dark:shadow-button-tone-primary-rest",
        destructive:
          "border-0 bg-destructive text-white shadow-button-tone-red-rest active:bg-[#c7070c] focus-visible:ring-destructive/20 dark:active:bg-destructive/90 dark:focus-visible:ring-destructive/40",
        success:
          "border-0 bg-[var(--button-success)] text-white shadow-button-tone-green-rest active:bg-[var(--button-success-hover)] focus-visible:ring-green-600/20 dark:bg-green-600 dark:active:bg-green-700 dark:shadow-button-tone-green-rest dark:focus-visible:ring-green-600/40",
        gold: "border-0 bg-[var(--button-gold)] text-[var(--button-gold-foreground)] shadow-button-tone-gold-rest active:bg-[var(--button-gold-hover)] focus-visible:border-transparent focus-visible:ring-yellow-600/35 dark:bg-yellow-500 dark:text-neutral-950 dark:active:bg-yellow-600 dark:shadow-button-tone-gold-rest dark:focus-visible:ring-yellow-500/45",
        warning:
          "border-0 bg-[var(--button-warning-border)] text-white shadow-button-tone-orange-rest active:bg-[var(--button-warning-border-hover)] focus-visible:ring-orange-500/25 dark:bg-orange-600 dark:active:bg-orange-500 dark:shadow-button-tone-orange-rest dark:focus-visible:ring-orange-500/35",
        outline:
          "border-0 bg-ff-surface-2 text-accent-foreground shadow-ff-surface-2 active:bg-ff-surface-3",
        secondary:
          "border-0 bg-surface-2 text-secondary-foreground shadow-card-edge dark:bg-ff-surface-3 dark:shadow-ff-surface-3",
        subtle:
          "border border-secondary bg-secondary text-secondary-foreground shadow-none active:bg-secondary/85",
        ghost:
          "border-0 shadow-none active:bg-neutral-200/50 dark:active:bg-accent dark:active:text-accent-foreground",
        link: "border-0 text-primary underline-offset-4 shadow-none active:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        xxs: "h-6 gap-1.5 px-2.5",
        xs: "h-7 gap-1.5 px-2.5",
        sm: "h-8 gap-1.5 px-3",
        lg: "h-10 px-6",
        touch: "h-auto min-h-[48px] px-5 py-3 text-sm font-semibold",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "success",
      size: "touch",
    },
  },
);

type LegacyVariant = "primary" | "danger" | "dark";
type ButtonVariantName = NonNullable<VariantProps<typeof buttonVariants>["variant"]> | LegacyVariant;

function resolveVariant(variant?: ButtonVariantName) {
  if (variant === "primary") return "success";
  if (variant === "danger") return "destructive";
  if (variant === "dark") return "default";
  return variant;
}

type ButtonIcon = React.ReactNode;

function Button({
  children,
  className,
  variant,
  size,
  asChild = false,
  iconLeft,
  iconRight,
  fullWidth,
  loading,
  disabled,
  ...props
}: React.ComponentProps<"button"> &
  Omit<VariantProps<typeof buttonVariants>, "variant"> & {
    asChild?: boolean;
    iconLeft?: ButtonIcon;
    iconRight?: ButtonIcon;
    fullWidth?: boolean;
    loading?: boolean;
    variant?: ButtonVariantName;
  }) {
  const Comp = asChild ? Slot : "button";
  const resolvedVariant = resolveVariant(variant);

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant: resolvedVariant, size, className }),
        fullWidth && "w-full",
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : iconLeft ? (
        <span
          data-slot="button-icon"
          data-side="left"
          aria-hidden="true"
          className="w-fit"
        >
          {iconLeft}
        </span>
      ) : null}
      <Slottable>{children}</Slottable>
      {!loading && iconRight ? (
        <span
          data-slot="button-icon"
          data-side="right"
          aria-hidden="true"
          className="shrink-0"
        >
          {iconRight}
        </span>
      ) : null}
    </Comp>
  );
}

export { Button, buttonVariants };
