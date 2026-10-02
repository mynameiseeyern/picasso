import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../button/button";
import { overlayScrimVariants } from "../overlay/overlay";

/**
 * BottomSheet — Figma `Bottom sheet` 40000659:233 (Overlays → Bottom sheet),
 * rows `Bottom sheet / Item` 40000658:32195. The phone-sized answer to a
 * Select or a filter Popover: a panel that rises from the bottom edge over the
 * scrim, so its choices sit where a thumb already is.
 *
 * Drawn from the Clarion Endpoints mobile work (Status, Location and Sort),
 * where anchored popovers below md clipped against the viewport and put
 * 32-tall rows under a thumb.
 *
 * Anatomy, top to bottom: a decorative handle (36 × 4, bg/layer/emphasis),
 * a header row (title heading/md + a ghost close), a scrolling body, and an
 * optional footer whose buttons share the width (Clear + Apply).
 *
 * The panel: bg/overlay, radius/2xl on the top corners only, shadow/lg, a
 * border/neutral/muted top edge. Never full height — the cap leaves the page
 * peeking above it, which is what makes it read as temporary rather than as a
 * new screen. Padding is 16 on the sides (space/4) and 24 under the footer
 * (space/6) so the last button clears a phone's home indicator.
 *
 * Built on Radix Dialog, like Drawer: Esc and a tap on the scrim close it,
 * focus is trapped while it is open and returns to the trigger after.
 *
 * ⚠️ The handle does not drag. There are no motion tokens yet, and a sheet
 * whose only exit is a gesture is a sheet a keyboard or switch user cannot
 * leave — so the close button is always drawn, and the handle is decoration.
 * No motion either, for the same reason as Drawer.
 *
 * ⚠️ Not for navigation. A phone's main nav is full screen
 * (SidebarMobile); a sheet is for one decision about the page beneath it.
 */

export function BottomSheet(
  props: React.ComponentProps<typeof DialogPrimitive.Root>,
) {
  return <DialogPrimitive.Root data-slot="bottom-sheet" {...props} />;
}

export function BottomSheetTrigger(
  props: React.ComponentProps<typeof DialogPrimitive.Trigger>,
) {
  return (
    <DialogPrimitive.Trigger data-slot="bottom-sheet-trigger" {...props} />
  );
}

/** The unstyled primitive — wrap your own control. `BottomSheetCloseButton` is the drawn one. */
export function BottomSheetClose(
  props: React.ComponentProps<typeof DialogPrimitive.Close>,
) {
  return <DialogPrimitive.Close data-slot="bottom-sheet-close" {...props} />;
}

export interface BottomSheetContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content> {
  /** Accessible name for a sheet with no visible `BottomSheetTitle`. Mutually exclusive with it. */
  label?: string;
  /** The decorative handle. On by default; it never drags. */
  handle?: boolean;
}

export function BottomSheetContent({
  className,
  label,
  handle = true,
  children,
  ...props
}: BottomSheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="bottom-sheet-overlay"
        className={overlayScrimVariants()}
      />
      <DialogPrimitive.Content
        data-slot="bottom-sheet-content"
        aria-describedby={undefined}
        className={cn(
          "fixed inset-x-0 bottom-0 z-modal flex max-h-5/6 flex-col " +
            "rounded-t-2xl border-t border-line-neutral-muted bg-surface-overlay " +
            "shadow-lg outline-none",
          className,
        )}
        {...props}
      >
        {label ? (
          <DialogPrimitive.Title className="sr-only">{label}</DialogPrimitive.Title>
        ) : null}
        {handle ? (
          <div
            aria-hidden
            data-slot="bottom-sheet-handle"
            className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-surface-layer-emphasis"
          />
        ) : null}
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/** Title on the start, close on the end. */
export function BottomSheetHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bottom-sheet-header"
      className={cn("flex shrink-0 items-center gap-3 ps-4 pe-2 pt-2 pb-1", className)}
      {...props}
    />
  );
}

/** heading/md — the sheet is the whole of the user's attention while it is up. */
export function BottomSheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="bottom-sheet-title"
      className={cn("min-w-0 flex-1 text-heading-md text-content-neutral-emphasis", className)}
      {...props}
    />
  );
}

export function BottomSheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="bottom-sheet-description"
      className={cn("px-4 text-body-sm text-content-neutral-muted", className)}
      {...props}
    />
  );
}

export function BottomSheetCloseButton({
  label = "Close",
  ...props
}: React.ComponentProps<typeof Button> & { label?: string }) {
  return (
    <DialogPrimitive.Close asChild>
      <Button
        data-slot="bottom-sheet-close-button"
        variant="ghost"
        size="icon-md"
        aria-label={label}
        {...props}
      >
        <X aria-hidden />
      </Button>
    </DialogPrimitive.Close>
  );
}

/** The scrolling middle. `min-h-0` is what lets it scroll inside the capped column. */
export function BottomSheetBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bottom-sheet-body"
      className={cn("flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-2", className)}
      {...props}
    />
  );
}

/**
 * One choice: 48 tall (a thumb's target), divided by border/neutral/muted.
 * Render it as a `<label>` around a Checkbox or Radio so the whole row is the hit area.
 */
export function BottomSheetItem({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="bottom-sheet-item"
      className={cn(
        "flex min-h-12 cursor-pointer items-center gap-3 border-b border-line-neutral-muted " +
          "text-body-md text-content-neutral-emphasis last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The actions. Buttons share the width — on a phone the outcome deserves the
 * whole row — primary last, paired with an outline (Clear + Apply).
 */
export function BottomSheetFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bottom-sheet-footer"
      className={cn("flex shrink-0 gap-2 px-4 pt-3 pb-6 *:flex-1", className)}
      {...props}
    />
  );
}
