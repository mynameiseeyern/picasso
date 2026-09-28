import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Checkbox
 *
 * STRUCTURE from Figma — two sizes, three checked states (unchecked, checked,
 * indeterminate). Radix supplies the behaviour, including the tri-state.
 *
 * Figma's `State` axis (Default · Hover · Focus · Disabled · Invalid) is CSS
 * states, the disabled attribute and aria-invalid, as everywhere else.
 *
 * ⚠️ One departure from the Figma file:
 *
 * **Border is 1px, not 1.5.** Figma draws 1.5 and keeps it. Chrome floors a
 * fractional border width — measured, `border:1.5px` and `border:1px` give
 * identical computed values and identical layout at DPR 1 and DPR 2 — so 1px
 * is the only form 1.5 can take on the web. The file is right; the browser
 * cannot draw it.
 *
 * The disabled treatment is NOT a departure. A disabled checked box takes
 * bg/disabled with an fg/disabled mark, which is exactly Button's disabled
 * pairing, and Figma draws the same (Ee's call, 28 Sept). The mark sits at
 * 2.24:1 against its surface — soft, and the same softness as every disabled
 * button label, which is the point: it reads as inactive without the state
 * becoming unreadable.
 */
const checkboxVariants = cva(
  "group peer shrink-0 rounded-sm border transition-colors outline-none " +
    "bg-surface-input-default border-line-neutral-emphasis " +
    "hover:bg-surface-input-hovered " +
    "focus-visible:ring-2 focus-visible:ring-line-focused " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-app " +
    // checked and indeterminate read the same — both mean "this has a value"
    "data-[state=checked]:bg-surface-primary-emphasis " +
    "data-[state=indeterminate]:bg-surface-primary-emphasis " +
    "data-[state=checked]:border-line-primary-emphasis " +
    "data-[state=indeterminate]:border-line-primary-emphasis " +
    "data-[state=checked]:text-content-on-primary-emphasis " +
    "data-[state=indeterminate]:text-content-on-primary-emphasis " +
    "data-[state=checked]:hover:bg-surface-primary-emphasis-hovered " +
    "data-[state=indeterminate]:hover:bg-surface-primary-emphasis-hovered " +
    // invalid: the box itself carries the failure, checked or not
    "aria-invalid:border-line-danger-emphasis " +
    "aria-invalid:data-[state=checked]:bg-surface-danger-emphasis " +
    "aria-invalid:data-[state=indeterminate]:bg-surface-danger-emphasis " +
    "aria-invalid:focus-visible:ring-line-danger-emphasis " +
    // disabled, including checked — see the doc block
    "disabled:cursor-not-allowed disabled:hover:bg-surface-input-disabled " +
    "disabled:bg-surface-input-disabled disabled:border-line-input-disabled " +
    "disabled:data-[state=checked]:bg-surface-disabled " +
    "disabled:data-[state=indeterminate]:bg-surface-disabled " +
    "disabled:data-[state=checked]:border-line-input-disabled " +
    "disabled:data-[state=indeterminate]:border-line-input-disabled " +
    "disabled:data-[state=checked]:text-content-disabled " +
    "disabled:data-[state=indeterminate]:text-content-disabled",
  {
    variants: {
      size: {
        sm: "size-4 [&_svg]:size-3",
        md: "size-5 [&_svg]:size-3.5",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface CheckboxProps
  extends Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "size">,
    VariantProps<typeof checkboxVariants> {}

export function Checkbox({ className, size, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(checkboxVariants({ size }), className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {/* Chosen by data-state rather than by reading props.checked, which is
            undefined whenever the checkbox is uncontrolled. */}
        <Check strokeWidth={3} className="group-data-[state=indeterminate]:hidden" />
        <Minus strokeWidth={3} className="hidden group-data-[state=indeterminate]:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { checkboxVariants };
