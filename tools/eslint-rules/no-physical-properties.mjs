/**
 * no-physical-properties — a Tailwind class that names a side rather than an
 * edge of the reading direction.
 *
 * `pl-4` is "16 on the left"; `ps-4` is "16 before the text starts". In an
 * LTR locale they render identically, which is exactly why the physical one
 * creeps back in: nothing looks wrong until the first RTL locale, and by then
 * it is everywhere. The rule is cheap to keep and expensive to reinstate.
 *
 * Centring is the exception and is allowed: `left-1/2` with a translate is not
 * a side, it is a midpoint, and `start-1/2` would flip something that should
 * not move.
 *
 * For a genuine physical need — a shadow that falls one way whatever the
 * locale, artwork with a handedness — disable the rule on the line and say
 * why. That comment is the record of a decision, which is the point.
 */

/* A Tailwind value, so prose does not trip the rule: "right-aligns the
   panel" in a test name is a sentence, not a utility. */
const VALUE =
  /^(auto|px|full|min|max|fit|screen|none|xs|sm|md|lg|xl|2xl|3xl|4xl|\d+(\.\d+)?|\d+\/\d+|\[[^\]]*\]|\([^)]*\))$/;

/** physical → logical, as [prefix, replacement, exact?]. */
const PREFIX = [
  ["ml-", "ms-"],
  ["mr-", "me-"],
  ["pl-", "ps-"],
  ["pr-", "pe-"],
  ["scroll-ml-", "scroll-ms-"],
  ["scroll-mr-", "scroll-me-"],
  ["scroll-pl-", "scroll-ps-"],
  ["scroll-pr-", "scroll-pe-"],
  ["border-l-", "border-s-"],
  ["border-r-", "border-e-"],
  ["rounded-tl-", "rounded-ss-"],
  ["rounded-tr-", "rounded-se-"],
  ["rounded-bl-", "rounded-es-"],
  ["rounded-br-", "rounded-ee-"],
  ["rounded-l-", "rounded-s-"],
  ["rounded-r-", "rounded-e-"],
  ["left-", "start-"],
  ["right-", "end-"],
];

const EXACT = new Map([
  ["border-l", "border-s"],
  ["border-r", "border-e"],
  ["rounded-l", "rounded-s"],
  ["rounded-r", "rounded-e"],
  ["rounded-tl", "rounded-ss"],
  ["rounded-tr", "rounded-se"],
  ["rounded-bl", "rounded-es"],
  ["rounded-br", "rounded-ee"],
  ["text-left", "text-start"],
  ["text-right", "text-end"],
]);

/* A midpoint is not a side. */
const CENTRING = new Set(["left-1/2", "right-1/2"]);

/* Variants ride in front of the utility — hover:, @3xl:, dark:, group-… — and
 * so does a leading `-` for a negative value. */
function bare(cls) {
  const i = cls.lastIndexOf(":");
  const rest = i === -1 ? cls : cls.slice(i + 1);
  return rest.startsWith("-") ? rest.slice(1) : rest;
}

function logicalFor(cls) {
  if (CENTRING.has(cls)) return null;
  const exact = EXACT.get(cls);
  if (exact) return exact;
  // longest prefix first, so border-l- beats left-
  for (const [prefix, logical] of [...PREFIX].sort((a, b) => b[0].length - a[0].length)) {
    if (!cls.startsWith(prefix)) continue;
    const value = cls.slice(prefix.length);
    if (!VALUE.test(value)) return null;
    return logical + value;
  }
  return null;
}

function check(value) {
  const out = [];
  for (const raw of String(value).split(/\s+/)) {
    if (!raw) continue;
    const logical = logicalFor(bare(raw));
    if (logical) out.push({ cls: raw, logical });
  }
  return out;
}

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Use logical properties, so a component reads correctly in both directions.",
    },
    schema: [],
    messages: {
      physical:
        '"{{cls}}" names a side, not an edge of the reading direction — use "{{logical}}". It renders the same in LTR, so nothing will look wrong until the first RTL locale. If the side is genuinely physical, disable this line and say why.',
    },
  },
  create(context) {
    const report = (node, value) => {
      for (const hit of check(value)) {
        context.report({ node, messageId: "physical", data: hit });
      }
    };
    return {
      Literal(node) {
        if (typeof node.value === "string") report(node, node.value);
      },
      TemplateElement(node) {
        if (node.value?.cooked) report(node, node.value.cooked);
      },
    };
  },
};
