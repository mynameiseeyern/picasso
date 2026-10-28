/**
 * Picasso over MCP.
 *
 * One endpoint any agent can point at, answering out of the same catalogue the
 * published `llms*.txt` files are built from — so an agent that queries the
 * server and an agent that reads the files are told the same thing.
 *
 * Four tools: one to find something, three to fetch it.
 *
 *   search_picasso   name a thing, get the handful of candidates with URLs
 *   get_component    the component's import, props, variants, pitfalls, a11y
 *   get_tokens       the resolved colour table — the file that stops invented hex
 *   get_doc          a documentation page in full
 *
 * Read-only, unauthenticated, and public, exactly like the docs site it sits
 * in. Nothing here reaches a database or a private repo, so there is nothing
 * to protect; if that changes, this is the file that grows an auth wrapper.
 */
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import {
  catalogue,
  SECTIONS,
  TOKEN_FAMILIES,
  type ComponentEntry,
  type PageEntry,
} from "@/lib/catalogue";

const text = (body: string) => ({ content: [{ type: "text" as const, text: body }] });

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ---- lookup ------------------------------------------------------------ */

/** Component by name, slug, or export — "DropdownMenuItem" finds dropdown-menu. */
const findComponent = (name: string): ComponentEntry | undefined => {
  const q = slugify(name);
  return (
    catalogue.components.find((c) => c.slug === q || slugify(c.name) === q) ??
    catalogue.components.find((c) => c.api.exports.some((e) => slugify(e) === q)) ??
    catalogue.components.find((c) => c.slug.startsWith(q) || q.startsWith(c.slug))
  );
};

const findPage = (path: string): PageEntry | undefined => {
  const q = path.replace(/^\/+|\/+$/g, "").replace(/^docs\//, "").replace(/\.mdx?$/, "");
  return (
    catalogue.pages.find((p) => p.path === path) ??
    catalogue.pages.find((p) => p.path.replace(/^docs\//, "").replace(/\.mdx?$/, "") === q) ??
    catalogue.pages.find((p) => slugify(p.title) === slugify(path))
  );
};

/* Ranked rather than filtered: an agent asking for "dropdown" wants the
 * dropdown menu first and the select somewhere below it, not an alphabetical
 * list of everything mentioning the word.
 *
 * Names are compared with the punctuation stripped out, because the same
 * component is "EmptyState" in code, "empty-state" in the URL and "empty
 * state" in the question — and a plain substring match on the last of those
 * finds the component nowhere and the prose everywhere. */
const flatten = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

const nameScore = (fields: [string, number][], q: string) => {
  const qf = flatten(q);
  if (!qf) return 0;
  /* One word of a phrase naming the thing outright — "danger button", "animate
   * a drawer" — is a stronger signal than the whole phrase appearing in some
   * page's prose, so it outranks a body hit without outranking a real name. */
  const words = q.toLowerCase().split(/\s+/).map(flatten).filter((w) => w.length > 2);
  let best = 0;
  for (const [hay, weight] of fields) {
    const h = flatten(hay);
    if (h === qf) best = Math.max(best, weight * 4);
    else if (h.startsWith(qf)) best = Math.max(best, weight * 3);
    else if (h.includes(qf)) best = Math.max(best, weight * 2);
    else if (words.length > 1 && words.some((w) => h === w)) best = Math.max(best, weight * 1.5);
  }
  return best;
};

/* A body mention is the weakest signal there is, and worth one point whoever
 * it belongs to. Every word has to be in there, or "empty state" matches any
 * page that happens to say "empty" three paragraphs from "state". */
const bodyScore = (body: string, q: string, weight = 1) => {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const h = body.toLowerCase();
  return words.length && words.every((w) => h.includes(w)) ? weight : 0;
};

type Hit = { kind: string; label: string; detail: string; where: string; rank: number };

const search = (query: string, kind: string | undefined, limit: number): Hit[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: Hit[] = [];

  if (!kind || kind === "component") {
    for (const c of catalogue.components) {
      const rank = Math.max(
        nameScore(
          [
            [c.name, 10],
            [c.slug, 10],
            [c.api.exports.join(" "), 6],
            [c.summary, 4],
          ],
          q,
        ),
        /* A component that merely mentions the words still beats a page that
         * does: the question was about building something. */
        bodyScore(c.text, q, 1.3),
      );
      if (rank) hits.push({ kind: "component", label: c.name, detail: c.summary, where: c.url, rank });
    }
  }

  if (!kind || kind === "doc") {
    for (const p of catalogue.pages) {
      const rank = Math.max(
        nameScore(
          [
            [p.title, 9],
            [p.path, 7],
            [p.description, 4],
          ],
          q,
        ),
        /* AGENTS.md and CHANGELOG.md are long enough to contain any pair of
         * words, so a body hit in one of them is worth less than in a page
         * written about a single subject. */
        bodyScore(p.body, q, p.section === "repo" ? 0.5 : 1),
      );
      if (rank) {
        hits.push({
          kind: "doc",
          label: p.title,
          detail: p.description || p.section,
          where: p.url ?? p.path,
          rank,
        });
      }
    }
  }

  if (!kind || kind === "token") {
    for (const t of catalogue.tokens) {
      const rank = nameScore([
        [t.token, 10],
        [t.utility, 10],
        [t.light, 5],
        [t.dark, 5],
      ], q);
      if (rank) {
        hits.push({
          kind: "token",
          label: t.utility,
          detail: `${t.token} — ${t.light} light, ${t.dark} dark`,
          where: `${catalogue.site}/docs/foundations/color`,
          rank,
        });
      }
    }
  }

  return hits.sort((a, b) => b.rank - a.rank || a.label.localeCompare(b.label)).slice(0, limit);
};

/* ---- tools ------------------------------------------------------------- */

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "search_picasso",
      {
        title: "Search Picasso",
        description:
          "Find a component, documentation page, or colour token in Picasso, IR's design system. " +
          "Start here when you do not already know the exact name. Returns ranked matches with " +
          "the URL for each; follow up with get_component, get_doc, or get_tokens.",
        inputSchema: z.object({
          query: z.string().min(1).describe("What to look for: a component name, a concept, a token, a utility class."),
          kind: z
            .enum(["component", "doc", "token"])
            .optional()
            .describe("Narrow to one kind. Omit to search all three."),
          limit: z.number().int().min(1).max(50).optional().describe("Maximum matches (default 10)."),
        }),
      },
      async ({ query, kind, limit }) => {
        const hits = search(query, kind, limit ?? 10);
        if (!hits.length) {
          return text(
            `Nothing in Picasso matches "${query}".\n\n` +
              `${catalogue.components.length} components, ${catalogue.pages.length} pages, ` +
              `${catalogue.tokens.length} tokens. Try a shorter query, or browse ${catalogue.site}/docs.`,
          );
        }
        return text(
          [
            `${hits.length} match${hits.length === 1 ? "" : "es"} for "${query}":`,
            "",
            ...hits.map((h) => `- [${h.kind}] ${h.label} — ${h.detail}\n  ${h.where}`),
          ].join("\n"),
        );
      },
    );

    server.registerTool(
      "get_component",
      {
        title: "Get a Picasso component",
        description:
          "Everything needed to use one Picasso component correctly: the import, every prop with its " +
          "type, the variants and their defaults, the pitfalls the component's own source warns about, " +
          "the do/don't pairs that carry the design decision, and its accessibility rules. " +
          "Use this before writing a component into IR product code.",
        inputSchema: z.object({
          name: z
            .string()
            .min(1)
            .describe('Component name, slug, or an export of it — "Button", "dropdown-menu", "TableCol".'),
        }),
      },
      async ({ name }) => {
        const c = findComponent(name);
        if (!c) {
          const near = search(name, "component", 5);
          return text(
            `No Picasso component called "${name}".` +
              (near.length ? `\n\nDid you mean:\n${near.map((h) => `- ${h.label}`).join("\n")}` : "") +
              `\n\nAll ${catalogue.components.length}: ${catalogue.components.map((x) => x.name).join(", ")}`,
          );
        }
        return text(
          [
            c.text,
            "",
            `Docs: ${c.url}`,
            c.figma ? `Figma: https://figma.com/design/${c.figma.fileKey}?node-id=${c.figma.nodeId.replace(":", "-")}` : "",
            `@ir/ui ${catalogue.version}`,
          ]
            .filter(Boolean)
            .join("\n"),
        );
      },
    );

    server.registerTool(
      "get_tokens",
      {
        title: "Get Picasso colour tokens",
        description:
          "The resolved semantic colour table: every token, the Tailwind utility that applies it, and " +
          "the hex it lands on in light and dark. Picasso allows no raw hex in product code, so read " +
          "this instead of guessing a colour. Filter by family to keep the answer small.",
        inputSchema: z.object({
          family: z
            .enum(["bg", "fg", "border", "status", "chart"])
            .optional()
            .describe(
              "bg = surfaces, fg = content, border = lines, status, chart. Omit for all " +
                `${TOKEN_FAMILIES.length} families.`,
            ),
          query: z.string().optional().describe('Substring filter on the token or utility, e.g. "danger".'),
        }),
      },
      async ({ family, query }) => {
        const q = query?.trim().toLowerCase();
        const rows = catalogue.tokens.filter(
          (t) =>
            (!family || t.family === family) &&
            (!q || t.token.toLowerCase().includes(q) || t.utility.toLowerCase().includes(q)),
        );
        if (!rows.length) {
          return text(
            `No tokens match${family ? ` family "${family}"` : ""}${q ? ` and "${query}"` : ""}. ` +
              `Families: ${TOKEN_FAMILIES.join(", ")}.`,
          );
        }
        return text(
          [
            `${rows.length} token${rows.length === 1 ? "" : "s"} — @ir/tokens ${catalogue.version}. ` +
              "Never use a raw hex; apply the utility.",
            "",
            "| token | utility | light | dark |",
            "| --- | --- | --- | --- |",
            ...rows.map((t) => `| ${t.token} | \`${t.utility}\` | ${t.light} | ${t.dark} |`),
          ].join("\n"),
        );
      },
    );

    server.registerTool(
      "get_doc",
      {
        title: "Get a Picasso documentation page",
        description:
          "A Picasso documentation page in full — foundations, layout, motion, content and writing rules, " +
          "contributing, and the repo's AGENTS.md. Call with no path to list every page by section.",
        inputSchema: z.object({
          path: z
            .string()
            .optional()
            .describe('Page path or title — "foundations/motion", "AGENTS.md". Omit to list all pages.'),
        }),
      },
      async ({ path }) => {
        if (!path) {
          const bySection = SECTIONS.map((s) => {
            const pages = catalogue.pages.filter((p) => p.section === s);
            return [`## ${s}`, ...pages.map((p) => `- ${p.path} — ${p.title}`)].join("\n");
          });
          return text(
            [
              `${catalogue.pages.length} pages in Picasso ${catalogue.version}. ` +
                "Component pages are not here — use get_component.",
              ...bySection,
            ].join("\n\n"),
          );
        }
        const p = findPage(path);
        if (!p) {
          const near = search(path, "doc", 5);
          return text(
            `No Picasso page at "${path}".` +
              (near.length ? `\n\nDid you mean:\n${near.map((h) => `- ${h.label}`).join("\n")}` : "") +
              "\n\nCall get_doc with no path to list every page.",
          );
        }
        return text([p.body, "", p.url ? `Source: ${p.url}` : `Source: ${p.path} in the Picasso repo`].join("\n"));
      },
    );
  },
  {
    serverInfo: { name: "picasso", version: catalogue.version },
    instructions:
      "Picasso is Integrated Research's design system: the @ir/ui component library, the @ir/tokens " +
      "colour and type tokens, and the rules for using them. When you are writing or reviewing IR " +
      "product UI, use a Picasso component rather than building one, and a Picasso token rather than a " +
      "raw value. search_picasso finds things by name or concept; get_component, get_tokens and get_doc " +
      "return them in full. Everything here is read-only.",
  },
);

export { handler as GET, handler as POST, handler as DELETE };
