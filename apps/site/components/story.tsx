'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * One Storybook story, embedded in a docs page.
 *
 * Storybook is nested under /components (scripts/nest-storybook.mjs), so the
 * story is same-origin and its height can be read — the frame is sized to
 * what it holds, and follows it when the story's two panels stack on a narrow
 * screen. `height` is an attribute, not a style, so nothing here is inline.
 *
 * On GitHub this tag renders as nothing, which is why a page that uses it
 * still says everything in words.
 */
export function Story({ id, title }: { id: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  // Tall enough for two panels side by side before the first measurement.
  const [height, setHeight] = useState(440);

  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    let observer: ResizeObserver | undefined;

    const measure = () => {
      const view = node.contentWindow;
      const root = node.contentDocument?.getElementById('storybook-root');
      if (!view || !root) return;
      const sync = () => {
        if (root.offsetHeight > 0) setHeight(root.offsetHeight);
      };
      observer?.disconnect();
      // The frame's own ResizeObserver: the element lives in its document.
      observer = new (view as Window & typeof globalThis).ResizeObserver(sync);
      observer.observe(root);
      sync();
    };

    node.addEventListener('load', measure);
    // The frame may have finished loading before this effect ran.
    if (node.contentDocument?.readyState === 'complete') measure();
    return () => {
      node.removeEventListener('load', measure);
      observer?.disconnect();
    };
  }, []);

  return (
    <figure className="not-prose my-6">
      <iframe
        ref={frame}
        src={`/components/iframe.html?id=${id}&viewMode=story`}
        title={title}
        height={height}
        loading="lazy"
        className="w-full rounded-lg border border-fd-border"
      />
      <figcaption className="mt-2 text-sm text-fd-muted-foreground">
        <a className="underline" href={`/components/?path=/story/${id}`}>
          Open in Storybook
        </a>
      </figcaption>
    </figure>
  );
}
