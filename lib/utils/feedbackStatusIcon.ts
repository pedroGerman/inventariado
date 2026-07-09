import type { FeedbackStatus } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";

export function getFeedbackStatusIconClassName(status: FeedbackStatus): string {
  const color = (() => {
    switch (status) {
      case "pending":
        return "text-warning";
      case "read":
        return "text-primary";
      case "resolved":
        return "text-slate-500";
      default:
        return "text-muted-foreground";
    }
  })();

  return cn("h-5 w-5", color);
}

export function getFeedbackStatusIconContainerClassName(
  status: FeedbackStatus,
  className?: string,
): string {
  return cn(
    "flex size-12 shrink-0 items-center justify-center rounded-full shadow-segmented-track",
    status === "pending" && "bg-orange-100",
    status === "read" && "bg-green-100",
    status === "resolved" && "bg-slate-100",
    className,
  );
}
