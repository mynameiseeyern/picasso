import * as React from "react";
import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { DirectionProvider } from "../src/components/direction/direction";
import "./preview.css";

/* The theme axes are data-* attributes on the root element, so they can be
 * driven straight from the toolbar. This doubles as the first, crude version of
 * the theme builder: every story is a live preview of every axis. */
const axes = {
  brand: { name: "Brand", options: ["default", "clarion", "vantage"] },
  radius: { name: "Radius", options: ["default", "sharp", "subtle", "rounded"] },
  neutral: { name: "Neutral", options: ["default", "cool", "warm"] },
  type: { name: "Type", options: ["default", "system", "compact"] },
  spacing: { name: "Spacing", options: ["default", "compact", "relaxed"] },
} as const;

/* Viewport presets named for the breakpoint ladder (screen/desktop/*), so
 * the toolbar speaks the same words as the tokens, the classes and Figma's
 * App shell `Screen` labels. sm (640) is left out: it is below the
 * supported floor and nothing is designed at it.
 *
 * The last two are NOT breakpoints. Nothing in Picasso changes at 1920 or
 * 2560 — they are here to check the wide-screen rule (fluid pages add
 * columns; standard caps at 1280) on the monitors people actually have. */
const desktop = (name: string, width: number) => ({
  name,
  styles: { width: `${width}px`, height: "900px" },
  type: "desktop" as const,
});
const viewports = {
  md: desktop("md — 768", 768),
  lg: desktop("lg — 1024", 1024),
  xl: desktop("xl — 1280", 1280),
  "wide-laptop": desktop("wide-laptop — 1440", 1440),
  "2xl": desktop("2xl — 1536", 1536),
  test1920: desktop("1920 — test only, not a breakpoint", 1920),
  test2560: desktop("2560 — test only, not a breakpoint", 2560),
};

const preview: Preview = {
  parameters: {
    viewport: { options: viewports },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    a11y: { test: "error" },
  },
  globalTypes: {
    ...Object.fromEntries(
      Object.entries(axes).map(([key, { name, options }]) => [
        key,
        {
          description: `${name} theme axis`,
          defaultValue: "default",
          toolbar: { title: name, items: options as unknown as string[], dynamicTitle: true },
        },
      ]),
    ),
    /* Reading direction. Not a theme axis — it is a property of the page —
     * but it belongs on the same toolbar, because a component that has only
     * ever been looked at left-to-right has not been looked at. */
    direction: {
      description: "Reading direction",
      defaultValue: "ltr",
      toolbar: {
        title: "Direction",
        icon: "transfer",
        items: [
          { value: "ltr", title: "Left to right" },
          { value: "rtl", title: "Right to left" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const root = document.documentElement;
      for (const key of Object.keys(axes)) {
        const value = context.globals[key];
        if (!value || value === "default") root.removeAttribute(`data-${key}`);
        else root.setAttribute(`data-${key}`, value);
      }
      /* Both halves, as an app must set them: the attribute for CSS, the
       * provider for Radix. On <html>, so portalled content gets it too. */
      const direction = context.globals.direction === "rtl" ? "rtl" : "ltr";
      root.setAttribute("dir", direction);
      return React.createElement(DirectionProvider, { direction }, Story());
    },
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
