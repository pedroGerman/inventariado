"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getAccountProfile } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { cn } from "@/lib/utils/cn";

interface AccountProfileHeaderProps {
  className?: string;
}

export function AccountProfileHeader({ className }: AccountProfileHeaderProps) {
  useMockDBRefresh();
  const account = getAccountProfile();

  return (
    <section
      className={cn(
        "flex flex-col items-center gap-3 px-2 pb-2 pt-1 text-center",
        className,
      )}
    >
      <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-slate-900 bg-surface-2 text-3xl font-bold text-card-foreground shadow-card-edge">
        {account.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={account.avatar_url}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          account.full_name.charAt(0)
        )}
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900">{account.full_name}</h2>
        <p className="text-sm text-muted-foreground">@{account.username}</p>
      </div>

      <Button
        asChild
        variant="default"
        fullWidth
        size="sm"
        className="mt-1 max-w-xs !rounded-md !py-5 text-sm font-bold"
      >
        <Link href="/opciones/cuenta/editar">Editar perfil</Link>
      </Button>
    </section>
  );
}
