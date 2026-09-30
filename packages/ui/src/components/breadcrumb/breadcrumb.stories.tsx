import type { Meta, StoryObj } from "@storybook/react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbTrigger,
} from "./breadcrumb";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  parameters: {
    docs: {
      description: {
        component:
          "Where the current page sits in the hierarchy. Every level but the " +
          "last is a link; the last is the page you are on. Collapse the " +
          "middle past four levels. md for page headers, sm for dense " +
          "contexts — sm tightens the gaps, it does not shrink the type.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["md", "sm"] },
  },
  args: { size: "md" },
};
const pair = pairOf(guidance);

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  render: (args) => (
    <Breadcrumb size={args.size}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Fleet</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Sydney</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>probe-04</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

/** Past four levels, the middle collapses. The ellipsis keeps a name for screen readers. */
export const Collapsed: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Fleet</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Sydney</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>probe-04</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

/** A crumb that opens its siblings — hand it to a DropdownMenuTrigger with `asChild`. */
export const WithDropdown: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Fleet</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbTrigger>Sydney</BreadcrumbTrigger>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>probe-04</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

/** sm sits in a top bar or a drawer. Same 14px type, tighter gaps. */
export const Small: Story = {
  render: () => (
    <Breadcrumb size="sm">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Fleet</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Sydney</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>probe-04</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("last-is-not-a-link")}
        width="wide"
        dont={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#m">Monitoring</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#s">Sydney-01</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        do={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#m">Monitoring</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>Sydney-01</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />

      <Guidance
        pair={pair("not-a-history-trail")}
        width="wide"
        dont={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#d">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#se">Search</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#f">Filtered results</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>Sydney-01</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        do={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#m">Monitoring</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#e">Endpoints</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>Sydney-01</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />

      <Guidance
        pair={pair("collapse-the-middle")}
        width="wide"
        stage="tall"
        dont={
          <Breadcrumb>
            <BreadcrumbList>
              {[
                "Monitoring",
                "Regions",
                "AU-East",
                "Sites",
                "Sydney",
                "Racks",
              ].map((c) => (
                <BreadcrumbItem key={c}>
                  <BreadcrumbLink href="#x">{c}</BreadcrumbLink>
                </BreadcrumbItem>
              ))}
              <BreadcrumbItem>
                <BreadcrumbPage>Sydney-01</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        do={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#m">Monitoring</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbEllipsis />
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#r">Racks</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>Sydney-01</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />
    </GuidanceStory>
  ),
};
