/**
 * require-content-width — AppShellContent states the page's width out loud.
 *
 * `width` defaults to `fluid`, which is the right default for the library and
 * the wrong one for a product: it means a page that never thought about its
 * width silently gets the no-cap mode. Measured in dev on 27 Oct, that is
 * exactly what happened — the Admin console and the Clarion dashboard run
 * uncapped at 2603px on a wide monitor, and the Ops Console went the other
 * way and centred itself at 1088, which is not one of the three modes at all.
 *
 * Fluid is a real answer for a dashboard. It just has to be the answer
 * somebody gave:
 *
 *   fluid     no cap; the content reflows into more columns as it widens
 *   standard  1280, for detail, settings and mixed pages
 *   reading   768, for forms and prose
 *
 * The cap is a max-width on a column that stays aligned to the rail, so
 * capped is never centred. A page that needs centring is a page that has
 * picked the wrong mode.
 *
 * Skipped when the element spreads props, since the width may be in there.
 */

const MODES = ["fluid", "standard", "reading"];

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Every page says which of the three content widths it is, rather than inheriting one.",
    },
    schema: [],
    messages: {
      missing:
        'AppShellContent has no width, so this page silently gets "fluid". Say which it is: width="fluid" (dashboards and tables), "standard" (1280 — detail and settings) or "reading" (768 — forms and prose).',
      unknown:
        '"{{ value }}" is not a content width. The three are {{ modes }}. A capped column stays aligned to the rail — if this page wants centring, it has picked the wrong mode.',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name?.type !== "JSXIdentifier" || node.name.name !== "AppShellContent") return;
        let spread = false;
        let width = null;
        for (const attr of node.attributes) {
          if (attr.type === "JSXSpreadAttribute") spread = true;
          else if (attr.name?.name === "width") width = attr;
        }
        if (!width) {
          if (!spread) context.report({ node, messageId: "missing" });
          return;
        }
        // Only a literal can be checked; an expression is the page's business.
        const value = width.value?.type === "Literal" ? String(width.value.value) : null;
        if (value && !MODES.includes(value)) {
          context.report({
            node: width,
            messageId: "unknown",
            data: { value, modes: MODES.join(", ") },
          });
        }
      },
    };
  },
};
