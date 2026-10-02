import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { DirectionProvider } from "../components/direction/direction";
import { Switch } from "../components/switch/switch";
import { Progress } from "../components/progress/progress";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../components/breadcrumb/breadcrumb";
import { Calendar } from "../components/calendar/calendar";
import { Toast, ToastProvider, ToastViewport } from "../components/toast/toast";
import { ThresholdSlider } from "../components/threshold-slider/threshold-slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/table/table";
import { OtpInput, OtpSlot } from "../components/otp/otp";
import { KpiTile } from "../components/kpi-tile/kpi-tile";

/**
 * RTL — Arabic, Hebrew, Persian. The rules in docs/foundations/rtl.md, held.
 *
 * jsdom has no layout, so nothing here can see a component mirrored. What it
 * can hold is the thing a logical class cannot do for you: a translate that
 * needs its sign turned, an icon that needs flipping, geometry done in
 * script, and text that must not follow the page.
 */
function Rtl({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl">
      <DirectionProvider direction="rtl">{children}</DirectionProvider>
    </div>
  );
}

const cls = (el: Element | null) => (el?.getAttribute("class") ?? "").split(/\s+/);

afterEach(() => vi.restoreAllMocks());

describe("RTL: movement that a logical class cannot reach", () => {
  it("sends the Switch knob to the inline end, at both sizes", () => {
    // Without the rtl: half, an on switch in Arabic has its knob outside
    // the track.
    for (const [size, n] of [["sm", 4], ["md", 5]] as const) {
      const { container, unmount } = render(<Switch size={size} aria-label="Alerts" />);
      const root = cls(container.querySelector("[data-slot=switch]"));
      expect(root).toContain(
        `[&_[data-slot=switch-thumb]]:data-[state=checked]:translate-x-${n}`,
      );
      expect(root).toContain(
        `rtl:[&_[data-slot=switch-thumb]]:data-[state=checked]:-translate-x-${n}`,
      );
      unmount();
    }
  });

  it("fills Progress from the inline start", () => {
    const { container } = render(<Progress value={40} label="Uploading" />);
    const bar = cls(container.querySelector("[data-slot=progress-indicator]"));
    expect(bar).toContain("translate-x-(--progress-offset)");
    expect(bar).toContain("rtl:-translate-x-(--progress-offset)");
  });

  it("swipes a Toast away toward the edge it came from", () => {
    const swipe = (ui: React.ReactElement) => {
      const { baseElement, unmount } = render(ui);
      const direction = baseElement
        .querySelector("[data-swipe-direction]")
        ?.getAttribute("data-swipe-direction");
      unmount();
      return direction;
    };
    const app = (
      <ToastProvider>
        <Toast open>Saved</Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(swipe(app)).toBe("right");
    expect(swipe(<Rtl>{app}</Rtl>)).toBe("left");
  });
});

describe("RTL: geometry done in script", () => {
  const track = (width: number) =>
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      width,
      height: 8,
      top: 0,
      left: 0,
      right: width,
    } as DOMRect);

  it("measures the Threshold slider from the inline start", () => {
    // A pointer 100px in from the RIGHT of a 400 track is a quarter of the
    // way along the scale in Arabic, and three quarters in English.
    track(400);
    const drag = (ui: React.ReactElement, onChange: ReturnType<typeof vi.fn>) => {
      const { unmount } = render(ui);
      const thumb = screen.getByRole("slider", { name: "Warning threshold" });
      thumb.hasPointerCapture = () => true;
      fireEvent.pointerMove(thumb, { clientX: 300, pointerId: 1 });
      unmount();
      return onChange.mock.calls.at(-1)?.[0];
    };
    const ltr = vi.fn();
    const rtl = vi.fn();
    const slider = (onChange: typeof ltr) => (
      <ThresholdSlider min={0} max={100} warning={10} critical={90} onChange={onChange} />
    );
    expect(drag(slider(ltr), ltr)).toEqual({ warning: 75, critical: 90 });
    expect(drag(<Rtl>{slider(rtl)}</Rtl>, rtl)).toEqual({ warning: 25, critical: 90 });
  });

  it("turns the Threshold slider's arrow keys round, as Radix's Slider does", async () => {
    const onChange = vi.fn();
    render(
      <Rtl>
        <ThresholdSlider min={0} max={100} warning={70} critical={85} onChange={onChange} />
      </Rtl>,
    );
    screen.getByRole("slider", { name: "Warning threshold" }).focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith({ warning: 71, critical: 85 });
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith({ warning: 69, critical: 85 });
    // Up is more in every direction.
    await userEvent.keyboard("{ArrowUp}");
    expect(onChange).toHaveBeenLastCalledWith({ warning: 71, critical: 85 });
  });

  it("draws the Threshold slider's thumbs and labels from the same edge it measures", () => {
    const { container } = render(
      <ThresholdSlider min={0} max={100} warning={70} critical={85} />,
    );
    const thumb = cls(screen.getAllByRole("slider")[0]);
    const label = cls(container.querySelector("[data-slot^=threshold-slider-label]"));
    for (const c of [thumb, label]) {
      expect(c).toContain("start-(--at)");
      expect(c).toContain("-translate-x-1/2");
      expect(c).toContain("rtl:translate-x-1/2");
    }
  });

  it("hands the direction to the Calendar's grid", () => {
    const { container, unmount } = render(<Calendar />);
    expect(container.querySelector("[data-slot=calendar]")).toHaveAttribute("dir", "ltr");
    unmount();
    const rtl = render(
      <Rtl>
        <Calendar />
      </Rtl>,
    );
    expect(rtl.container.querySelector("[data-slot=calendar]")).toHaveAttribute("dir", "rtl");
  });
});

describe("RTL: text that does not follow the page", () => {
  it("keeps a numeric column right-aligned and left-to-right, heading included", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead numeric>MOS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell numeric>-4.2</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const cell = cls(screen.getByRole("cell"));
    expect(cell).toContain("ltr-island");
    expect(cell).toContain("text-end");
    // The heading may be Arabic, so it is not an island — and `text-end`
    // would then put it on the left, away from its own figures.
    const head = cls(screen.getByRole("columnheader"));
    // eslint-disable-next-line picasso/no-physical-properties -- asserts the one deliberately physical class; the reason is in table.tsx
    expect(head).toContain("text-right");
    expect(head).not.toContain("ltr-island");
  });

  it("keeps a one-time code in typing order", () => {
    const { container } = render(
      <OtpInput maxLength={2} aria-label="Verification code">
        <OtpSlot index={0} />
        <OtpSlot index={1} />
      </OtpInput>,
    );
    const slot = container.querySelector("[data-slot=otp-slot]");
    expect(slot?.closest(".ltr-island")).not.toBeNull();
  });

  it("keeps a KPI figure and a Progress figure left-to-right", () => {
    const { container } = render(
      <>
        <KpiTile label="Packet loss" value="-0.4" unit="%" />
        <Progress value={40} label="Uploading" />
      </>,
    );
    // Value and unit are one island, so "-0.4 %" cannot come out "% -0.4".
    // The row around it is not, so the comparison stays at the inline end.
    const figure = container.querySelector("[data-slot=kpi-tile-figure]");
    expect(cls(figure)).toContain("ltr-island");
    expect(cls(figure?.parentElement ?? null)).not.toContain("ltr-island");
    expect(
      container
        .querySelector("[data-slot=kpi-tile-unit]")
        ?.closest("[data-slot=kpi-tile-figure]"),
    ).not.toBeNull();
    expect(cls(container.querySelector("[data-slot=progress-value]"))).toContain("ltr-island");
  });
});

describe("RTL: icons that point along the reading direction", () => {
  it("mirrors the Breadcrumb separator", () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Fleet</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Sydney-01</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    for (const sep of container.querySelectorAll("[data-slot=breadcrumb-separator]"))
      expect(cls(sep)).toContain("rtl-mirror");
  });

  it("leaves no directional icon in the library unmirrored", () => {
    // The ratchet. A chevron or arrow added tomorrow fails here unless it
    // carries `rtl-mirror` or is listed below with the reason it must not.
    const exempt: Record<string, string> = {
      // react-day-picker swaps previous and next itself when given `dir`;
      // mirroring them as well would turn them back.
      "calendar/calendar.tsx": "the grid swaps its own chevrons",
    };
    const root = ["src/components", "packages/ui/src/components"].find(existsSync)!;
    const directional =
      /<(Chevron(?:s)?(?:Left|Right|First|Last)|Arrow(?:Big)?(?:Left|Right)(?:[A-Z]\w*)?|PanelLeft\w*|PanelRight\w*|MoveLeft|MoveRight|Undo2?|Redo2?|Reply|Forward|LogIn|LogOut|CornerDown(?:Left|Right))\b([^>]*)>/g;
    const bare: string[] = [];
    for (const dir of readdirSync(root)) {
      const file = `${dir}/${dir}.tsx`;
      if (!existsSync(join(root, file)) || file in exempt) continue;
      const src = readFileSync(join(root, file), "utf8");
      for (const m of src.matchAll(directional))
        if (!m[2].includes("rtl-mirror")) bare.push(`${file}: <${m[1]}>`);
    }
    expect(bare).toEqual([]);
  });
});
