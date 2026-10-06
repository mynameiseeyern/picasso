import type { Meta, StoryObj } from "@storybook/react";
import { Sparkline } from "./sparkline";
import { Badge } from "../badge/badge";
import { KpiTile } from "../kpi-tile/kpi-tile";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const pair = pairOf(guidance);

/** 24 hours of MOS, hourly. */
const MOS = [
  4.4, 4.38, 4.41, 4.36, 4.3, 4.33, 4.28, 4.2, 4.05, 3.95, 3.88, 3.9, 4.02,
  4.12, 4.2, 4.26, 4.3, 4.28, 4.24, 4.18, 4.12, 4.1, 4.08, 4.1,
];
/** The same window, with a two-hour outage in the middle. */
const WITH_GAP = [
  4.4, 4.38, 4.41, 4.36, 4.3, 4.33, 4.28, 4.2, null, null, 3.88, 3.9, 4.02,
  4.12, 4.2, 4.26, 4.3, 4.28, 4.24, 4.18, 4.12, 4.1, 4.08, 4.1,
];
const STEADY = [4.3, 4.31, 4.29, 4.3, 4.32, 4.3, 4.29, 4.31, 4.3, 4.3];
const FALLING = [4.4, 4.3, 4.1, 3.9, 3.6, 3.3, 3.1, 2.9, 2.7, 2.6];

const meta: Meta<typeof Sparkline> = {
  title: "Components/Sparkline",
  component: Sparkline,
  parameters: {
    docs: {
      description: {
        component:
          "A chart stripped to its shape — no axes, no gridlines, no labels. " +
          "It says which way this is going and whether it is steady, and " +
          "nothing else, so it sits beside the number it summarises. One " +
          "series only, and no hover: values are the time-series chart's job. " +
          "No Figma component exists for it yet.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["line", "area"] },
    tone: {
      control: "inline-radio",
      options: ["primary", "neutral", "healthy", "warning", "critical"],
    },
    end: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Sparkline>;

export const Default: Story = {
  args: { variant: "line", tone: "primary", end: true },
  render: (args) => (
    <Sparkline
      values={MOS}
      variant={args.variant}
      tone={args.tone}
      end={args.end}
      label="MOS over 24 hours, 4.4 falling to 3.9 and recovering to 4.1"
    />
  ),
};

/** Word-sized is the point: the line sits in the text, not in a panel. */
export const InASentence: Story = {
  name: "In a sentence",
  parameters: { controls: { disable: true } },
  render: () => (
    <p className="max-w-150 text-body-md text-content-neutral-emphasis">
      Sydney-SBC-01 has held{" "}
      <span className="inline-flex items-baseline gap-1.5">
        <span className="text-metric-sm">4.1</span>
        <span className="inline-block h-4 w-14 align-baseline">
          <Sparkline values={MOS} label={null} />
        </span>
      </span>{" "}
      through the afternoon, after a dip at 09:00.
    </p>
  ),
};

/** Where it earns its keep: fifty rows, scanned in one pass. */
export const InATable: Story = {
  name: "In a table",
  parameters: { controls: { disable: true } },
  render: () => {
    const rows = [
      { trunk: "Sydney-SBC-01", mos: "4.10", values: MOS, tone: "primary" as const, status: null },
      { trunk: "Sydney-SBC-02", mos: "4.30", values: STEADY, tone: "primary" as const, status: null },
      { trunk: "Melbourne-SBC-04", mos: "2.60", values: FALLING, tone: "critical" as const, status: "Critical" },
      { trunk: "Perth-SBC-01", mos: "4.10", values: WITH_GAP, tone: "primary" as const, status: null },
    ];
    return (
      <div className="w-150 overflow-hidden rounded-lg border border-line-neutral-muted">
        {rows.map((r) => (
          <div
            key={r.trunk}
            className="flex items-center gap-4 border-b border-line-neutral-muted px-4 py-2.5 last:border-b-0"
          >
            <span className="flex-1 text-body-md text-content-neutral-emphasis">
              {r.trunk}
            </span>
            {r.status ? (
              <Badge color="danger">{r.status}</Badge>
            ) : null}
            <span className="w-10 text-end text-body-md tabular-nums text-content-neutral-emphasis">
              {r.mos}
            </span>
            {/* Every row on the same 2.5–5 scale, so the shapes compare. */}
            <span className="block h-6 w-20">
              <Sparkline
                values={r.values}
                min={2.5}
                max={5}
                tone={r.tone}
                label={null}
              />
            </span>
          </div>
        ))}
      </div>
    );
  },
};

/** The threshold the number is graded against, drawn where it falls. */
export const WithThreshold: Story = {
  name: "With a threshold",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-80">
      <KpiTile
        label="MOS — Melbourne-SBC-04"
        value="2.60"
        status="critical"
        /* `footer` is the full-width slot under the number. `comparison` is
           the inline one beside it, for a delta or a shorter line. */
        footer={
          <span className="block h-10 w-full">
            <Sparkline
              values={FALLING}
              variant="area"
              tone="critical"
              min={2.5}
              max={5}
              threshold={3.6}
              label="MOS over 24 hours, 4.4 falling to 2.6, below the 3.6 floor since 14:00"
            />
          </span>
        }
      />
    </div>
  ),
};

/** 328 — the floor minus its gutters. */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-82 items-center gap-3">
      <span className="flex-1 text-body-sm text-content-neutral-muted">
        Sydney-SBC-01
      </span>
      <span className="text-body-md tabular-nums text-content-neutral-emphasis">
        4.10
      </span>
      <span className="block h-5 w-16">
        <Sparkline values={MOS} min={2.5} max={5} label={null} />
      </span>
    </div>
  ),
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("pin-the-scale-across-a-column")}
        width="wide"
        dont={
          <div className="flex w-full flex-col gap-2">
            {[STEADY, FALLING].map((v, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex-1 text-body-sm text-content-neutral-muted">
                  {i ? "Melbourne-SBC-04" : "Sydney-SBC-02"}
                </span>
                {/* No min/max: each row fills its own box. */}
                <span className="block h-6 w-24">
                  <Sparkline values={v} label={null} />
                </span>
              </div>
            ))}
          </div>
        }
        do={
          <div className="flex w-full flex-col gap-2">
            {[STEADY, FALLING].map((v, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex-1 text-body-sm text-content-neutral-muted">
                  {i ? "Melbourne-SBC-04" : "Sydney-SBC-02"}
                </span>
                <span className="block h-6 w-24">
                  <Sparkline values={v} min={2.5} max={5} label={null} />
                </span>
              </div>
            ))}
          </div>
        }
      />

      <Guidance
        pair={pair("gap-is-not-zero")}
        width="wide"
        dont={
          <span className="block h-10 w-full">
            <Sparkline
              /* The outage plotted as a reading of zero. */
              values={WITH_GAP.map((v) => (v === null ? 0 : v))}
              min={0}
              max={5}
              label={null}
            />
          </span>
        }
        do={
          <span className="block h-10 w-full">
            <Sparkline values={WITH_GAP} min={0} max={5} label={null} />
          </span>
        }
      />

      <Guidance
        pair={pair("status-tone-needs-a-word")}
        width="wide"
        dont={
          <div className="flex w-full items-center gap-3">
            <span className="flex-1 text-body-sm text-content-neutral-muted">
              Melbourne-SBC-04
            </span>
            <span className="block h-6 w-24">
              <Sparkline values={FALLING} tone="critical" label={null} />
            </span>
          </div>
        }
        do={
          <div className="flex w-full items-center gap-3">
            <span className="flex-1 text-body-sm text-content-neutral-muted">
              Melbourne-SBC-04
            </span>
            <Badge color="danger">Critical</Badge>
            <span className="block h-6 w-24">
              <Sparkline values={FALLING} tone="critical" label={null} />
            </span>
          </div>
        }
      />
    </GuidanceStory>
  ),
};
