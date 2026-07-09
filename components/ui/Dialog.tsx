"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils/cn";

function Dialog({
  modal = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" modal={modal} {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=closed]:animate-dialog-overlay-out data-[state=open]:animate-dialog-overlay-in",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  overlayClassName,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  overlayClassName?: string;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border/70 bg-ff-surface-2 text-card-foreground shadow-ff-surface-2 outline-none data-[state=closed]:animate-dialog-content-out data-[state=open]:animate-dialog-content-in",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Cerrar"
          className="absolute top-3.5 right-3.5 rounded-md p-1.5 text-muted-foreground/80 outline-none transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex shrink-0 flex-col gap-1.5 border-b border-border/60 px-5 pt-5 pb-4 pr-12 text-left",
        className,
      )}
      {...props}
    />
  );
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-y-contain px-5 py-4 pb-6",
        className,
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex shrink-0 flex-col-reverse gap-2 border-t border-border/60 bg-surface-2/40 px-5 py-3",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold tracking-tight text-card-foreground", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}

interface AppDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  /**
   * Set false when nesting inside a drawer/dialog so closing this layer
   * does not dismiss the parent.
   */
  modal?: boolean;
}

function AppDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  overlayClassName,
  modal = true,
}: AppDialogProps) {
  return (
    <Dialog
      open={open}
      modal={modal}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className={className} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogBody>{children}</DialogBody>
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}

export {
  AppDialog,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
