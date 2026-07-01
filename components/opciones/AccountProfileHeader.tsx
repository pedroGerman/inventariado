"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getProfile } from "@/lib/profile/actions";
import type { AccountProfile } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";

interface AccountProfileHeaderProps {
  className?: string;
}

export function AccountProfileHeader({ className }: AccountProfileHeaderProps) {
  const [account, setAccount] = useState<AccountProfile | null>(null);

  useEffect(() => {
    void getProfile().then(setAccount);
  }, []);

  const initial = account?.full_name?.charAt(0) ?? "?";
  const displayName = account?.full_name?.trim() || "Tu cuenta";
  const username = account?.username?.trim() || "usuario";

  return (
    <section
      className={cn(
        "flex flex-col items-center gap-3 px-2 pb-2 pt-1 text-center",
        className,
      )}
    >
      <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-slate-900 bg-surface-2 text-3xl font-bold text-card-foreground shadow-card-edge">
        {account?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={account.avatar_url}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          initial
        )}
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
        <p className="text-sm text-muted-foreground">@{username}</p>
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
