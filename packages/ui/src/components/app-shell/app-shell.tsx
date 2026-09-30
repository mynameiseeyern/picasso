import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * AppShell — Figma's App shell page, `Layout / App shell` 40000390:30130.
 *
 * Ten variants across Screen × Sidebar, but only one of those axes survives
 * the trip into code. Screen (sm 768, md 1024, lg 1280, xl 1440, 2xl 1536)
 * is Figma drawing breakpoints the only way it can — as variants — and the
 * browser does that itself. Strip it out and the ten collapse to two
 * structures, which the Sidebar's own collapsed state already carries. So
 * AppShell has no variants at all: it is chrome, and the chrome is fixed.
 *
 * What the Screen axis actually says, once decoded: the page padding and the
 * top bar's inline padding are 16 at sm and md, and 24 from lg up. Nothing
 * else moves. Widths, gaps and the 48 top bar are the same at every size.
 *
 * ⚠️ IR's screen scale and Tailwind's do not share names. IR's `lg` is
 * 1280, which is Tailwind's `xl`; IR's `sm` is 768, which is Tailwind's
 * `md`. The numbers below are right and the prefix looks wrong — `xl:p-6`
 * IS "24 from lg up". Reading "lg and above" in the Rules and writing
 * `lg:p-6` would fire at 1024, a whole breakpoint early. The real fix is to
 * put screen/desktop/* into the token pipeline as named breakpoints so the
 * names match; raised, not done here, because renaming `sm:` would move
 * every existing responsive class in the package, Dialog's included.
 *
 * ⚠️ Dark mode has no visible chrome. bg/app, bg/sidebar and
 * border/neutral/subtle are all palette-neutral-900 in dark, so the sidebar,
 * the page and every edge between them are one colour: no rail, no top bar
 * rule. In light the sidebar tint reads but the borders still do not
 * (bg/sidebar and border/neutral/subtle are both neutral-100). Built as
 * drawn, because the tokens are the thing to fix, not the markup.
 *
 * Measured from the file: sidebar 256 expanded / 48 collapsed, top bar 48
 * high with 8 gap, content padding 16 / 24, no gap anywhere else. Overlay
 * widths live with Dialog and Drawer and already match the Rules — dialog
 * sm 400 / md 560 / lg 720, drawer 480 / 640 / inset 80×40.
 */
export function AppShell({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-shell"
      // h-full rather than h-svh: a shell that claims the viewport cannot be
      // put in a story, a split view or a preview pane without a class
      // fighting it. The page decides how tall the shell is.
      className={cn(
        "flex h-full w-full overflow-hidden bg-surface-app",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The column beside the rail — Figma's `Main`, which holds the top bar and
 * the content.
 *
 * A plain div, not a `<main>`. Figma's "Main" frame contains the top bar,
 * and a top bar is chrome rather than page content: put `<main>` around it
 * and the breadcrumb and the sidebar toggle become part of the document's
 * main landmark, and the `<header>` inside it stops being a banner — a
 * `<header>` only carries that role when it is not inside main, aside, nav,
 * section or article. So the landmarks go where HTML wants them: this column
 * is a div, `AppShellHeader` is the banner, and `AppShellContent` is the
 * `<main>`. Same boxes as the file, the roles the browser expects.
 */
export function AppShellMain({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-shell-main"
      className={cn("flex min-h-0 min-w-0 flex-1 flex-col", className)}
      {...props}
    />
  );
}

/**
 * The top bar: the sidebar toggle and the breadcrumb, and nothing else.
 *
 * The Rules are explicit that the page title and page actions belong in the
 * page header inside the content area. A 48-high bar that also carries a
 * title, a search and three buttons is how every app shell ends up, and it
 * is why the breadcrumb stops being readable.
 */
export function AppShellHeader({
  className,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="app-shell-header"
      className={cn(
        "flex h-12 shrink-0 items-center gap-2 border-b " +
          "border-line-neutral-subtle px-4 xl:px-6",
        className,
      )}
      {...props}
    />
  );
}

const appShellContentColumnVariants = cva("", {
  variants: {
    width: {
      // Fluid to 2xl, which is what the Screen variants draw.
      fluid: "",
      // "Reading-heavy pages cap their content column at 768px
      // (screen/desktop/sm) and stay left-aligned." The cap is on the column,
      // inside the page padding — so max-w-192 sits on the inner element and
      // the padding stays on the scroller.
      prose: "max-w-192",
    },
  },
  defaultVariants: { width: "fluid" },
});

export interface AppShellContentProps
  extends
    React.ComponentProps<"main">,
    VariantProps<typeof appShellContentColumnVariants> {}

/**
 * The scrolling page area, and the document's `<main>`.
 * Padding is 16 at sm and md, 24 from lg up.
 */
export function AppShellContent({
  className,
  width,
  children,
  ...props
}: AppShellContentProps) {
  return (
    <main
      data-slot="app-shell-content"
      className={cn("min-h-0 flex-1 overflow-y-auto p-4 xl:p-6", className)}
      {...props}
    >
      <div
        data-slot="app-shell-content-column"
        className={cn(appShellContentColumnVariants({ width }))}
      >
        {children}
      </div>
    </main>
  );
}

export { appShellContentColumnVariants };
