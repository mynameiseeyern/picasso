import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUpload, FileUploadItem, formatBytes } from "./file-upload";

describe("FileUpload", () => {
  it("keeps the native file input, labelled by the whole field", async () => {
    const onFilesChange = vi.fn();
    render(<FileUpload aria-label="Import endpoints" accept=".csv" onFilesChange={onFilesChange} />);
    const input = screen.getByLabelText("Import endpoints");
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveClass("sr-only");
    expect(input.closest("label")).toHaveTextContent("No file chosen");
    const file = new File(["a,b"], "endpoints-export.csv", { type: "text/csv" });
    await userEvent.upload(input, file);
    expect(onFilesChange).toHaveBeenCalledWith([file]);
    expect(input.closest("label")).toHaveTextContent("endpoints-export.csv");
  });
});

describe("FileUploadItem", () => {
  it("shows name, size and an announced progress bar, and names its remove button", () => {
    render(<FileUploadItem name="endpoints-export.csv" size={860160} progress={64} onRemove={() => {}} />);
    expect(screen.getByText("840 KB")).toBeInTheDocument();
    const bar = screen.getByRole("progressbar", { name: "Uploading endpoints-export.csv" });
    expect(bar).toHaveAttribute("aria-valuenow", "64");
    expect(screen.getByRole("button", { name: "Cancel endpoints-export.csv" })).toBeInTheDocument();
  });

  it("says Remove once the upload is done", () => {
    render(<FileUploadItem name="a.csv" onRemove={() => {}} />);
    expect(screen.getByRole("button", { name: "Remove a.csv" })).toBeInTheDocument();
  });
});

describe("formatBytes", () => {
  it("uses binary units", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(860160)).toBe("840 KB");
    expect(formatBytes(1.5 * 1024 * 1024)).toBe("1.5 MB");
  });
}

  it("draws the browse button at one size, as Figma does", () => {
    const { rerender } = render(<FileUpload aria-label="File" />);
    // Figma draws it 63x28 with 10px padding at BOTH sizes. Mapping md to
    // Button size="sm" made it 32 tall, leaving 1px of clearance in a 36 box.
    const browse = () => screen.getByText("Browse");
    expect(browse().className).toContain("h-7");
    rerender(<FileUpload aria-label="File" size="sm" />);
    expect(browse().className).toContain("h-7");
  });
});
