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
  /**
   * When false, vaul will not resize/reposition the drawer on keyboard open.
   * Useful for search drawers with a sticky input + scrollable list.
   */
  repositionInputs?: boolean;
  /**
   * When true, the body is a flex column with overflow hidden so children can
   * own scrolling (e.g. sticky search + list).
   */
  fillHeight?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  snapPoint,
  fitContent,
  repositionInputs,
  fillHeight,
}: ModalProps) {
  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={title}
      className={className}
      snapPoint={snapPoint}
      fitContent={fitContent}
      repositionInputs={repositionInputs}
      fillHeight={fillHeight}
    >
      {children}
    </AppDrawer>
  );
}
