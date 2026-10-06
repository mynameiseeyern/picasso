import type { Meta, StoryObj } from "@storybook/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  parameters: {
    docs: {
      description: {
        component:
          "Sections that expand in place. `variant` picks the icon pair and " +
          "nothing else — faq uses plus and minus for answers that appear, " +
          "default uses chevrons for sections that unfold. Anything " +
          "collapsed is not read and not found on the page, so collapse " +
          "what most people will skip.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "faq"] },
    iconPosition: { control: "inline-radio", options: ["right", "left"] },
  },
  args: { variant: "default", iconPosition: "right" },
};
export default meta;
type Story = StoryObj<typeof Accordion>;

const QUESTIONS = [
  {
    q: "What counts as a monitored endpoint?",
    a: "Any device or service registered to a site and reporting to a collector. Endpoints that have never reported are listed but not billed.",
  },
  {
    q: "How long is data kept?",
    a: "Call records for 13 months, raw packet captures for 7 days. Retention is set per tenant and can be shortened, not lengthened.",
  },
  {
    q: "Can I change my plan later?",
    a: "Yes, at any time. Changes take effect at the start of the next billing period.",
  },
];

/** Chevrons — sections of a longer page unfolding in place. */
export const Default: Story = {
  render: (args) => (
    <div className="w-192">
      <Accordion
        type="single"
        collapsible
        defaultValue="q0"
        variant={args.variant}
        iconPosition={args.iconPosition}
      >
        {QUESTIONS.map((item, i) => (
          <AccordionItem key={item.q} value={`q${i}`} divider={i > 0}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

/** Plus and minus — a list of questions, where each answer appears. */
export const Faq: Story = {
  render: () => (
    <div className="w-192">
      <Accordion type="single" collapsible variant="faq">
        {QUESTIONS.map((item, i) => (
          <AccordionItem key={item.q} value={`q${i}`} divider={i > 0}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

/** Icon on the left, where the list reads more like a tree than a page. */
export const IconLeft: Story = {
  render: () => (
    <div className="w-192">
      <Accordion
        type="single"
        collapsible
        variant="faq"
        iconPosition="left"
        defaultValue="q0"
      >
        {QUESTIONS.map((item, i) => (
          <AccordionItem key={item.q} value={`q${i}`} divider={i > 0}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

/** Several open at once, for answers people compare against each other. */
export const Multiple: Story = {
  render: () => (
    <div className="w-192">
      <Accordion type="multiple" defaultValue={["q0", "q1"]}>
        {QUESTIONS.map((item, i) => (
          <AccordionItem key={item.q} value={`q${i}`} divider={i > 0}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

/**
 * Narrow — 328, a 360 phone minus its gutters. Every other story here pins a
 * width well above that, so this is the one that shows what a phone does to
 * it, and the one the overflow sweep can measure.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="w-82">
      <Accordion
        type="single"
        collapsible
        defaultValue="q0"
        variant={args.variant}
        iconPosition={args.iconPosition}
      >
        {QUESTIONS.map((item, i) => (
          <AccordionItem key={item.q} value={`q${i}`} divider={i > 0}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

const pair = pairOf(guidance);

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("icon-sets-the-expectation")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full">
            <Accordion type="single" collapsible>
              <AccordionItem value="a">
                <AccordionTrigger>Is my data encrypted?</AccordionTrigger>
              </AccordionItem>
            </Accordion>
          </div>
        }
        do={
          <div className="w-full">
            <Accordion type="single" collapsible variant="faq">
              <AccordionItem value="a">
                <AccordionTrigger>Is my data encrypted?</AccordionTrigger>
              </AccordionItem>
            </Accordion>
          </div>
        }
      />

      <Guidance
        pair={pair("headings-are-headings")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full">
            <Accordion type="single" collapsible>
              <AccordionItem value="a">
                <AccordionTrigger>More</AccordionTrigger>
              </AccordionItem>
              <AccordionItem value="b" divider>
                <AccordionTrigger>Details</AccordionTrigger>
              </AccordionItem>
            </Accordion>
          </div>
        }
        do={
          <div className="w-full">
            <Accordion type="single" collapsible>
              <AccordionItem value="a">
                <AccordionTrigger>Retention and billing</AccordionTrigger>
              </AccordionItem>
              <AccordionItem value="b" divider>
                <AccordionTrigger>Collector requirements</AccordionTrigger>
              </AccordionItem>
            </Accordion>
          </div>
        }
      />

      <Guidance
        pair={pair("divider-above")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full">
            <Accordion type="single" collapsible>
              <AccordionItem value="a">
                <AccordionTrigger>Retention</AccordionTrigger>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>Collectors</AccordionTrigger>
              </AccordionItem>
            </Accordion>
            <hr className="border-line-neutral-muted" />
          </div>
        }
        do={
          <div className="w-full">
            <Accordion type="single" collapsible>
              <AccordionItem value="a">
                <AccordionTrigger>Retention</AccordionTrigger>
              </AccordionItem>
              <AccordionItem value="b" divider>
                <AccordionTrigger>Collectors</AccordionTrigger>
              </AccordionItem>
            </Accordion>
          </div>
        }
      />
    </GuidanceStory>
  ),
};
