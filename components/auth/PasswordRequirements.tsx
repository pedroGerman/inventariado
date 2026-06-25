"use client";

import { Check } from "lucide-react";

import { getPasswordChecks } from "@/lib/auth/password";
import { cn } from "@/lib/utils/cn";

const RULES = [
  {
    key: "length" as const,
    label: "Al menos 8 caracteres (incluye una letra)",
  },
  { key: "number" as const, label: "Al menos un número" },
  { key: "special" as const, label: "Al menos un carácter especial" },
];

export function PasswordRequirements({ password }: { password: string }) {
  const checks = getPasswordChecks(password);

  return (
    <ul className="space-y-2 pt-1">
      {RULES.map((rule) => {
        const met = checks[rule.key];

        return (
          <li
            key={rule.key}
            className={cn(
              "flex items-start gap-2 text-sm transition-colors",
              met ? "text-[var(--button-success)]" : "text-muted-foreground",
            )}
          >
            <Check
              className={cn(
                "mt-0.5 size-4 shrink-0",
                met ? "opacity-100" : "opacity-35",
              )}
              strokeWidth={2.5}
            />
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
