import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Skeleton — Figma 40000533:20.
 *
 * The shape of content that has not arrived yet.
 *
 * Drawn in Figma on 28 Sept, after the code: Picasso had no Skeleton, so this
 * was built from the system's own tokens and the component set was added to
 * match. `Shape` is the only axis — Block and Circle — because size is the one
 * thing no variant can enumerate: a skeleton mirrors whatever is arriving.
 *
 * The surface is **bg/neutral/muted-pressed**, chosen by measuring rather than
 * by name — the neutral ramp is not monotonic. In light mode `muted` is #fff
 * and `subtle` is #f8fafc, so both vanish against a card or the app
 * background respectively; `subtle-pressed` is #202939 in dark, which is the
 * card. muted-pressed (#eef2f6 / #364152) is the only one of them visible on
 * both surfaces in both modes.
 *
 * `aria-hidden`, always. A skeleton is a picture of content, and a screen
 * reader that announces twelve empty boxes has told the person nothing. The
 * container announces the wait once — `aria-busy` on the region, or one
 * polite live region saying "Loading dashboards" — and the skeletons are
 * scenery behind it.
 *
 * The pulse stops under `prefers-reduced-motion`. A large block breathing at
 * the centre of the screen is exactly the motion that setting exists to stop.
 *
 * Size it from outside (`h-4 w-32`); shape is a variant, because there are
 * only two — a block, and the circle that stands in for an avatar.
 */
const skeletonVariants = cva(
  "animate-pulse bg-surface-neutral-muted-pressed motion-reduce:animate-none",
  {
    variants: {
      shape: {
        block: "rounded-md",
        circle: "rounded-full",
      },
    },
    defaultVariants: { shape: "block" },
  },
);

export interface SkeletonProps
  extends React.ComponentProps<"div">, VariantProps<typeof skeletonVariants> {}

export function Skeleton({ className, shape, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      data-slot="skeleton"
      className={cn(skeletonVariants({ shape }), className)}
      {...props}
    />
  );
}

export interface SkeletonTextProps extends React.ComponentProps<"div"> {
  /** How many lines to stand in for. */
  lines?: number;
}

/**
 * A paragraph's worth of skeleton. The last line is short, because real
 * paragraphs end mid-line and a stack of equal bars reads as a table.
 */
export function SkeletonText({
  className,
  lines = 3,
  ...props
}: SkeletonTextProps) {
  return (
    <div
      data-slot="skeleton-text"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 && lines > 1 && "w-3/5")}
        />
      ))}
    </div>
  );
}

export { skeletonVariants };
