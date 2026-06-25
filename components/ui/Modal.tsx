"use client";

import { AppDrawer } from "./Drawer";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  /** Viewport fraction when open (0–1). Default 0.9 (90dvh). */
  snapPoint?: number;
  fitContent?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  snapPoint,
  fitContent,
}: ModalProps) {
  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={title}
      className={className}
      snapPoint={snapPoint}
      fitContent={fitContent}
    >
      {children}
    </AppDrawer>
  );
}
