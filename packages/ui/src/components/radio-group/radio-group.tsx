import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * RadioGroup / Radio
 *
 * One of many. A radio cannot be unticked by the person who ticked it — that
 * is the difference from Checkbox, and the reason a group needs a sensible
 * default or an explicit "None" option.
 *
 * STRUCTURE from Figma — two sizes, checked and unchecked. The group is
 * mandatory because a lone radio is not a control: arrow keys move between
 * the options of a group, and without one there is nothing to move through.
 *
 * ⚠️ Three deliberate differences from the Figma component, all pushed back:
 *
 * 1. **Border 1px, not 1.5** — as Checkbox, for one border weight system-wide.
 * 2. **Disabled checked is muted.** Figma keeps the dot and ring at full
 *    primary, so a disabled selection looks live.
 * 3. **Invalid is a danger border**, not a permanent danger focus-ring over a
 *    neutral border. Checkbox, Input and Textarea all colour the border;
 *    Radio was the only control expressing it as a ring, and a ring that is
 *    always on stops reading as focus.
 */
const radioVariants = cva(
  "group aspect-square shrink-0 rounded-full border transition-colors outline-none " +
    "bg-surface-input-default border-line-neutral-emphasis " +
    "hover:bg-surface-input-hovered " +
    "focus-visible:ring-2 focus-visible:ring-line-focused " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-app " +
    // the box stays as it is; only the ring colours, and the dot appears
    "data-[state=checked]:border-line-primary-emphasis " +
    "aria-invalid:border-line-danger-emphasis " +
    "aria-invalid:focus-visible:ring-line-danger-emphasis " +
    "disabled:cursor-not-allowed disabled:hover:bg-surface-input-disabled " +
    "disabled:bg-surface-input-disabled disabled:border-line-input-disabled " +
    "disabled:data-[state=checked]:border-line-input-disabled",
  {
    variants: {
      size: {
        sm: "size-4 [&_[data-slot=radio-dot]]:size-1.5",
        md: "size-5 [&_[data-slot=radio-dot]]:size-2",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export function RadioGroup({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      // Declared, not inferred. Radix decides which arrow keys move focus from
      // this, so leaving it unset means Down does nothing on a group that is
      // visibly a vertical stack — the arrow that matches what someone sees.
      orientation={orientation}
      className={cn(
        "grid gap-2.5",
        orientation === "horizontal" && "grid-flow-col auto-cols-max gap-5",
        className,
      )}
      {...props}
    />
  );
}

export interface RadioProps
  extends Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, "size">,
    VariantProps<typeof radioVariants> {}

export function Radio({ className, size, ...props }: RadioProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio"
      className={cn(radioVariants({ size }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex h-full w-full items-center justify-center">
        <span
          data-slot="radio-dot"
          className={cn(
            "rounded-full bg-surface-primary-emphasis transition-colors",
            "group-hover:bg-surface-primary-emphasis-hovered",
            "group-aria-invalid:bg-surface-danger-emphasis",
            "group-disabled:bg-content-disabled group-disabled:group-hover:bg-content-disabled",
          )}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { radioVariants };
