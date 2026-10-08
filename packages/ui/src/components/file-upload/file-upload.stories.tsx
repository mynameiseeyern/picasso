import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { FileUpload, FileUploadItem } from "./file-upload";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
} from "../field/field";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof FileUpload> = {
  title: "Components/FileUpload",
  component: FileUpload,
  parameters: {
    docs: {
      description: {
        component:
          "Figma Input `Type=File upload` and File upload item (717:2086). The native file input stays in the page, " +
          "labelled by the whole field.",
      },
    },
  },
  args: { "aria-label": "Import endpoints", accept: ".csv" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
  },
  decorators: [
    (S) => (
      <div className="w-60">
        <S />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Default: Story = {};
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <FileUpload {...args} size="sm" />
      <FileUpload {...args} size="md" />
    </div>
  ),
};
export const Disabled: Story = { args: { disabled: true } };

export const WithFileRows: Story = {
  render: () => {
    const [files, setFiles] = React.useState<File[]>([]);
    return (
      <div className="flex flex-col gap-3">
        <Field>
          <FieldLabel>Endpoints</FieldLabel>
          <FieldControl>
            <FileUpload accept=".csv" multiple onFilesChange={setFiles} />
          </FieldControl>
          <FieldDescription>CSV, up to 10 MB.</FieldDescription>
        </Field>
        {files.map((f) => (
          <FileUploadItem
            key={f.name}
            name={f.name}
            size={f.size}
            onRemove={() => setFiles((xs) => xs.filter((x) => x !== f))}
          />
        ))}
      </div>
    );
  },
};

export const Item: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <FileUploadItem
        name="endpoints-export.csv"
        size={860160}
        progress={64}
        onRemove={() => {}}
      />
      <FileUploadItem
        name="probes-2026-09.csv"
        size={2_411_724}
        onRemove={() => {}}
      />
    </div>
  ),
};

const pair = pairOf(guidance);

/**
 * Narrow — 328, a 360 phone minus its gutters. A file name is as long as it
 * likes and does not shorten on a phone, so the item has to truncate rather
 * than push the dropzone wider than its box.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-82 flex-col gap-3 border border-line-neutral-muted p-3">
      <FileUpload aria-label="Import endpoints" accept=".csv" />
      <FileUploadItem
        name="endpoints-ap-southeast-2-2026-10-08-full-export.csv"
        size={248_000}
      />
    </div>
  ),
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("say-the-format")}
        width="wide"
        stage="tall"
        dont={
          <Field>
            <FieldLabel>Endpoint list</FieldLabel>
            <FieldControl>
              <FileUpload />
            </FieldControl>
          </Field>
        }
        do={
          <Field>
            <FieldLabel>Endpoint list</FieldLabel>
            <FieldControl>
              <FileUpload accept=".csv" />
            </FieldControl>
            <FieldDescription>CSV, up to 10 MB.</FieldDescription>
          </Field>
        }
      />

      <Guidance
        pair={pair("one-row-per-file")}
        width="wide"
        stage="tall"
        dont={
          <p className="text-body-sm text-content-neutral-muted">
            3 files selected
          </p>
        }
        do={
          <div className="w-full space-y-2">
            <FileUploadItem
              name="sydney.csv"
              size={18432}
              onRemove={() => {}}
            />
            <FileUploadItem name="london.csv" size={9216} onRemove={() => {}} />
          </div>
        }
      />

      <Guidance
        pair={pair("cancel-vs-remove")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full space-y-2">
            <FileUploadItem
              name="sydney.csv"
              size={18432}
              progress={42}
              removeLabel="Remove"
              onRemove={() => {}}
            />
            <FileUploadItem name="london.csv" size={9216} onRemove={() => {}} />
          </div>
        }
        do={
          <div className="w-full space-y-2">
            <FileUploadItem
              name="sydney.csv"
              size={18432}
              progress={42}
              onRemove={() => {}}
            />
            <FileUploadItem name="london.csv" size={9216} onRemove={() => {}} />
          </div>
        }
      />
    </GuidanceStory>
  ),
};
