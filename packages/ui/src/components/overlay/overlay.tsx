import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Overlay — the shared floating card, Figma `Overlay / Surface` 40000241:48.
 *
 * The file is explicit about what this is for: *"The floating card shared by
 * DropdownMenu / Menu, Popover and any other anchored panel. Compact for menu
 * rows, Comfortable for prose content. Do not restyle per use — change it
 * here."* Popover, Dropdown menu, Dialog and Drawer are all this surface with
 * different behaviour on top.
 *
 * Measured, both densities:
 *
 *   density       radius            padding   gap   shadow
 *   compact       radius/lg (10)    4         0     shadow/md
 *   comfortable   radius/xl (14)    16        16    shadow/lg
 *
 * Both take bg/card on a 1px border/neutral/muted.
 *
 * ⚠️ In Figma neither variant is attached to an effect *style* — both carry
 * raw effects. The values are byte-identical to `shadow/md` and `shadow/lg`
 * (same radii, offsets and alphas; only the two drop shadows are listed in
 * the opposite order), so it looks right today and would silently stop
 * matching if the shadow scale ever moved. Bound to the tokens here. Raised
 * for the file.
 *
 * The export that matters is `overlaySurfaceVariants`: a floating panel's
 * surface has to land on the primitive's own content element — Radix's
 * `Popover.Content`, `DropdownMenu.Content` — not on a wrapper around it, or
 * positioning and the exit animation come apart. `OverlaySurface` is here for
 * the non-anchored cases.
 */
const overlaySurfaceVariants = cva(
  "z-50 flex flex-col border border-line-neutral-muted bg-surface-card outline-none",
  {
    variants: {
      density: {
        compact: "rounded-lg p-1 shadow-md",
        comfortable: "gap-4 rounded-xl p-4 shadow-lg",
      },
    },
    defaultVariants: { density: "compact" },
  },
);

export interface OverlaySurfaceProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof overlaySurfaceVariants> {}

export function OverlaySurface({ className, density, ...props }: OverlaySurfaceProps) {
  return (
    <div
      data-slot="overlay-surface"
      className={cn(overlaySurfaceVariants({ density }), className)}
      {...props}
    />
  );
}

/**
 * The dimmer behind a modal surface — Figma `Scrim` 961:2873.
 *
 * ⚠️ The alpha is applied twice, and the code matches. `bg/scrim` is already
 * a translucent token — `#16161880` (50%) in light, `#000000b3` (70%) in
 * dark — and Figma's Scrim component then sets its paint to 50% opacity on
 * top. The composite is therefore ~25% light / ~35% dark, which is what
 * `bg-surface-scrim/50` renders here (measured: 0.251). Followed as drawn.
 * If the intent was a 50% scrim, the component's paint opacity is the thing
 * to drop, not the token — and note it would also flatten the deliberate
 * light/dark difference the token carries.
 *
 * Decorative: it is the modal's own focus trap and labelling that make a
 * dialog a dialog, not the dimming. A scrim that announces itself is one more
 * thing between the person and the content.
 */
const overlayScrimVariants = cva("fixed inset-0 z-50 bg-surface-scrim/50");

export function OverlayScrim({ className, ...props }: React.ComponentProps<"div">) {
  return <div aria-hidden data-slot="overlay-scrim" className={cn(overlayScrimVariants(), className)} {...props} />;
}

export { overlayScrimVariants, overlaySurfaceVariants };
