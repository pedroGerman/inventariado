import { Check, Minus, Workflow, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type CheckState =
  | "success"
  | "failure"
  | "cancelled"
  | "pending"
  | "waiting"
  | "skipped"
  | "expected";

const CI_STATUS_BADGE_CLASS =
  "flex size-3.5 shrink-0 items-center justify-center rounded-full";

const CI_STATUS_GLYPH = "h-3 w-3 text-white stroke-[3.5]" as const;
const CI_STATUS_COMPACT_GLYPH = "h-2.5 w-2.5 text-white stroke-[3]" as const;
const CI_STATUS_CANCELLED_GLYPH = "h-2.5 w-2.5 text-black stroke-[3]" as const;

const CI_STATUS_NEUTRAL_BADGE_CLASS = cn(
  CI_STATUS_BADGE_CLASS,
  "bg-muted-foreground",
);

const CI_STATUS_SKIPPED_BADGE_CLASS = cn(
  CI_STATUS_BADGE_CLASS,
  "border-[1.5px] border-muted-foreground bg-transparent",
);

function CiPendingSpinner() {
  return (
    <div className="size-3.5 animate-spin">
      <svg className="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle
          cx="8"
          cy="8"
          r="6"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.25"
        />
        <path
          d="M14 8a6 6 0 0 0-6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function CheckStateIcon({ state }: { state: CheckState }) {
  if (state === "success") {
    return (
      <div
        className={cn(
          CI_STATUS_BADGE_CLASS,
          "bg-[var(--button-success)] dark:bg-green-600",
        )}
      >
        <Check className={CI_STATUS_GLYPH} aria-hidden />
      </div>
    );
  }
  if (state === "failure") {
    return (
      <div
        className={cn(CI_STATUS_BADGE_CLASS, "bg-destructive dark:bg-red-600")}
      >
        <X className={CI_STATUS_COMPACT_GLYPH} aria-hidden />
      </div>
    );
  }
  if (state === "cancelled") {
    return (
      <div className={CI_STATUS_NEUTRAL_BADGE_CLASS}>
        <Minus className={CI_STATUS_CANCELLED_GLYPH} aria-hidden />
      </div>
    );
  }
  if (state === "skipped") {
    return <div className={CI_STATUS_SKIPPED_BADGE_CLASS} aria-hidden />;
  }
  if (state === "waiting") {
    return (
      <div className="flex size-3.5 shrink-0 items-center justify-center text-muted-foreground">
        <Workflow className="h-3.5 w-3.5" aria-hidden />
      </div>
    );
  }
  if (state === "expected") {
    return (
      <div className="flex size-3.5 shrink-0 items-center justify-center text-yellow-500">
        <div className="size-1.5 rounded-full bg-current" />
      </div>
    );
  }
  return (
    <div className="flex size-3.5 shrink-0 items-center justify-center text-yellow-500">
      <CiPendingSpinner />
    </div>
  );
}
