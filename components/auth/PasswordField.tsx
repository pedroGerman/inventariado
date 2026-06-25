"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { TextField } from "@/components/ui/Input";

interface PasswordFieldProps {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultValue?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}

export function PasswordField({
  id = "password",
  name = "password",
  label = "Contraseña",
  value,
  onChange,
  defaultValue,
  required,
  autoComplete = "current-password",
  placeholder = "••••••••",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      id={id}
      name={name}
      label={label}
      type={visible ? "text" : "password"}
      value={value}
      onChange={onChange}
      defaultValue={defaultValue}
      required={required}
      autoComplete={autoComplete}
      placeholder={placeholder}
      rightElement={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      }
    />
  );
}
