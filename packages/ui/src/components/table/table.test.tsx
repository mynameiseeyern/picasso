import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import {
  Table, TableBody, TableCaption, TableCell, TableCol, TableColGroup,
  TableFooter, TableHead, TableHeader, TableRow,
} from "./table";

const Demo = (props: React.ComponentProps<typeof Table>) => (
  <Table aria-label="Trunks" {...props}>
    <TableHeader>
      <TableRow>
        <TableHead>Trunk</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Sydney trunk 01</TableCell>
        <TableCell>Healthy</TableCell>
      </TableRow>
      <TableRow selected>
        <TableCell>Melbourne trunk 02</TableCell>
        <TableCell>Warning</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

describe("Table", () => {
  it("is a real table, so it is announced as one", () => {
    render(<Demo />);
    const table = screen.getByRole("table", { name: "Trunks" });
    expect(within(table).getAllByRole("row")).toHaveLength(3);
    expect(within(table).getAllByRole("columnheader")).toHaveLength(2);
    expect(within(table).getAllByRole("cell")).toHaveLength(4);
  });

  it("scopes its column headers", () => {
    render(<Demo />);
    // Without scope="col" a screen reader has to guess whether a th heads a
    // column or a row, and it announces the wrong one on every cell.
    for (const th of screen.getAllByRole("columnheader")) {
      expect(th).toHaveAttribute("scope", "col");
    }
  });

  it("holds the header at 40 and moves only the body rows", () => {
    const { rerender } = render(<Demo size="md" />);
    const head = () => screen.getAllByRole("columnheader")[0];
    const cell = () => screen.getAllByRole("cell")[0];
    expect(head()).toHaveClass("h-10");
    expect(cell()).toHaveClass("h-15", "px-4", "text-body-md");
    rerender(<Demo size="sm" />);
    // Figma keeps the header at 40 in both sizes; only the rows compress.
    expect(head()).toHaveClass("h-10");
    expect(cell()).toHaveClass("h-13", "px-3", "text-body-sm");
  });

  it("puts selection on the row, not on the checkbox inside it", () => {
    render(<Demo />);
    const rows = screen.getAllByRole("row");
    const selected = rows.find((r) => r.getAttribute("data-state") === "selected");
    expect(selected).toHaveAttribute("aria-selected", "true");
    expect(selected?.className).toContain("data-[state=selected]:bg-surface-selected-subtle");
    // and the unselected rows say nothing rather than aria-selected="false",
    // which would announce every row as selectable.
    expect(rows[1]).not.toHaveAttribute("aria-selected");
  });

  it("carries the size to cells wherever they sit", () => {
    render(
      <Table size="sm">
        <TableBody>
          <TableRow>
            <TableCell data-testid="c">Nested through context</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId("c")).toHaveClass("h-13");
  });

  it("can scroll sideways without breaking its card", () => {
    render(<Demo />);
    const container = screen.getByRole("table").parentElement;
    // A table that cannot scroll either overflows its card or collapses its
    // columns. The container is part of the component so this is not
    // something each consumer has to remember.
    expect(container).toHaveAttribute("data-slot", "table-container");
    expect(container).toHaveClass("overflow-x-auto");
  });

  it("sets a column's width once, for every cell in it", () => {
    render(
      <Table>
        <TableColGroup>
          <TableCol className="w-12" />
          <TableCol />
        </TableColGroup>
        <TableBody>
          <TableRow>
            <TableCell>tick</TableCell>
            <TableCell>Sydney</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    // Figma v2's column owns its width; <col> is the only HTML element that
    // does the same, so widths live there rather than on the first row.
    const cols = document.querySelectorAll("[data-slot=table-col]");
    expect(cols).toHaveLength(2);
    expect(cols[0]).toHaveClass("w-12");
    expect(cols[0].tagName).toBe("COL");
  });

  it("supports a caption and a totals foot", () => {
    render(
      <Table>
        <TableCaption>Trunks reporting in the last hour</TableCaption>
        <TableBody>
          <TableRow><TableCell>Sydney</TableCell></TableRow>
        </TableBody>
        <TableFooter data-testid="f">
          <TableRow><TableCell>Total</TableCell></TableRow>
        </TableFooter>
      </Table>,
    );
    // The caption names the table for assistive tech without needing a label.
    expect(screen.getByText("Trunks reporting in the last hour").tagName).toBe("CAPTION");
    expect(screen.getByTestId("f").tagName).toBe("TFOOT");
  });
});
