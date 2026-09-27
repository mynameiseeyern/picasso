import { it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { writeFileSync } from "node:fs";
import * as React from "react";
import { Button } from "./components/button/button";

const variants = ["default", "neutral", "secondary", "outline", "ghost", "destructive", "link"] as const;
const sizes = ["xs", "sm", "md", "lg"] as const;
const icons = ["icon-xs", "icon-sm", "icon-md", "icon-lg"] as const;
const Dot = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

it("writes a static sheet", () => {
  const sheet = (
    <div style={{ display: "grid", gap: "2rem" }}>
      {variants.map((v) => (
        <div key={v}>
          <div className="text-label-sm text-content-neutral-muted" style={{ marginBottom: 8 }}>
            {v}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {sizes.map((s) => (
              <Button key={s} variant={v} size={s}>
                {s}
              </Button>
            ))}
            {sizes.map((s) => (
              <Button key={`i${s}`} variant={v} size={s}>
                <Dot />
                {s}
              </Button>
            ))}
            {icons.map((s) => (
              <Button key={s} variant={v} size={s} aria-label={s}>
                <Dot />
              </Button>
            ))}
            <Button variant={v} loading>loading</Button>
            <Button variant={v} disabled>disabled</Button>
          </div>
        </div>
      ))}
    </div>
  );
  writeFileSync(process.env.SNAP_OUT!, renderToStaticMarkup(sheet));
});
