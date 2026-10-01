import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sidebar — Figma's Sidebar menu page, thirteen sets over one navigation
 * tree. `Sidebar / SidebarMenuButton` 1137:443 is the centre of it.
 *
 * That button set has 56 variants across Type × State × Collapsed, and the
 * Type axis is mostly presence again: Simple, Collapsible, Dropdown, Tree,
 * Badge and Checkbox are all 216×32 with the same padding and gap, differing
 * only in which children they hold — an icon, a chevron, a badge, a
 * checkbox. Only `Big Icon` is a different size, so that is the one thing
 * that became a prop (`size="lg"`). The rest is composition.
 *
 * ⭐ State is carried by weight as well as fill. Active is bg/primary/subtle
 * *and* label/lg where every other state is body/md — 500 against 400. That
 * matters: on a sidebar where several items share a muted fill, the weight
 * is what survives. Worth keeping when anyone reaches for "just the
 * background".
 *
 * Measured: button 32 tall at radius/md, 8 padding, 8 gap; sub-item 28 tall
 * at 0/8; group padding 8; group label label/sm at xs and 32 tall; the
 * collapsed rail is a 32 square. Focused is bg/sidebar with a
 * border/primary/emphasis edge and ring/focus.
 *
 * ⭐ Hover is bg/sidebar-hovered and pressed is bg/sidebar-pressed — the
 * rail's own pair, not bg/neutral/subtle-hovered. The rail is neutral-100
 * in light, which is exactly what subtle-hovered (and, since 1 Oct,
 * muted-hovered) resolves to, so the standard hover painted the rail's own
 * colour and nothing moved. The sidebar pair is one step past the rail in
 * both themes: 200 then 300 in light, 900 then 800 in dark. Anything that
 * sits on bg/sidebar takes this pair. Figma draws subtle-hovered; this is a
 * correction under rule 2 (a hover that equals its surface cannot render).
 *
 * ⚠️ On `SidebarMenuSubItem`, Hover and Active are the same fill —
 * bg/sidebar-hovered — so a selected sub-item is indistinguishable
 * from one the pointer happens to be over. The parent button does not have
 * this problem: its Active is bg/primary/subtle. Built as drawn, and raised.
 */
// 256 expanded and 48 collapsed. ⚠️ This was 248, and 248 was my mistake:
// the Sidebar page draws SidebarGroup at 248, and the group is the rail's
// *contents*, not the rail. App shell draws the rail itself — 256 wide with
// 4 of padding, which is exactly the 248 group inside it — and the Rules
// name the token: "Expanded is 256px (space/64); collapsed is 48px
// (space/12)." So the rail is 256 and always was.
//
// The collapsed arithmetic does not close the same way: App shell wraps a
// 48 rail around 4 of padding, which leaves 40 for a group whose button is
// 32 inside 8 of padding — 48. The rail is the number the Rules state, so
// the rail is 48 and the padding is the group's, not the shell's.
const SIDEBAR_WIDTH = "w-64";
const SIDEBAR_WIDTH_COLLAPSED = "w-12";

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}
const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx)
    throw new Error("Sidebar parts must be used inside <SidebarProvider>.");
  return ctx;
}

export interface SidebarProviderProps extends React.ComponentProps<"div"> {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function SidebarProvider({
  className,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  ...props
}: SidebarProviderProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultCollapsed);
  const isControlled = collapsed !== undefined;
  const value = isControlled ? collapsed : uncontrolled;

  const setCollapsed = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      onCollapsedChange?.(next);
    },
    [isControlled, onCollapsedChange],
  );

  const ctx = React.useMemo(
    () => ({ collapsed: value, setCollapsed }),
    [value, setCollapsed],
  );

  return (
    <SidebarContext.Provider value={ctx}>
      {/* Fills whatever it is given rather than claiming the viewport: a
          component that hardcodes min-h-svh cannot be put in a panel, a
          story or a split view without a class fighting it. */}
      <div
        data-slot="sidebar-provider"
        className={cn("flex h-full w-full", className)}
        {...props}
      />
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  className,
  ...props
}: React.ComponentProps<"aside">) {
  const { collapsed } = useSidebar();
  return (
    <aside
      data-slot="sidebar"
      data-collapsed={collapsed || undefined}
      className={cn(
        // No width transition: there are no motion tokens yet, and an
        // arbitrary one is what `no-arbitrary-values` exists to stop.
        // The right edge is drawn in Figma as border/neutral/subtle, which
        // was invisible in both themes — it was neutral-100 in light, the
        // same as bg/sidebar, and neutral-900 in dark, the same as both
        // bg/sidebar and bg/app. subtle has since been retired into muted
        // (there is no room on the ramp for a border below muted that is
        // not also a surface), so the edge reads in both themes now.
        "flex shrink-0 flex-col border-r border-line-neutral-muted " +
          "bg-surface-sidebar",
        collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH,
        className,
      )}
      {...props}
    />
  );
}

export function SidebarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

export function SidebarContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

export function SidebarGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("flex flex-col p-2", className)}
      {...props}
    />
  );
}

/** Hidden when the rail is collapsed — there is no room for a word. */
export function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { collapsed } = useSidebar();
  if (collapsed) return null;
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "flex h-8 items-center justify-between rounded-md px-2 " +
          "text-label-sm text-content-neutral-emphasis",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroupAction({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="sidebar-group-action"
      className={cn(
        "flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md " +
          "text-content-neutral-muted outline-none transition-colors " +
          "hover:bg-surface-sidebar-hovered active:bg-surface-sidebar-pressed " +
          "focus-visible:ring-2 focus-visible:ring-line-focused " +
          "[&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarMenu({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex w-full flex-col gap-1", className)}
      {...props}
    />
  );
}

export function SidebarMenuItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("relative flex flex-col", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "group/menu-button flex w-full cursor-pointer items-center gap-2 rounded-md p-2 " +
    "text-left text-content-neutral-emphasis outline-none transition-colors " +
    "hover:bg-surface-sidebar-hovered active:bg-surface-sidebar-pressed " +
    "focus-visible:border-line-primary-emphasis focus-visible:bg-surface-sidebar " +
    "focus-visible:ring-2 focus-visible:ring-line-focused " +
    "disabled:pointer-events-none disabled:text-content-disabled " +
    "[&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      // Active is a weight change as well as a fill — see the note above.
      active: {
        true: "bg-surface-primary-subtle text-label-lg",
        false: "text-body-md",
      },
      size: { default: "h-8", lg: "h-12" },
    },
    defaultVariants: { active: false, size: "default" },
  },
);

export interface SidebarMenuButtonProps
  extends
    React.ComponentProps<"button">,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean;
  /** Marks the current page. Sets `aria-current` as well as the treatment. */
  active?: boolean;
}

export function SidebarMenuButton({
  className,
  asChild,
  active = false,
  size,
  ...props
}: SidebarMenuButtonProps) {
  const { collapsed } = useSidebar();
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        sidebarMenuButtonVariants({ active, size }),
        // The collapsed rail is a 32 square with only the icon in it.
        collapsed && "size-8 justify-center p-2",
        className,
      )}
      {...(asChild ? {} : { type: "button" as const })}
      {...props}
    />
  );
}

/** The label, hidden with the rail so the icon can centre itself. */
export function SidebarMenuLabel({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { collapsed } = useSidebar();
  if (collapsed) return null;
  return (
    <span
      data-slot="sidebar-menu-label"
      className={cn("flex-1 truncate", className)}
      {...props}
    />
  );
}

export function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { collapsed } = useSidebar();
  if (collapsed) return null;
  return (
    <span
      data-slot="sidebar-menu-badge"
      className={cn(
        "ms-auto text-label-sm text-content-neutral-muted",
        className,
      )}
      {...props}
    />
  );
}

const sidebarMenuSubVariants = cva("flex flex-col gap-1 py-0.5", {
  variants: {
    variant: {
      default: "",
      indent: "px-1.5",
      border: "ms-4 border-l border-line-neutral-muted ps-4",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface SidebarMenuSubProps
  extends
    React.ComponentProps<"ul">,
    VariantProps<typeof sidebarMenuSubVariants> {}

export function SidebarMenuSub({
  className,
  variant,
  ...props
}: SidebarMenuSubProps) {
  const { collapsed } = useSidebar();
  if (collapsed) return null;
  return (
    <ul
      data-slot="sidebar-menu-sub"
      className={cn(sidebarMenuSubVariants({ variant }), className)}
      {...props}
    />
  );
}

export function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      className={cn("flex", className)}
      {...props}
    />
  );
}

export interface SidebarMenuSubButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
  active?: boolean;
}

export function SidebarMenuSubButton({
  className,
  asChild,
  active = false,
  ...props
}: SidebarMenuSubButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-7 w-full cursor-pointer items-center gap-2 rounded-md px-2 " +
          "text-body-md text-content-neutral-emphasis outline-none transition-colors " +
          "hover:bg-surface-sidebar-hovered active:bg-surface-sidebar-pressed " +
          "focus-visible:ring-2 focus-visible:ring-line-focused " +
          "[&_svg]:size-4 [&_svg]:shrink-0",
        // As drawn: the same fill as hover, so a selected sub-item and a
        // hovered one are the same picture. Raised.
        active && "bg-surface-sidebar-hovered",
        className,
      )}
      {...(asChild ? {} : { type: "button" as const })}
      {...props}
    />
  );
}

/** Figma's `Sidebar / Header Button` — a 28 square that folds the rail. */
export function SidebarTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { collapsed, setCollapsed } = useSidebar();
  return (
    <button
      type="button"
      data-slot="sidebar-trigger"
      aria-expanded={!collapsed}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      onClick={() => setCollapsed(!collapsed)}
      className={cn(
        "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md " +
          "text-content-neutral-muted outline-none transition-colors " +
          "hover:bg-surface-sidebar-hovered active:bg-surface-sidebar-pressed " +
          "focus-visible:ring-2 focus-visible:ring-line-focused " +
          "[&_svg]:size-4",
        className,
      )}
      {...props}
    >
      {children ?? <PanelLeft aria-hidden />}
    </button>
  );
}

/** The page beside the rail. */
export function SidebarInset({
  className,
  ...props
}: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn("flex min-w-0 flex-1 flex-col", className)}
      {...props}
    />
  );
}

export { sidebarMenuButtonVariants, sidebarMenuSubVariants };
