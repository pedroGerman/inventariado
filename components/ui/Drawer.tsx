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
        "fixed inset-x-0 bottom-0 z-50 mx-auto flex h-auto w-full max-w-mobile flex-col rounded-t-3xl bg-white shadow-xl outline-none",
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
  /** Viewport fraction when open (0–1). Default 0.9 (90dvh). */
  snapPoint?: number;
  /** Size to content instead of the default snap height. */
  fitContent?: boolean;
}

function AppDrawer({
  open,
  onClose,
  title,
  children,
  className,
  snapPoint = 0.9,
  fitContent = false,
}: AppDrawerProps) {
  const drawerHeight = `${snapPoint * 100}dvh`;

  const content = (
    <DrawerContent
      className={cn(!fitContent && "flex flex-col")}
      style={
        fitContent
          ? undefined
          : { height: drawerHeight, maxHeight: drawerHeight }
      }
    >
      <DrawerPrimitive.Handle className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-slate-300" />
      <div
        className={cn(
          "safe-bottom flex min-h-0 flex-1 flex-col px-4 pb-6 pt-2",
          fitContent && "max-h-[95dvh] overflow-y-auto",
          className,
        )}
      >
        {title && (
          <div className="mb-4 flex shrink-0 items-center justify-between">
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
        )}
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
