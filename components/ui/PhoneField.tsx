"use client";

import { cn } from "@/lib/utils/cn";
import { Input, selectSurfacePreset } from "@/components/ui/Input";
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

  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      ) : null}
      <div className="flex min-w-0 items-center gap-2">
        <select
          value={areaCode}
          onChange={(e) => onChange(composePhone(e.target.value, number))}
          aria-label="Código de área"
          className={cn(
            ...selectSurfacePreset,
            "h-9 w-[6.75rem] shrink-0 px-2",
          )}
        >
          {PHONE_AREA_CODES.map((code) => (
            <option key={code} value={code}>
              +1 {code}
            </option>
          ))}
        </select>
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
          className="min-w-0 flex-1"
        />
      </div>
    </div>
  );
}
