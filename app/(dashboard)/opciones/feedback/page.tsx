"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { TextField, Textarea } from "@/components/ui/Input";
import { submitFeedback } from "@/lib/feedback/actions";

export default function FeedbackPage() {
  const router = useRouter();
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!message.trim()) {
      setError("El mensaje es obligatorio.");
      return;
    }

    setSaving(true);
    const result = await submitFeedback({
      senderName,
      senderEmail,
      message,
    });
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <>
        <Header title="Sugerencias" showBack backHref="/opciones" />
        <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-card-foreground">
            ¡Gracias por tu sugerencia!
          </h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            Recibimos tu sugerencia. Lo revisaremos pronto para seguir mejorando
            la app.
          </p>
          <Button
            type="button"
            variant="default"
            fullWidth
            className="mt-4 max-w-xs"
            onClick={() => router.push("/opciones")}
          >
            Volver a opciones
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Sugerencias" showBack backHref="/opciones" />

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="flex flex-col gap-5 px-3 pb-4 pt-8"
      >
        <p className="text-sm text-muted-foreground">
          Cuéntanos qué te gustaría mejorar, qué no funciona bien o qué idea
          tienes para la app.
        </p>

        <TextField
          label="Nombre (opcional)"
          placeholder="Tu nombre"
          value={senderName}
          onChange={(event) => setSenderName(event.target.value)}
          autoComplete="name"
        />

        <TextField
          label="Correo (opcional)"
          type="email"
          placeholder="tu@correo.com"
          value={senderEmail}
          onChange={(event) => setSenderEmail(event.target.value)}
          autoComplete="email"
        />

        <Textarea
          label="Mensaje *"
          placeholder="Escribe tu comentario..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={6}
          required
        />

        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={saving}
          disabled={saving}
        >
          Enviar sugerencia
        </Button>
      </form>
    </>
  );
}
