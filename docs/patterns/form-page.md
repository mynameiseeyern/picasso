---
title: Form page
description: A page whose job is to be filled in and submitted — create a tenant, change a setting, provision a product.
---

# Form page

A page whose job is to be filled in and submitted. Create a tenant, provision
a product, change notification settings.

A form inside a dialog or a drawer is not this pattern — those have their own
footers. This is for a form that is the whole page.

## The shape

1. **`AppShellContent width="reading"`** — the column caps at 768, left-aligned
   to the rail.
2. **`PageHeader`** — the page's only `h1`, an optional description, a rule.
3. **Fields**, each in a `Field`, stacked with the page gutter between them.
4. **`PageFooter`** — a rule, then the actions at the inline end, primary last.

```tsx
import {
  AppShellContent, Button, Field, FieldControl, FieldDescription,
  FieldLabel, Input, PageFooter, PageHeader,
} from "@ir/ui";

<AppShellContent width="reading">
  <div className="flex flex-col gap-gutter">
    <PageHeader
      title="Create tenant"
      description="A tenant is one customer's isolated slice of Clarion."
    />

    <div className="grid gap-gutter @xl:grid-cols-2">
      <Field>
        <FieldLabel required>First name</FieldLabel>
        <FieldControl required><Input /></FieldControl>
      </Field>
      <Field>
        <FieldLabel required>Last name</FieldLabel>
        <FieldControl required><Input /></FieldControl>
      </Field>
    </div>

    <Field>
      <FieldLabel required>Tenant name</FieldLabel>
      <FieldControl required><Input /></FieldControl>
      <FieldDescription>Letters, digits and hyphens.</FieldDescription>
    </Field>

    <PageFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Create tenant</Button>
    </PageFooter>
  </div>
</AppShellContent>
```

## The rules

**The width goes on the page, not on the form.** With `width="reading"`, the
header rule, the fields and the footer rule all start and end on the same two
edges at every width. Cap only the form inside a fluid page and the header
rule runs the full width over a 768 footer rule, which reads as a T.

**768, not a number of your own.** A form column narrower or wider than
`reading` is a fourth width every page author then has to choose between with
no rule to decide it. If a form genuinely needs a different width, raise it.

**The title comes from `PageHeader`.** It is `heading/xl`, the page-title step,
and the lint rule `picasso/no-raw-page-title` refuses a hand-written `<h1>`.

**Two fields side by side sit a gutter apart.** `gap-gutter`, the same gap as
every other grid on the page. Closer than that and a First name / Last name
pair reads as one control. The pair is a container query (`@xl:`), so it
answers to the column, not the window.

**Every input is in a `Field`.** The label, hint and error are wired to the
control by the component. When a field is invalid, `invalid` on the `Field`
swaps the hint for a `FieldError` — see [Errors](../content/errors.md) for what
the message says.

**Primary last, paired with outline or secondary.** Cancel first, the primary
at the inline end — the same order as Dialog, Drawer and Card, so Save is in
the same place everywhere. Never a ghost Cancel: it reads as optional. The
primary's label names the outcome — *Create tenant*, not *Submit*.

**The footer ends where the form ends.** `PageFooter` sits inside the column,
so on a 2560 monitor the submit is still a bounded distance from the last
field.

## At 360

The rail collapses, the column is 328 wide, side-by-side fields stack, and two
buttons still fit on one row. If a third button arrives or a label is long,
the row wraps and the primary stays last.

## Not covered yet

**Long forms.** `PageFooter` does not stick. If a form is long enough that its
actions end up screens below the first field, raise it in the Design System
forum before building a sticky bar or splitting it into steps — there is no
rule for it yet.

**A form page that needs more than its fields** — tabs across the top, a
table of existing records under the form, a side-by-side preview. The cap
then moves off the page and onto the form. Raise it before building.

## Related

- [App shell](../components/app-shell.md) — the three width modes
- [Page header](../components/page-header.md) · [Page footer](../components/page-footer.md) · [Field](../components/field.md)
- [Definition of done](definition-of-done.md)
