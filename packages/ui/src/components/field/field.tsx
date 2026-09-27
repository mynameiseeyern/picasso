import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Field
 *
 * The wrapper that makes a form control legible: label, control, and either a
 * hint or an error. STRUCTURE from Figma, MEASUREMENTS from shadcn.
 *
 * The point of this component is the wiring, not the layout. Input's guidance
 * says every field needs a visible label and that an invalid field needs a
 * message — both are easy to agree with and easy to forget. Field generates
 * the ids and hangs `htmlFor`, `aria-describedby` and `aria-invalid` off them,
 * so the association happens by using the component rather than by remembering
 * to. Advice that depends on memory is advice; advice built into a component
 * is a guarantee.
 *
 * Figma replaces the hint with the error when the field is invalid rather than
 * showing both, which is why FieldDescription renders only when valid. A
 * screen reader announcing a format hint and a failure together is noisier
 * than announcing the failure.
 */

type FieldSize = "sm" | "md";

interface FieldContextValue {
  id: string;
  descriptionId: string;
  errorId: string;
  invalid: boolean;
  disabled: boolean;
  size: FieldSize;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

function useField(component: string) {
  const ctx = React.useContext(FieldContext);
  if (!ctx) throw new Error(`<${component}> must be used inside a <Field>.`);
  return ctx;
}

const fieldVariants = cva("flex flex-col", {
  variants: { size: { sm: "gap-1", md: "gap-1.5" } },
  defaultVariants: { size: "md" },
});

export interface FieldProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof fieldVariants> {
  /** Sets aria-invalid on the control and swaps the hint for the error. */
  invalid?: boolean;
  /** Disables the control and dims the label and hint. */
  disabled?: boolean;
}

export function Field({
  className,
  size = "md",
  invalid = false,
  disabled = false,
  ...props
}: FieldProps) {
  const id = React.useId();
  const value = React.useMemo<FieldContextValue>(
    () => ({
      id,
      descriptionId: `${id}-description`,
      errorId: `${id}-error`,
      invalid,
      disabled,
      size: size ?? "md",
    }),
    [id, invalid, disabled, size],
  );

  return (
    <FieldContext.Provider value={value}>
      <div
        data-slot="field"
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        className={cn(fieldVariants({ size }), className)}
        {...props}
      />
    </FieldContext.Provider>
  );
}

const labelVariants = cva("flex items-center gap-0.5 text-content-neutral-emphasis", {
  variants: { size: { sm: "text-label-sm", md: "text-label-md" } },
  defaultVariants: { size: "md" },
});

export interface FieldLabelProps extends React.ComponentProps<"label"> {
  /** Renders the asterisk and sets required on the control. */
  required?: boolean;
}

export function FieldLabel({ className, children, required, ...props }: FieldLabelProps) {
  const { id, size, disabled } = useField("FieldLabel");
  return (
    <label
      htmlFor={id}
      data-slot="field-label"
      className={cn(labelVariants({ size }), disabled && "text-content-disabled", className)}
      {...props}
    >
      {children}
      {required ? (
        // aria-hidden because `required` on the control is what assistive tech
        // reads. The asterisk is the visual half of the same fact.
        <span aria-hidden="true" className="text-content-primary-emphasis">
          *
        </span>
      ) : null}
    </label>
  );
}

export interface FieldControlProps {
  children: React.ReactElement;
  /** Marks the control required, to pair with FieldLabel's asterisk. */
  required?: boolean;
}

/**
 * Passes the generated id and aria wiring to whatever control it wraps, via
 * Slot — so Input, Select, Textarea and a Radix trigger all work without Field
 * knowing anything about them.
 */
export function FieldControl({ children, required }: FieldControlProps) {
  const { id, descriptionId, errorId, invalid, disabled } = useField("FieldControl");
  return (
    <Slot
      id={id}
      aria-describedby={invalid ? errorId : descriptionId}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      disabled={disabled || undefined}
      data-slot="field-control"
    >
      {children}
    </Slot>
  );
}

const messageVariants = cva("", {
  variants: { size: { sm: "text-body-xs", md: "text-body-sm" } },
  defaultVariants: { size: "md" },
});

export function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { descriptionId, size, invalid, disabled } = useField("FieldDescription");
  // Figma swaps the hint for the error rather than stacking them.
  if (invalid) return null;
  return (
    <p
      id={descriptionId}
      data-slot="field-description"
      className={cn(
        messageVariants({ size }),
        disabled ? "text-content-disabled" : "text-content-neutral-subtle",
        className,
      )}
      {...props}
    />
  );
}

export function FieldError({ className, ...props }: React.ComponentProps<"p">) {
  const { errorId, size, invalid } = useField("FieldError");
  if (!invalid) return null;
  return (
    <p
      id={errorId}
      // role="alert" so the failure is announced when it appears, rather than
      // only when focus happens to reach the control.
      role="alert"
      data-slot="field-error"
      className={cn(messageVariants({ size }), "text-content-danger-emphasis", className)}
      {...props}
    />
  );
}

export { fieldVariants };
