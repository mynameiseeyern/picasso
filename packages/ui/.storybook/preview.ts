import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import "./preview.css";

/* The five theme axes are data-* attributes on the root element, so they can be
 * driven straight from the toolbar. This doubles as the first, crude version of
 * the theme builder: every story is a live preview of every axis. */
const axes = {
  radius: { name: "Radius", options: ["default", "sharp", "subtle", "rounded"] },
  neutral: { name: "Neutral", options: ["default", "cool", "warm"] },
  type: { name: "Type", options: ["default", "system", "compact"] },
  spacing: { name: "Spacing", options: ["default", "compact", "relaxed"] },
} as const;

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    a11y: { test: "error" },
  },
  globalTypes: Object.fromEntries(
    Object.entries(axes).map(([key, { name, options }]) => [
      key,
      {
        description: `${name} theme axis`,
        defaultValue: "default",
        toolbar: { title: name, items: options as unknown as string[], dynamicTitle: true },
      },
    ]),
  ),
  decorators: [
    (Story, context) => {
      const root = document.documentElement;
      for (const key of Object.keys(axes)) {
        const value = context.globals[key];
        if (!value || value === "default") root.removeAttribute(`data-${key}`);
        else root.setAttribute(`data-${key}`, value);
      }
      return Story();
    },
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
