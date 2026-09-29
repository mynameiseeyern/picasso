import type { Meta, StoryObj } from "@storybook/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

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
