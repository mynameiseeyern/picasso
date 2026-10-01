import { existsSync, statSync } from 'node:fs';
import { dirname, extname, relative, resolve, sep } from 'node:path';

/* The docs are written to read on GitHub, so they link to each other the way
 * GitHub resolves links: by file. `[Colour](colour.md)` from
 * docs/foundations/README.md means docs/foundations/colour.md.
 *
 * A browser resolves the same link by URL, and the two disagree. The index
 * page is served at /docs/foundations — no trailing slash — so `colour.md`
 * becomes /docs/colour.md, which is nothing. Fumadocs' own createRelativeLink
 * only rewrites hrefs that start with ./ or ../ and only ones that land on a
 * page, so bare names, folders and files outside docs/ all passed through.
 *
 * This rewrites every relative link at compile time, from the file it was
 * written in, so the HTML page and the Markdown rendition both get a link
 * that works:
 *
 *   colour.md, ./colour.md        → /docs/foundations/colour
 *   ../content/, ../content       → /docs/content          (the folder's README)
 *   ../README.md                  → /docs
 *   ../../AGENTS.md               → the file on GitHub      (outside docs/)
 *
 * A link to a doc that does not exist fails the build. A dead link that only
 * shows up when someone clicks it is how this went unnoticed.
 */

interface Options {
  /** The docs folder, absolute or relative to the working directory. */
  docsDir: string;
  /** The route the docs are served under, e.g. `/docs`. */
  route: string;
  /** `https://github.com/<user>/<repo>` and the branch, for files outside docs/. */
  repoUrl: string;
  branch: string;
}

interface Node {
  type: string;
  url?: string;
  children?: Node[];
}

const EXTERNAL = /^([a-z][a-z0-9+.-]*:|\/|#)/i;
const DOC = /\.mdx?$/i;
const INDEX = /(^|\/)(README|index)$/i;

const inside = (parent: string, child: string) => {
  const rel = relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !rel.startsWith(sep) && !/^[a-z]:/i.test(rel));
};

const posix = (p: string) => p.split(sep).join('/');

export function remarkDocLinks(options: Options) {
  const docsDir = resolve(options.docsDir);
  const repoDir = resolve(docsDir, '..');

  function rewrite(url: string, from: string): string {
    if (!url || EXTERNAL.test(url)) return url;

    const cut = url.search(/[?#]/);
    const target = cut === -1 ? url : url.slice(0, cut);
    const suffix = cut === -1 ? '' : url.slice(cut);
    if (!target) return url;

    let decoded = target;
    try {
      decoded = decodeURI(target);
    } catch {
      /* keep the raw value */
    }
    const abs = resolve(dirname(from), decoded);
    const isDir = existsSync(abs) && statSync(abs).isDirectory();

    if (inside(docsDir, abs) && (isDir || DOC.test(abs))) {
      const exists = isDir
        ? existsSync(resolve(abs, 'README.md')) || existsSync(resolve(abs, 'index.md'))
        : existsSync(abs);
      if (!exists) {
        throw new Error(
          `${posix(relative(repoDir, from))} links to "${url}", which is not a page in docs/.`,
        );
      }
      const page = posix(relative(docsDir, abs))
        .replace(DOC, '')
        .replace(INDEX, '')
        .replace(/\/$/, '');
      return `${options.route}${page ? `/${page}` : ''}${suffix}`;
    }

    if (inside(repoDir, abs)) {
      if (!existsSync(abs)) {
        throw new Error(
          `${posix(relative(repoDir, from))} links to "${url}", which is not a file in the repo.`,
        );
      }
      const kind = isDir ? 'tree' : 'blob';
      const path = posix(relative(repoDir, abs));
      return `${options.repoUrl}/${kind}/${options.branch}/${path}${suffix}`;
    }

    return url;
  }

  return () =>
    (tree: Node, file: { path?: string; history?: string[] }) => {
      const from = file.path ?? file.history?.[0];
      if (!from || extname(from) === '') return;
      const absFrom = resolve(from);

      const walk = (node: Node) => {
        if ((node.type === 'link' || node.type === 'definition') && typeof node.url === 'string') {
          node.url = rewrite(node.url, absFrom);
        }
        node.children?.forEach(walk);
      };
      walk(tree);
    };
}
