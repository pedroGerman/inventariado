import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface AuthScreenProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showBack?: boolean;
  backHref?: string;
  className?: string;
  subtitle?: string;
}

export function AuthScreen({
  title,
  children,
  footer,
  showBack = false,
  backHref = "/login",
  className,
  subtitle,
}: AuthScreenProps) {
  return (
    <div
      className={cn(
        "relative mx-auto flex min-h-screen w-full max-w-mobile items-center justify-center bg-surface-0 px-4 py-10",
        className,
      )}
    >
      

      <div className="w-full">

      {showBack ? (
        <Link
          href={backHref}
          className="left-4 top-8 inline-flex size-10 items-center justify-center rounded-full border border-border/60 bg-surface-3 text-card-foreground shadow-card-edge transition-colors hover:bg-surface-2"
          aria-label="Volver"
        >
          <ChevronLeft className="size-5" />
        </Link>
      ) : null}

        <h1 className="text-[1.75rem] mt-4 font-bold leading-tight tracking-tight text-card-foreground">
          {title}
        </h1>
        {subtitle && <p className="text-base mt-0.5 text-muted-foreground">{subtitle}</p>}
        <div className="mt-6">{children}</div>

        {footer ? (
          <div className="mt-5 text-center">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

export function AuthFooterLink({
  prompt,
  linkLabel,
  href,
}: {
  prompt: string;
  linkLabel: string;
  href: string;
}) {
  return (
    <p className="text-sm text-muted-foreground">
      {prompt}{" "}
      <Link
        href={href}
        className="font-medium text-card-foreground underline-offset-4 hover:underline"
      >
        {linkLabel}
      </Link>
    </p>
  );
}
