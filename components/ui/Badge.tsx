import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "danger" | "warning" | "neutral";
  size?: "default" | "xs";
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  size = "default",
  className,
}: BadgeProps) {
  const variants = {
    primary: "bg-green-100 text-primary",
    danger: "bg-red-100 text-danger",
    warning: "bg-orange-100 text-warning",
    neutral: "bg-slate-100 text-slate-600",
  };

  const sizes = {
    default: "px-2 py-0.5",
    xs: "h-7 px-2.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full text-xs font-medium",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
