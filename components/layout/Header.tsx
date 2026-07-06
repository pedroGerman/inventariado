"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  onRefresh?: () => void;
  right?: React.ReactNode;
  businessName?: string;
  employeeName?: string;
  employeeRole?: string;
  avatarUrl?: string | null;
  showEmployeeSwitcher?: boolean;
  onSwitchEmployee?: () => void;
}

export function Header({
  title,
  subtitle,
  showBack,
  backHref,
  onRefresh,
  right,
  businessName,
  employeeName,
  employeeRole,
  avatarUrl,
}: HeaderProps) {
  const router = useRouter();

  if (businessName) {
    const avatarFallback =
      employeeName?.trim().charAt(0) || businessName.charAt(0);

    return (
      <header className="sticky top-0 z-30 bg-white border-slate-200 px-4 pb-3 pt-5">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-bold text-primary">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              avatarFallback
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
            <p className="truncate font-semibold text-sm text-slate-900">{businessName}</p>
            <p className="truncate text-xs text-slate-500">
              {employeeName} · {employeeRole}
            </p>
          </div>
          {/* {showEmployeeSwitcher && (
            <button
              onClick={onSwitchEmployee}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600"
            >
              Cambiar empleado
            </button>
          )} */}
        </div>
      </header>
    );
  }

  if(showBack){
    return (
      <header className="sticky top-0 z-30 flex items-center text-center gap-3 px-4 border-b-2 border-slate-200 bg-white pb-5 pt-6">
          <button
            type="button"
            onClick={() => (backHref ? router.push(backHref) : router.back())}
            className="flex h-8 w-8 absolute items-center justify-center  bg-white text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="size-5" />
          </button>
        <div className="flex-1 min-w-0">
          {title && (
            <h1 className={cn("font-medium text-slate-900 text-base")}>
              {title}
            </h1>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-white px-4 pb-1 pt-5">
      <div className="flex-1 min-w-0">
        {title && (
          <h1 className={cn("font-semibold text-slate-900", subtitle ? "text-base" : "text-xl")}>
            {title}
          </h1>
        )}
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      {onRefresh && (
        <button onClick={onRefresh} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
          <RefreshCw className="h-4 w-4" />
        </button>
      )}
      {right}
    </header>
  );
}
