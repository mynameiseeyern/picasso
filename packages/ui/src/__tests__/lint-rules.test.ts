import { describe, it } from "vitest";
import { RuleTester } from "eslint";
import tsParser from "@typescript-eslint/parser";

// @ts-expect-error — .mjs rule modules, no types
import noRawPageTitle from "../../../eslint-config/rules/no-raw-page-title.mjs";
// @ts-expect-error — .mjs rule modules, no types
import requireContentWidth from "../../../eslint-config/rules/require-content-width.mjs";
// @ts-expect-error — .mjs rule modules, no types
import noPhysicalProperties from "../../../eslint-config/rules/no-physical-properties.mjs";

/*
 * The lint rules are the part of Picasso that travels into a product repo and
 * runs there without anyone from this team watching. A rule that over-reports
 * gets disabled on the first busy afternoon, and a rule that under-reports was
 * never worth shipping — so each one is pinned by the cases it must catch and
 * the cases it must leave alone.
 */

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser as never,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

describe("picasso/no-raw-page-title", () => {
  tester.run("no-raw-page-title", noRawPageTitle, {
    valid: [
      // The component, which is the whole point.
      { code: `const a = <PageHeader title="Overview" />;` },
      // Section headings are not page titles.
      { code: `const a = <h2 className="text-heading-lg">Product space</h2>;` },
      { code: `const a = <h3>Clarion</h3>;` },
      // A component whose name merely contains h1.
      { code: `const a = <Th1ng />;` },
    ],
    invalid: [
      // What all three dev products do today.
      {
        code: `const a = <h1 className="text-xl font-medium">Tenants</h1>;`,
        errors: [{ messageId: "raw" }],
      },
      { code: `const a = <h1>Overview</h1>;`, errors: [{ messageId: "raw" }] },
    ],
  });
});

describe("picasso/require-content-width", () => {
  tester.run("require-content-width", requireContentWidth, {
    valid: [
      { code: `const a = <AppShellContent width="reading" />;` },
      {
        code: `const a = <AppShellContent width="fluid">{x}</AppShellContent>;`,
      },
      { code: `const a = <AppShellContent width="standard" />;` },
      // An expression is the page's own business — it may be a prop.
      { code: `const a = <AppShellContent width={w} />;` },
      // A spread may carry it; reporting here would be a guess.
      { code: `const a = <AppShellContent {...props} />;` },
      // Not the component.
      { code: `const a = <AppShellMain />;` },
    ],
    invalid: [
      {
        code: `const a = <AppShellContent>{page}</AppShellContent>;`,
        errors: [{ messageId: "missing" }],
      },
      {
        code: `const a = <AppShellContent className="p-4" />;`,
        errors: [{ messageId: "missing" }],
      },
      // Centred is not one of the three, and asking for it means the page
      // picked the wrong mode — which is what Ops Console did.
      {
        code: `const a = <AppShellContent width="centered" />;`,
        errors: [{ messageId: "unknown" }],
      },
    ],
  });
});

describe("picasso/no-physical-properties", () => {
  tester.run("no-physical-properties", noPhysicalProperties, {
    valid: [
      { code: `const a = <div className="ps-5 me-2 border-s rounded-se" />;` },
      // A midpoint is not a side.
      { code: `const a = <div className="left-1/2 -translate-x-1/2" />;` },
      // Prose, not a utility.
      { code: `const a = "right-aligns the panel";` },
    ],
    invalid: [
      {
        code: `const a = <div className="pl-4" />;`,
        errors: [{ messageId: "physical" }],
      },
      {
        code: `const a = <div className="hover:mr-2" />;`,
        errors: [{ messageId: "physical" }],
      },
    ],
  });
});
