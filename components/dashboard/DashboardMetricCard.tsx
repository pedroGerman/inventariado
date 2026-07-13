import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { ffElevatedMetricSurfaceClass } from "@/lib/utils/ff-surfaces";
import { cn } from "@/lib/utils/cn";

interface DashboardMetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel?: string;
  valueClassName?: string;
  className?: string;
  href?: string;
  concealable?: boolean;
  concealed?: boolean;
  onToggleConcealed?: () => void;
}

export function DashboardMetricCard({
  icon: Icon,
  label,
  value,
  sublabel = "Esta semana",
  valueClassName,
  className,
  href,
  concealable = false,
  concealed = false,
  onToggleConcealed,
}: DashboardMetricCardProps) {
  const cardClassName = cn(
    ffElevatedMetricSurfaceClass,
    "flex flex-col px-3 pb-4 pt-2.5",
    href &&
    "transition-[box-shadow,transform] active:scale-[0.99]",
    className,
  );

  const content = (
    <div className="flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Icon className="size-4 text-primary" strokeWidth={2.25} />
          </div>
          <p className="min-w-0 truncate text-xs font-medium text-slate-600">
            {label}
          </p>
        </div>
        {concealable ? (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleConcealed?.();
            }}
            className="relative z-10 shrink-0 text-slate-400 hover:text-slate-600"
            aria-label={concealed ? `Mostrar ${label}` : `Ocultar ${label}`}
          >
            {concealed ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        ) : null}
      </div>
      <div className="flex flex-col gap-1 mt-3">
        <p
          className={cn(
            "text-lg font-medium tabular-nums leading-tight text-slate-900",
            valueClassName,
          )}
        >
          {value}
        </p>
        {sublabel ? (
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}
