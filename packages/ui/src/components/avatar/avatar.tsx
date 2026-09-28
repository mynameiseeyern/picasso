import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { BadgeCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Avatar — Figma 375:427.
 *
 * STRUCTURE from Figma: Size (xs 24 · sm 32 · md 40), Style (Default ·
 * Inverse), Border, and two placeholder axes — icon or initials. Full radius
 * throughout.
 *
 * Measured per size, rather than inferred from the names:
 *
 *   size   box   inner (Border)   text          status dot   icon
 *   xs     24    22               label/xs      10           16
 *   sm     32    30               heading/xs    12           16
 *   md     40    38               heading/sm    14           24
 *
 * Border=True draws a wrapper the same size as the box with the avatar 2px
 * smaller inside it — a **1px inset ring**, not an outer one, so a bordered
 * avatar occupies exactly the same space as an unbordered one. In Figma the
 * wrapper is raw white; here it is `ring-surface-card`, because the ring
 * exists to separate overlapping avatars from the surface behind them, and
 * that surface is not white in dark mode.
 *
 * The root does NOT clip, because the status dot sits on the edge. The image
 * carries its own radius instead.
 *
 * ⚠️ Figma's online dot has two gradient "Reflection" layers over the solid
 * fill — a radial highlight and a linear sheen. Reproduced here as the flat
 * fill only: the gradients need per-stop colour values, which is exactly what
 * no-arbitrary-values refuses, and a gloss on an 10px dot is below the
 * threshold where anyone can see it. Raised rather than quietly matched.
 */
const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center rounded-full align-middle select-none",
  {
    variants: {
      size: {
        xs: "size-6 text-label-xs",
        sm: "size-8 text-heading-xs",
        md: "size-10 text-heading-sm",
      },
      variant: {
        default: "bg-surface-neutral-subtle text-content-neutral-muted",
        inverse: "bg-surface-neutral-emphasis text-content-on-neutral-emphasis",
      },
      ring: { true: "ring-1 ring-inset ring-surface-card", false: "" },
    },
    defaultVariants: { size: "md", variant: "default", ring: false },
  },
);

type Size = "xs" | "sm" | "md";
const SizeContext = React.createContext<Size>("md");
export const useAvatarSize = () => React.useContext(SizeContext);

export interface AvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {}

export function Avatar({ className, size = "md", variant, ring, ...props }: AvatarProps) {
  return (
    <SizeContext.Provider value={size ?? "md"}>
      <AvatarPrimitive.Root
        data-slot="avatar"
        className={cn(avatarVariants({ size, variant, ring }), className)}
        {...props}
      />
    </SizeContext.Provider>
  );
}

export function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      // The root cannot clip (the status dot sits on its edge), so the image
      // carries the radius itself.
      className={cn("size-full rounded-full object-cover", className)}
      {...props}
    />
  );
}

const ICON = { xs: "size-4", sm: "size-4", md: "size-6" } as const;

export interface AvatarFallbackProps
  extends React.ComponentProps<typeof AvatarPrimitive.Fallback> {
  /** Show the generic person icon instead of initials. Figma's `Placeholder icon`. */
  icon?: boolean;
}

/**
 * Initials, or the generic person. Radix waits for the image to fail before
 * showing this, so there is no flash of initials behind a picture that loads.
 */
export function AvatarFallback({ className, icon, children, ...props }: AvatarFallbackProps) {
  const size = useAvatarSize();
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("flex size-full items-center justify-center rounded-full", className)}
      {...props}
    >
      {icon ? <User aria-hidden className={ICON[size]} /> : children}
    </AvatarPrimitive.Fallback>
  );
}

const DOT = { xs: "size-2.5", sm: "size-3", md: "size-3.5" } as const;
const TONE = {
  online: "bg-surface-success-emphasis",
  offline: "bg-surface-neutral-subtle-pressed",
} as const;

export interface AvatarStatusProps extends React.ComponentProps<"span"> {
  type: "online" | "offline" | "verified" | "count";
  /** For type="count". */
  count?: number;
  /** What the dot means, for anyone not looking at it. */
  label?: string;
}

/**
 * The dot on the corner. It carries meaning, so it gets a name — an avatar
 * that silently turns green tells a screen reader nothing.
 */
export function AvatarStatus({ className, type, count, label, ...props }: AvatarStatusProps) {
  const size = useAvatarSize();
  const name = label ?? (type === "count" ? `${count} unread` : type);
  return (
    <span
      data-slot="avatar-status"
      data-type={type}
      role="img"
      aria-label={name}
      className={cn(
        "absolute end-0 bottom-0 inline-flex items-center justify-center rounded-full",
        DOT[size],
        type === "online" || type === "offline" ? TONE[type] : null,
        type === "count" && "bg-surface-danger-emphasis text-content-on-danger-emphasis text-label-xs",
        type === "verified" && "text-content-info-emphasis",
        className,
      )}
      {...props}
    >
      {type === "count" ? count : null}
      {type === "verified" ? <BadgeCheck aria-hidden className="size-full" /> : null}
    </span>
  );
}

export { avatarVariants };
