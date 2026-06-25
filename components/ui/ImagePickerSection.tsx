"use client";

import { useRef } from "react";
import { ChevronRight, ImagePlus, X } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface ImagePickerSectionProps {
  imageUrl: string | null;
  onChange: (url: string | null) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  filledTitle?: string;
  filledDescription?: string;
  ariaLabel?: string;
  className?: string;
}

function ImagePickerSection({
  imageUrl,
  onChange,
  emptyTitle = "Agregar imagen",
  emptyDescription = "Foto o ícono",
  filledTitle = "Cambiar imagen",
  filledDescription = "Toca para reemplazar la imagen",
  ariaLabel,
  className,
}: ImagePickerSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  const title = imageUrl ? filledTitle : emptyTitle;
  const description = imageUrl ? filledDescription : emptyDescription;

  return (
    <section className={cn("flex flex-col gap-2", className)}>
      <h2 className="text-sm font-semibold text-card-foreground">Imagen</h2>
      <div className="relative">
        <button
          type="button"
          className="w-full text-left"
          aria-label={ariaLabel ?? title}
          onClick={() => inputRef.current?.click()}
        >
          <Card className="gap-0 !py-5 transition-[box-shadow] hover:shadow-ff-surface-4">
            <CardContent className="flex items-center gap-3 !px-5">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2 shadow-segmented-track">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <ImagePlus className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-card-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        </button>

        {imageUrl ? (
          <button
            type="button"
            aria-label="Quitar imagen"
            onClick={() => onChange(null)}
            className="absolute right-3 top-3 rounded-full bg-surface-0/90 p-1 text-muted-foreground shadow-card-edge hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </section>
  );
}

export { ImagePickerSection };
