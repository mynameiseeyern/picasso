/**
 * no-raw-page-title — a page's title comes from PageHeader, not a hand-written
 * <h1>.
 *
 * Measured in dev on 27 Oct: the Ops Console, the Admin console and the
 * Clarion fleet dashboard each render their page title as an <h1> at 20px /
 * weight 500. Picasso's page-title step is heading/xl — 30 / 600. Three
 * products, three hand-rolled titles, the same wrong step in all of them,
 * because nothing stopped the first one and the next two copied it.
 *
 * That is the failure the heading-ramp decision predicted in September:
 * "nothing told anyone which step was a page title, so xs and sm did
 * page-title work". A component answers it once; a rule keeps it answered.
 *
 * PageHeader also carries the description cap, the rule underneath and the
 * h1-per-page guarantee, so the hand-written version is never only a font
 * size — it is four decisions re-made and three of them silently dropped.
 *
 * Off in the design system's own repo, where an <h1> in a story or a docs
 * page is a specimen rather than a page title. On in a product.
 *
 * A screen with no app shell — a sign-in page, an error page — is the real
 * exception. Disable the line and say which, so the next person reads a
 * decision rather than an oversight.
 */

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "The page title is PageHeader's, so every page gets the same step, weight and rule.",
    },
    schema: [],
    messages: {
      raw: "A hand-written <h1> is a page title with its type step re-decided. Use <PageHeader title=\"…\" /> from @ir/ui — it sets heading/xl (30/600), caps the description at the reading width and draws the rule. If this screen has no app shell, disable this line and say so.",
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name?.type !== "JSXIdentifier" || node.name.name !== "h1") return;
        context.report({ node, messageId: "raw" });
      },
    };
  },
};
