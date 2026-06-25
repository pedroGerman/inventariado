/**
 * Fluid Functionalism lifted surfaces — backgrounds + Fluid shadow stacks.
 *
 * Banner strips: compose `ffElevatedBannerLiftClass` with your rounding
 * (`rounded-lg`, `rounded-xl`, `rounded-t-lg`, …). Fully rounded tiles use
 * `ffElevatedMetricSurfaceClass`.
 */
import { cn } from "@/lib/utils/cn";

export const ffElevatedBannerLiftClass = cn(
  "border-0 bg-surface-3 text-card-foreground transition-[color,background-color,box-shadow]",
  "shadow-overview-metric dark:bg-ff-surface-3 dark:shadow-ff-surface-3",
);

/**
 * Banner strip nested inside a surface-3 elevated card (e.g. release attachment
 * rows): one FF step lighter in dark mode (`ff-surface-4`) so it reads as raised
 * above the card instead of blending into it. Light mode keeps the resting
 * surface — elevation there comes from the shadow.
 */
export const ffElevatedBannerLiftRaisedClass = cn(
  "border-0 bg-surface-3 text-card-foreground transition-[color,background-color,box-shadow]",
  "shadow-overview-metric dark:bg-ff-surface-4 dark:shadow-ff-surface-4",
);

/** Explorer shell commit header — opacity tint only; avoids fighting the shell inset. */
export const ffExplorerShellHeaderTintClass =
  "bg-black/[0.02] dark:bg-white/[0.03]";

/** Sticky bar shell — diff file headers, aligned with compact list section headers. */
export const ffDiffStickyBarClassName =
  "sticky top-0 z-10 select-none border-b border-border bg-ff-surface-2 px-4 py-2 sm:px-5";

/** Rounded-xl elevated tile — overview metrics, sidebar metrics, sticky group chrome. */
export const ffElevatedMetricSurfaceClass = cn(
  "rounded-xl",
  ffElevatedBannerLiftClass,
);

/** Orange-tinted elevated tile — deudas por cobrar, warning summaries. */
export const ffElevatedWarningSurfaceClass = cn(
  "rounded-xl border-0 bg-[var(--button-warning-border)] text-[var(--button-warning-foreground)] transition-[background-color,box-shadow]",
  "shadow-button-tone-orange-rest hover:bg-[var(--button-warning-border-hover)] hover:shadow-button-tone-orange-hover",
  "dark:bg-orange-600 dark:text-white dark:hover:bg-orange-500 dark:shadow-button-tone-orange-rest dark:hover:shadow-button-tone-orange-hover",
);

/** Active shadow when a sticky group header is pinned during scroll. */
export const ffStickyGroupBannerActiveShadow = "shadow-ff-surface-5";

/** Active /repos sidebar metric card — resting bg + shadow for list sort selectors. */
export const ffSidebarMetricActiveSurfaceClass =
  "bg-ff-surface-4 shadow-ff-surface-4";

/**
 * Anchor metric cards (/pulls /issues /reviews queues) — match the elevated
 * select trigger: pure-white surface + layered FF-4 shadow in light mode.
 * Dark mode keeps the existing resting FF-3 surface (no visual change there).
 */
export const ffSelectMatchedMetricSurfaceClass = cn(
  "rounded-xl border-0 text-card-foreground transition-[color,background-color,box-shadow]",
  "bg-ff-surface-4 shadow-ff-surface-4",
  "dark:bg-ff-surface-3 dark:shadow-ff-surface-3",
);

/** Settings hub + subpages — same light inset highlight as overview/home cards. */
export const ffSettingsCardShellClass = cn(
  "bg-surface-3 shadow-overview-metric dark:bg-ff-surface-3 dark:shadow-ff-surface-3",
);

export const ffSettingsElevatedSurfaceClass = cn(
  "rounded-xl border-0 text-card-foreground transition-[color,background-color,box-shadow]",
  ffSettingsCardShellClass,
);

/** Icon chip on elevated cards — one FF step above resting banner lift. */
export const ffElevatedIconShellClassName = cn(
  "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
  "border-0 bg-ff-surface-5 text-card-foreground shadow-ff-surface-4",
  "transition-[color,background-color,box-shadow]",
);

/** Elevated surface-3 tiles — same hover fill as repo list rows. */
export const ffMetricTileInteractiveHover = cn(
  "hover:bg-surface-2 dark:hover:bg-ff-surface-4",
);

/** Inline monospace copy pills — branch names, SHAs, refs. */
export const ffCopyBadgeClass = cn(
  "rounded-md border-0 font-mono transition-colors",
  "bg-ff-surface-3 text-foreground dark:bg-ff-surface-4",
  "hover:bg-ff-surface-4 dark:hover:bg-ff-surface-5",
);

/** Comment/diff thread cards — card-edge in light; not used on list sidebar bars. */
export const ffCommentThreadSurfaceClass = cn(
  "rounded-xl border-0 bg-surface-3 text-card-foreground transition-[color,background-color,box-shadow]",
  "shadow-card-edge dark:bg-ff-surface-3 dark:shadow-ff-surface-3",
);

/** Pending inline diff comments. */
export const ffPendingCommentCardClassName = cn(
  "w-full bg-surface-3 shadow-card-edge dark:bg-ff-surface-4 dark:shadow-ff-surface-4",
);
