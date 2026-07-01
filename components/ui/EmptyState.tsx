import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center px-4 py-12 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export { EmptyState };
