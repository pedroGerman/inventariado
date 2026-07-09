/** Returns true when the event target is inside a portaled overlay (select, dialog, etc.). */
export function isPortaledOverlayTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;

  return (
    target.closest('[data-slot="select-content"]') != null ||
    target.closest('[data-slot="select-trigger"]') != null ||
    target.closest('[data-slot="dialog-content"]') != null ||
    target.closest('[data-slot="dialog-overlay"]') != null
  );
}

/** True while a Radix Select dropdown is open (body pointer-events may be disabled). */
export function isSelectOpenInDocument(): boolean {
  if (typeof document === "undefined") return false;
  return (
    document.querySelector('[data-slot="select-content"][data-state="open"]') !=
    null
  );
}
