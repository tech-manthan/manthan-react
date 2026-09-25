# @manthan/react

[Manthan UI](https://github.com/tech-manthan/manthan-base) for **React 19**: accessible components in **11 design styles** (glassmorphism, neumorphism, neo-brutalism, Material 3, Fluent 2, claymorphism, retro, neon, minimal, skeuomorphic…), styled with **Tailwind CSS v4**.

```bash
npm i @manthan/react @manthan/base @manthan/icons tailwindcss
```

```css
/* app.css */
@import 'tailwindcss';
@import '@manthan/react/theme.css';
```

```html
<html data-mn-style="glass" data-mn-theme="dark">
```

```tsx
import { Button, Dialog, Field, Input, Toaster, toast } from '@manthan/react';
import { Icon } from '@manthan/react';
import { Mail } from '@manthan/icons';

export function App() {
  return (
    <>
      <Field label="Email" error={error}>
        <Input type="email" startContent={<Icon icon={Mail} />} />
      </Field>
      <Dialog title="Delete project?" trigger={<Button tone="danger">Delete</Button>}>
        This cannot be undone.
      </Dialog>
      <Button onClick={() => toast.success('Saved')}>Save</Button>
      <Toaster />
    </>
  );
}
```

## Forms

```tsx
const form = useForm({
  initialValues: { email: '', terms: false },
  rules: { email: [rules.required(), rules.email()], terms: rules.required('Accept the terms.') },
  onSubmit: async (values) => save(values),
});

<form onSubmit={form.handleSubmit}>
  <Field label="Email" error={form.errors.email}><Input {...form.register('email')} /></Field>
  <Checkbox label="I agree" {...form.registerCheckbox('terms')} />
  <FileUpload name="avatar" accept="image/*" maxSize={2_000_000} />
  <Button type="submit" loading={form.submitting}>Save</Button>
</form>
```

## Components

| Group | Components |
| --- | --- |
| Actions | `Button` (`variant` solid · soft · surface · outline · ghost · link, `tone`, `size`, `loading`, `iconOnly`), `ButtonGroup` |
| Forms | `Field`, `Input` (`startContent` / `endContent`), `Textarea` (`resize="auto"`), `Select`, `Checkbox` (`indeterminate`), `RadioGroup` + `Radio`, `Switch`, `Slider` |
| Display | `Card` (+ `Header`, `Title`, `Description`, `Content`, `Footer`), `Badge`, `Avatar`, `AvatarGroup`, `Table` (+ parts), `Kbd`, `Separator`, `Heading`, `Icon` |
| Navigation | `Tabs` (+ `TabsList`, `TabsTrigger`, `TabsContent`), `Accordion` + `AccordionItem`, `Breadcrumb`, `Pagination` |
| Overlays | `Dialog` (`placement` for drawers, `DialogClose`, `useDialog`), `Popover`, `Menu` (+ `MenuItem`, `MenuLabel`, `MenuSeparator`), `Tooltip`, `Toaster` + `toast()` |
| Feedback | `Alert`, `Progress`, `ProgressCircle`, `Spinner`, `Skeleton` |
| Charts | `Chart` (line, area, bar, donut, sparkline: `type`, `data`, `x`, `series`, `stacked`, `horizontal`, `onHiddenChange`), `Stat` (value, delta, sentiment, `trend` sparkline) |
| Advanced | `FileUpload` (drag and drop, paste, type/size/count checks), `useForm`, `DataTable` (sort, search, selection, pagination, custom `cell` renderers), `Combobox` (filtering, groups), `Command` + `CommandDialog` (⌘K), `Calendar`, `DatePicker` (ISO `YYYY-MM-DD` values, `name` for forms), `ToggleGroup` + `ToggleGroupItem` |

Everything from `@manthan/base` is re-exported too: recipes (`button()`, `card()`… for styling your own elements), `toast`, `createToaster`, `designStyles`, `applyTheme`, `cx`.

### How it works

Components are thin: markup and state live here, while styling comes from the shared Tailwind recipes and behaviour from the framework-agnostic controllers in `@manthan/base/dom`. Overlays use the native `<dialog>` and Popover API, so focus trapping, the top layer, Escape and light-dismiss come from the browser. Every overlay supports both controlled (`open` / `onOpenChange`) and uncontrolled use. The build carries a `'use client'` banner for React Server Components.

## Development

Clone the Manthan repos side by side, then run `./scripts/bootstrap.sh` from `manthan-base`.

```bash
npm run dev        # playground (?style=neon&theme=dark)
npm test           # vitest + Testing Library
npm run typecheck
npm run build
```

## License

MIT
