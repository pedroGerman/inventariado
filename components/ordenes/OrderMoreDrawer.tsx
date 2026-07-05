"use client";

import Link from "next/link";
import {
  Copy,
  Download,
  FileText,
  Play,
  Trash2,
  Wallet,
} from "lucide-react";
import { AppDrawer } from "@/components/ui/Drawer";
import { cn } from "@/lib/utils/cn";

interface MoreMenuItem {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  href?: string;
  tone?: "default" | "danger";
}

interface OrderMoreDrawerProps {
  open: boolean;
  onClose: () => void;
  items: MoreMenuItem[];
}

function MenuRow({
  icon: Icon,
  label,
  onClick,
  href,
  tone = "default",
}: MoreMenuItem) {
  const className = cn(
    "flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium transition-colors",
    tone === "danger"
      ? "text-destructive hover:bg-red-50"
      : "text-card-foreground hover:bg-surface-2",
  );

  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
}

export function OrderMoreDrawer({ open, onClose, items }: OrderMoreDrawerProps) {
  return (
    <AppDrawer open={open} onClose={onClose} title="Más opciones" fitContent snapPoint={0.5}>
      <div className="flex flex-col gap-1 pb-2">
        {items.map((item) => (
          <MenuRow
            key={item.label}
            {...item}
            onClick={() => {
              item.onClick?.();
              if (!item.href) onClose();
            }}
          />
        ))}
      </div>
    </AppDrawer>
  );
}

export const orderMoreIcons = {
  duplicate: Copy,
  debt: Wallet,
  quote: FileText,
  resume: Play,
  delete: Trash2,
  download: Download,
};
