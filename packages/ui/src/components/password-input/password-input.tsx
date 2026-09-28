import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { InputGroup, InputGroupAddon, InputGroupInput, type InputGroupInputProps } from "../input-group/input-group";

/**
 * PasswordInput — Figma Input `Type=Password`: the field plus a trailing eye
 * that shows and hides the value.
 *
 * The eye is a real button with aria-pressed, so its state is announced
 * ("Show password, toggle button, not pressed") rather than inferred from an
 * icon swap. It sits outside the tab order's surprises: Tab goes field → eye,
 * the order it is drawn in.
 *
 * autoComplete defaults to "current-password"; pass "new-password" where the
 * person is choosing one, so password managers offer to generate it.
 */
export interface PasswordInputProps extends InputGroupInputProps {
  size?: "sm" | "md";
  /** Accessible names for the eye button, e.g. to localise. */
  showLabel?: string;
  hideLabel?: string;
  /** Classes for the outer group (the box). */
  groupClassName?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    { size = "md", showLabel = "Show password", hideLabel = "Hide password", groupClassName, autoComplete = "current-password", disabled, ...props },
    ref,
  ) => {
    const [visible, setVisible] = React.useState(false);
    const Icon = visible ? EyeOff : Eye;
    return (
      <InputGroup size={size} className={cn(groupClassName)} data-slot="password-input">
        <InputGroupInput
          ref={ref}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          disabled={disabled}
          // Browsers mangle a visible password with autocorrect and caps.
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          {...props}
        />
        <InputGroupAddon align="end">
          <button
            type="button"
            aria-pressed={visible}
            aria-label={visible ? hideLabel : showLabel}
            disabled={disabled}
            onClick={() => setVisible((v) => !v)}
            className={cn(
              "-me-1 inline-flex size-6 items-center justify-center rounded-sm text-content-neutral-subtle " +
                "outline-none hover:text-content-neutral-emphasis focus-visible:ring-2 focus-visible:ring-line-focused " +
                "disabled:pointer-events-none",
            )}
          >
            <Icon aria-hidden className="size-4" />
          </button>
        </InputGroupAddon>
      </InputGroup>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
