import { formatPhoneDisplay } from "@/lib/utils/phone";
import { cn } from "@/lib/utils/cn";

export interface ContactRowProps {
  name: string;
  phone?: string | null;
  tone?: "success" | "danger";
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function ContactRow({
  name,
  phone,
  tone = "success",
  onClick,
  selected = false,
  className,
}: ContactRowProps) {
  const content = (
    <>
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          tone === "success"
            ? "text-[var(--button-success)]"
            : "bg-destructive/10 text-destructive",
        )}
      >
        {name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-card-foreground">
          {name}
        </p>
        {phone ? (
          <p className="text-xs text-muted-foreground">
            {formatPhoneDisplay(phone)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Sin teléfono</p>
        )}
      </div>
    </>
  );

  const rowClassName = cn(
    "flex w-full items-center gap-3 py-3.5 text-left transition-colors",
    onClick && "hover:bg-surface-2 active:bg-surface-3",
    selected && "",
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={rowClassName}>
        {content}
      </button>
    );
  }

  return <div className={rowClassName}>{content}</div>;
}
