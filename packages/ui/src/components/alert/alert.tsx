import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleCheck, Info, OctagonAlert, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Alert
 *
 * Something the page needs to say about itself, in place. An Alert sits in
 * the layout and stays there — it is not a Toast, which arrives, speaks and
 * leaves, and it is not a Dialog, which stops everything until answered.
 *
 * FROM FIGMA (`79:8042`, 12 variants = 4 tones × 3 actions), as drawn:
 *
 *   box        rounded-md, 1px border, padding 8/10, gap 8, centred
 *   tone       bg/<tone>/subtle + border/<tone>/emphasis — the tone lives in
 *              the surface and the border, and nowhere else
 *   icon       16px, per tone: Info · OctagonAlert · TriangleAlert ·
 *              CircleCheck, all at fg/neutral/emphasis
 *   title      label/lg, fg/neutral/emphasis
 *   body       body/md, fg/neutral/muted
 *   dismiss    16px, at the end of the title row — not the end of the box
 *   action     an xs Outline Button at the end of the box
 *
 * ⚠️ The icon and the dismiss take `fg/neutral/emphasis`, the same ink as the
 * title, in all four tones. That is Figma's spec, and it is why the tone has
 * to be carried by the surface — do not tint the icon to compensate.
 */
const alertVariants = cva(
  "flex w-full items-center gap-2 rounded-md border px-2.5 py-2 " +
    "[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-content-neutral-emphasis",
  {
    variants: {
      variant: {
        info: "bg-surface-info-subtle border-line-info-emphasis",
        destructive: "bg-surface-danger-subtle border-line-danger-emphasis",
        warning: "bg-surface-warning-subtle border-line-warning-emphasis",
        success: "bg-surface-success-subtle border-line-success-emphasis",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

const ICONS = {
  info: Info,
  destructive: OctagonAlert,
  warning: TriangleAlert,
  success: CircleCheck,
} as const;

export interface AlertProps
  extends Omit<React.ComponentProps<"div">, "title">,
    VariantProps<typeof alertVariants> {
  /** Hide the tone icon. Figma's `Icon` boolean. */
  icon?: boolean;
  /** Renders the dismiss control at the end of the title row. */
  onDismiss?: () => void;
  /** Label for the dismiss control — it is an icon, so it needs words. */
  dismissLabel?: string;
  /** The trailing action, an xs Outline Button in Figma's `Action=Button`. */
  action?: React.ReactNode;
}

export function Alert({
  className,
  variant = "info",
  icon = true,
  onDismiss,
  dismissLabel = "Dismiss",
  action,
  children,
  ...props
}: AlertProps) {
  const Icon = ICONS[variant ?? "info"];
  return (
    <div
      // No role by default, on purpose. `role="alert"` interrupts a screen
      // reader mid-sentence: right for something that just happened, wrong
      // for something that was on the page when it loaded — and an Alert is
      // usually the second. The caller knows which it is, so the caller says:
      // `role="alert"` for something that just went wrong, `role="status"`
      // for something that just succeeded, nothing for a standing notice.
      data-slot="alert"
      data-variant={variant}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon ? <Icon data-slot="alert-icon" aria-hidden /> : null}
      <div data-slot="alert-body" className="flex min-w-0 flex-1 flex-col gap-1">
        {children}
      </div>
      {onDismiss ? (
        <button
          type="button"
          data-slot="alert-dismiss"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className={cn(
            "-me-0.5 flex size-4 shrink-0 items-center justify-center self-start rounded-xs",
            "text-content-neutral-emphasis outline-none transition-colors",
            "hover:bg-surface-layer-on-emphasis-subtle",
            "focus-visible:bg-surface-layer-on-emphasis-subtle",
            "focus-visible:ring-2 focus-visible:ring-line-focused",
          )}
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
      {action ? (
        <div data-slot="alert-action" className="shrink-0 self-center">
          {action}
        </div>
      ) : null}
    </div>
  );
}

/** label/lg, the emphasis ink. One line — a title that wraps is a description. */
export function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("text-label-lg text-content-neutral-emphasis", className)}
      {...props}
    />
  );
}

/** body/md, muted. Says what happened and what to do about it. */
export function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-body-md text-content-neutral-muted", className)}
      {...props}
    />
  );
}

export { alertVariants };
