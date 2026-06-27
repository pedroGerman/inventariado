"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  PHONE_AREA_CODES,
  composePhone,
  parsePhone,
} from "@/lib/utils/phone";

interface PhoneFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  placeholder?: string;
}

export function PhoneField({
  label = "Teléfono",
  value,
  onChange,
  id = "phone",
  className,
  placeholder = "5551234",
}: PhoneFieldProps) {
  const { areaCode, number } = parsePhone(value);
  const [open, setOpen] = useState(false);
  const suppressOpenRef = useRef(false);

  function dismiss() {
    suppressOpenRef.current = true;
    setOpen(false);
    window.setTimeout(() => {
      suppressOpenRef.current = false;
    }, 400);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && suppressOpenRef.current) return;
    setOpen(nextOpen);
  }

  return (
    <div className={cn("w-full min-w-0", className)}>
      {label ? (
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      ) : null}
      <div className="flex min-w-0 items-center gap-2">
        <Select
          open={open}
          onOpenChange={handleOpenChange}
          value={areaCode}
          onValueChange={(code) => {
            onChange(composePhone(code, number));
            dismiss();
          }}
        >
          <SelectTrigger
            aria-label="Código de área"
            className="!h-9 !w-[6.75rem] shrink-0 rounded-md bg-input-surface px-2 text-base shadow-input-edge hover:bg-input-surface dark:hover:bg-input-surface"
            onPointerDown={(event) => {
              if (!open) return;
              event.preventDefault();
              dismiss();
            }}
          >
            <SelectValue asChild>
              <span className="truncate text-base text-foreground">
                +1 {areaCode}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent onDismiss={dismiss}>
            {PHONE_AREA_CODES.map((code) => (
              <SelectItem key={code} value={code}>
                +1 {code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={number}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 7);
            onChange(composePhone(areaCode, digits));
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 text-base"
        />
      </div>
    </div>
  );
}
