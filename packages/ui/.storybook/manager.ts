import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

/* Storybook is the Components section of the Picasso site, so its chrome
 * says so and links back. Storybook shows either a brand image or a title,
 * and a lone IR icon would not say which section this is — so, the title. */
addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "Picasso components",
    brandUrl: "/",
    brandTarget: "_self",
    fontBase: '"Poppins", "Lato", "Century Gothic", sans-serif',
  }),
});
