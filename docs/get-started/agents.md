---
title: For agents
description: Point Claude, Cursor or Copilot at Picasso so it writes Picasso instead of guessing.
---

# For agents

An agent writing IR product UI without Picasso invents a hex, invents a radius,
and rebuilds a component that already exists. There are two ways to stop that:
hand it the files, or give it the server.

## The server

One line of config, and the agent can ask Picasso questions:

```
https://ir-picasso.vercel.app/api/mcp
```

Read-only, no key, no sign-in. The same endpoint works from anything that
speaks MCP.

**Claude Code** — in the repo you are working in:

```bash
claude mcp add --transport http picasso https://ir-picasso.vercel.app/api/mcp
```

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "picasso": { "url": "https://ir-picasso.vercel.app/api/mcp" }
  }
}
```

**VS Code / Copilot** — `.vscode/mcp.json`:

```json
{
  "servers": {
    "picasso": { "type": "http", "url": "https://ir-picasso.vercel.app/api/mcp" }
  }
}
```

### What it can ask

| Tool | Answers |
|---|---|
| `search_picasso` | "is there a component for this?" — ranked matches across components, pages and tokens, each with a URL |
| `get_component` | the import, every prop and its type, the variants and defaults, the pitfalls the source warns about, the do/don't pairs, the accessibility rules |
| `get_tokens` | the resolved colour table — every token, its utility, and the hex it lands on in light and dark |
| `get_doc` | a documentation page in full, including `AGENTS.md` |

`get_component` takes a name, a slug or an export, so `TableCol` finds the
table. `get_tokens` takes a family (`bg`, `fg`, `border`, `status`, `chart`) or
a substring, because the whole table is 137 rows and an agent rarely needs all
of them.

### Why a server and not just the files

The files are a fixed cost: `llms-full.txt` is most of a megabyte, and an agent
that loads it has spent its context before writing a line. The server is a
variable cost — it reads the twenty lines about the component it is actually
using. Both are built from the same catalogue in the same run, so neither can
tell you something the other denies.

## The files

For a tool that cannot speak MCP, or for a one-off paste into a prompt:

| File | Contents |
|---|---|
| [`/llms.txt`](https://ir-picasso.vercel.app/llms.txt) | index — one line per page |
| [`/llms-components.txt`](https://ir-picasso.vercel.app/llms-components.txt) | every component: API, pitfalls, do/don't |
| [`/llms-tokens.txt`](https://ir-picasso.vercel.app/llms-tokens.txt) | the resolved token table |
| [`/llms-foundations.txt`](https://ir-picasso.vercel.app/llms-foundations.txt) | foundations and content rules |
| [`/llms-full.txt`](https://ir-picasso.vercel.app/llms-full.txt) | all of it |

Any docs page also returns its own markdown — add `.md` to the URL.

## What still belongs in your repo

The server tells an agent what Picasso has. It does not tell it what your
product has decided. Keep the project's own `AGENTS.md` or `CLAUDE.md` saying:

- which Picasso version the product is on
- that raw hex, raw radius and raw spacing are lint errors here, not matters of taste
- where the product's own patterns live

And install `@ir/eslint-config`, because a rule an agent can read is a rule an
agent can also forget. See [For engineers](engineers.md).
