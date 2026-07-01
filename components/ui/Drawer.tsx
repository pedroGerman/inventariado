"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function Drawer({
  shouldScaleBackground = false,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return (
    <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
  );
}

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/40", className)}
    {...props}
  />
));
DrawerOverlay.displayName = "DrawerOverlay";

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, style, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-mobile flex-col rounded-t-3xl bg-white shadow-xl outline-none",
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  /** Viewport fraction when open (0–1). Default 0.95 (95dvh). */
  snapPoint?: number;
  /** Size to content with min/max height constraints. */
  fitContent?: boolean;
}

function AppDrawer({
  open,
  onClose,
  title,
  children,
  className,
  snapPoint = 0.95,
  fitContent = false,
}: AppDrawerProps) {
  const drawerHeight = `${snapPoint * 100}dvh`;

  const content = (
    <DrawerContent
      className="flex min-h-0 flex-col"
      style={
        fitContent
          ? {
              height: "fit-content",
              minHeight: "50dvh",
              maxHeight: "95dvh",
            }
          : {
              height: drawerHeight,
              minHeight: "50dvh",
              maxHeight: drawerHeight,
            }
      }
    >
      <DrawerPrimitive.Handle className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-slate-300" />

      {title ? (
        <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-2">
          <DrawerPrimitive.Title className="text-lg font-bold text-slate-900">
            {title}
          </DrawerPrimitive.Title>
          <DrawerPrimitive.Close
            aria-label="Cerrar"
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </DrawerPrimitive.Close>
        </div>
      ) : null}

      <div
        data-vaul-no-drag
        className={cn(
          "safe-bottom min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-4",
          className,
        )}
      >
        {children}
      </div>
    </DrawerContent>
  );

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      {content}
    </Drawer>
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  AppDrawer,
};
