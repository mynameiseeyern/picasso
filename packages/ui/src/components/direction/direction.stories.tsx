import type { Meta, StoryObj } from "@storybook/react";
import { DirectionProvider, type Direction } from "./direction";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "../breadcrumb/breadcrumb";
import { KpiTile } from "../kpi-tile/kpi-tile";
import { Progress } from "../progress/progress";
import { Switch } from "../switch/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table/table";
import { Tabs, TabsList, TabsTrigger } from "../tabs/tabs";
import { ThresholdSlider } from "../threshold-slider/threshold-slider";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof DirectionProvider> = {
  title: "Foundations/Direction",
  component: DirectionProvider,
  parameters: {
    docs: {
      description: {
        component:
          "Which way the page reads. Set `dir` on `<html>` **and** wrap the " +
          "app in `DirectionProvider` — CSS reads the attribute, Radix reads " +
          "the provider. The toolbar's *Direction* control does both for " +
          "every story, so any component can be looked at right-to-left. " +
          "Arabic, Hebrew and Persian are set in Noto Sans Arabic and Noto " +
          "Sans Hebrew, which sit in every sans stack.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof DirectionProvider>;

type Copy = {
  lang: string;
  direction: Direction;
  crumbs: [string, string, string];
  tabs: [string, string, string];
  kpi: string;
  upload: string;
  alerts: string;
  endpoint: string;
  loss: string;
  warning: string;
  critical: string;
};

const copy: Record<"en" | "ar" | "he" | "fa", Copy> = {
  en: {
    lang: "en",
    direction: "ltr",
    crumbs: ["Fleet", "Sydney", "Trunk 04"],
    tabs: ["Overview", "Trunks", "Alerts"],
    kpi: "Packet loss",
    upload: "Uploading trace",
    alerts: "Alert me",
    endpoint: "Endpoint",
    loss: "Loss",
    warning: "Warning",
    critical: "Critical",
  },
  ar: {
    lang: "ar",
    direction: "rtl",
    crumbs: ["الأسطول", "سيدني", "الخط 04"],
    tabs: ["نظرة عامة", "الخطوط", "التنبيهات"],
    kpi: "فقدان الحزم",
    upload: "جارٍ رفع التتبع",
    alerts: "نبّهني",
    endpoint: "نقطة النهاية",
    loss: "الفقد",
    warning: "تحذير",
    critical: "حرج",
  },
  he: {
    lang: "he",
    direction: "rtl",
    crumbs: ["צי", "סידני", "קו 04"],
    tabs: ["סקירה", "קווים", "התראות"],
    kpi: "אובדן מנות",
    upload: "מעלה מעקב",
    alerts: "התרע לי",
    endpoint: "נקודת קצה",
    loss: "אובדן",
    warning: "אזהרה",
    critical: "קריטי",
  },
  fa: {
    lang: "fa",
    direction: "rtl",
    crumbs: ["ناوگان", "سیدنی", "خط 04"],
    tabs: ["نمای کلی", "خط‌ها", "هشدارها"],
    kpi: "اتلاف بسته",
    upload: "در حال بارگذاری ردیابی",
    alerts: "به من هشدار بده",
    endpoint: "نقطه پایانی",
    loss: "اتلاف",
    warning: "هشدار",
    critical: "بحرانی",
  },
};

/**
 * One panel of the things RTL changes: order, a knob, a bar, a scale, a
 * separator — and the things it must not: digits, an IP address, a column
 * of figures.
 */
function Sampler({ text }: { text: Copy }) {
  return (
    <div
      dir={text.direction}
      lang={text.lang}
      className="flex w-100 flex-col gap-6 rounded-xl border border-line-neutral-muted bg-surface-card p-6"
    >
      <DirectionProvider direction={text.direction}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{text.crumbs[0]}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{text.crumbs[1]}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>{text.crumbs[2]}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">{text.tabs[0]}</TabsTrigger>
            <TabsTrigger value="b">{text.tabs[1]}</TabsTrigger>
            <TabsTrigger value="c">{text.tabs[2]}</TabsTrigger>
          </TabsList>
        </Tabs>

        <KpiTile label={text.kpi} value="-0.4" unit="%" />

        <Progress value={64} label={text.upload} />

        <label className="flex items-center justify-between gap-4 text-body-md text-content-neutral-emphasis">
          {text.alerts}
          <Switch defaultChecked aria-label={text.alerts} />
        </label>

        <ThresholdSlider
          min={0}
          max={100}
          warning={70}
          critical={85}
          warningLabel={text.warning}
          criticalLabel={text.critical}
          format={(v) => `${v}%`}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{text.endpoint}</TableHead>
              <TableHead numeric>{text.loss}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <span className="ltr-island">10.0.4.12:5060</span>
              </TableCell>
              <TableCell numeric>-0.4%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <span className="ltr-island">10.0.4.13:5060</span>
              </TableCell>
              <TableCell numeric>12.8%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DirectionProvider>
    </div>
  );
}

/** English beside Arabic: the same panel, read the other way. */
export const EnglishAndArabic: Story = {
  name: "English and Arabic",
  render: () => (
    <div className="flex flex-wrap gap-8">
      <Sampler text={copy.en} />
      <Sampler text={copy.ar} />
    </div>
  ),
};

/** The three right-to-left languages Picasso supports. Arabic and Persian share Noto Sans Arabic; Hebrew is Noto Sans Hebrew. */
export const ArabicHebrewPersian: Story = {
  name: "Arabic, Hebrew and Persian",
  render: () => (
    <div className="flex flex-wrap gap-8">
      <Sampler text={copy.ar} />
      <Sampler text={copy.he} />
      <Sampler text={copy.fa} />
    </div>
  ),
};

const pair = pairOf(guidance);

/**
 * Narrow — 328, a 360 phone minus its gutters. RTL and a narrow column at the
 * same time: the two cases that break a layout independently, together. Every
 * inline edge has to mirror and every line still has to wrap inside the box.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    // Not the Sampler: that card is a fixed w-100, wider than the 328 this
    // story is about, so framing it at 328 would measure the card and not the
    // mirroring.
    const Row = ({ text }: { text: Copy }) => (
      <div className="flex flex-col gap-2">
        <p className="text-body-md text-content-neutral-emphasis">
          {text.crumbs.join(" / ")}
        </p>
        <p className="text-body-sm text-content-neutral-muted">{text.alerts}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-chart-1" />
            <span className="min-w-0 truncate text-body-sm text-content-neutral-muted">
              {text.endpoint}
            </span>
          </span>
          <span className="shrink-0 text-body-sm tabular-nums text-content-neutral-muted">
            {text.loss}
          </span>
        </div>
      </div>
    );
    return (
      <div className="flex flex-col gap-4">
        <div className="w-82 border border-line-neutral-muted p-3" dir="ltr">
          <Row text={copy.en} />
        </div>
        <div className="w-82 border border-line-neutral-muted p-3" dir="rtl">
          <Row text={copy.ar} />
        </div>
      </div>
    );
  },
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("technical-text-stays-ltr")}
        width="wide"
        stage="tall"
        dont={
          <div dir="rtl" className="w-full space-y-1">
            <p className="text-body-sm text-content-neutral-muted">المضيف</p>
            <p className="font-mono text-body-sm">10.4.12.80:8086</p>
          </div>
        }
        do={
          <div dir="rtl" className="w-full space-y-1">
            <p className="text-body-sm text-content-neutral-muted">المضيف</p>
            <p className="ltr-island font-mono text-body-sm">10.4.12.80:8086</p>
          </div>
        }
      />
    </GuidanceStory>
  ),
};
