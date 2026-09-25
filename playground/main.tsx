import './style.css';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Mail, Settings, Trash, User, LogOut } from '@manthan/icons';
import {
  Accordion,
  AccordionItem,
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Calendar,
  Checkbox,
  Combobox,
  CommandDialog,
  DatePicker,
  Dialog,
  DialogClose,
  designStyles,
  Field,
  Heading,
  Icon,
  Input,
  Menu,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  Pagination,
  Popover,
  Progress,
  ProgressCircle,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
  Toaster,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  type DesignStyle,
} from '../src/index';

function App() {
  const params = new URLSearchParams(location.search);
  const [style, setStyle] = useState<DesignStyle>((params.get('style') as DesignStyle) ?? 'default');
  const [dark, setDark] = useState(params.get('theme') === 'dark');
  const [volume, setVolume] = useState(40);
  document.documentElement.dataset.mnStyle = style;
  document.documentElement.dataset.mnTheme = dark ? 'dark' : 'light';

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
      <header className="flex flex-wrap items-center gap-3">
        <Heading level={1} size={3} className="me-auto">
          @manthan/react
        </Heading>
        <div className="w-44">
          <Select aria-label="Style" size="sm" value={style} onChange={(e) => setStyle(e.target.value as DesignStyle)}
            options={designStyles.map((s) => ({ value: s.id, label: s.label }))} />
        </div>
        <Switch label="Dark" checked={dark} onCheckedChange={setDark} />
      </header>

      <Breadcrumb items={[{ label: 'Home', href: '#' }, { label: 'Components', href: '#' }, { label: 'React' }]} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>Every control is a native element wired to the shared recipes.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field label="Email" description="We never share it." required>
              <Input type="email" placeholder="you@example.com" startContent={<Icon icon={Mail} />} />
            </Field>
            <Field label="Framework">
              <Select options={['React', 'Vue', 'Svelte', 'Angular']} />
            </Field>
            <RadioGroup defaultValue="pro" orientation="horizontal">
              <Radio value="hobby" label="Hobby" />
              <Radio value="pro" label="Pro" />
              <Radio value="team" label="Team" />
            </RadioGroup>
            <Checkbox label="I agree to the terms" defaultChecked />
            <Field label={`Volume: ${volume}`}>
              <Slider value={volume} onValueChange={setVolume} />
            </Field>
          </CardContent>
          <CardFooter>
            <Button onClick={() => toast.success({ title: 'Account created', description: 'Welcome aboard!' })}>
              Sign up <Icon icon={ArrowRight} />
            </Button>
            <Button variant="ghost" tone="neutral">Cancel</Button>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <div className="flex flex-wrap items-center gap-3">
              <Dialog
                title="Delete project?"
                description="This permanently deletes the project and its 42 deployments."
                trigger={<Button tone="danger" variant="soft"><Icon icon={Trash} /> Delete</Button>}
                footer={
                  <>
                    <DialogClose><Button variant="surface" tone="neutral">Cancel</Button></DialogClose>
                    <DialogClose><Button tone="danger" onClick={() => toast.error('Project deleted')}>Delete</Button></DialogClose>
                  </>
                }
              />
              <Menu trigger={<Button variant="surface" tone="neutral"><Icon icon={User} /> Account</Button>}>
                <MenuLabel>ada@example.com</MenuLabel>
                <MenuItem icon={<Icon icon={User} />} shortcut="⇧⌘P">Profile</MenuItem>
                <MenuItem icon={<Icon icon={Settings} />} onSelect={() => toast.info('Settings')}>Settings</MenuItem>
                <MenuSeparator />
                <MenuItem tone="danger" icon={<Icon icon={LogOut} />}>Log out</MenuItem>
              </Menu>
              <Popover trigger={<Button variant="outline">Popover</Button>} title="Dimensions" description="Anchored with flip & shift.">
                <Input size="sm" defaultValue="100%" aria-label="Width" className="mt-3" />
              </Popover>
              <Tooltip content="Settings">
                <Button iconOnly variant="ghost" aria-label="Settings"><Icon icon={Settings} /></Button>
              </Tooltip>
            </div>
          </Card>
          <Tabs defaultValue="overview" variant="segmented">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="flex items-center gap-4">
              <ProgressCircle value={72} size="lg" tone="success" />
              <div className="flex flex-1 flex-col gap-2"><Progress value={volume} /><Progress indeterminate tone="info" size="sm" /></div>
            </TabsContent>
            <TabsContent value="analytics">Analytics panel</TabsContent>
            <TabsContent value="settings">Settings panel</TabsContent>
          </Tabs>
          <Alert tone="success" title="Deployed">Your site is live at manthan.dev</Alert>
          <div className="flex items-center gap-2">
            <Avatar alt="Grace Hopper" /> <Avatar alt="Alan Turing" tone="success" /> <Badge>New</Badge> <Badge variant="solid" tone="warning">Beta</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <Field label="Framework">
            <Combobox
              placeholder="Search frameworks…"
              options={[
                { value: 'react', label: 'React', group: 'UI' },
                { value: 'vue', label: 'Vue', group: 'UI' },
                { value: 'svelte', label: 'Svelte', group: 'UI' },
                { value: 'angular', label: 'Angular', group: 'UI' },
                { value: 'next', label: 'Next.js', group: 'Meta' },
                { value: 'astro', label: 'Astro', group: 'Meta' },
              ]}
            />
          </Field>
          <Field label="Due date">
            <DatePicker name="due" />
          </Field>
          <ToggleGroup defaultValue="week" aria-label="Range">
            <ToggleGroupItem value="day">Day</ToggleGroupItem>
            <ToggleGroupItem value="week">Week</ToggleGroupItem>
            <ToggleGroupItem value="month">Month</ToggleGroupItem>
          </ToggleGroup>
          <p className="text-sm text-fg-muted">Press Ctrl/⌘ K for the command palette.</p>
        </Card>
        <Card>
          <Calendar defaultValue="2026-09-28" />
        </Card>
      </div>
      <CommandDialog
        options={[
          { value: 'profile', label: 'Profile', group: 'Settings', shortcut: 'mod+p' },
          { value: 'billing', label: 'Billing', group: 'Settings' },
          { value: 'glass', label: 'Switch to Glassmorphism', group: 'Styles' },
        ]}
        onSelect={(v) => (v === 'glass' ? setStyle('glass') : toast.info(v))}
      />
      <Accordion>
        <AccordionItem title="Is it accessible?" defaultOpen>Yes: native elements and WAI-ARIA patterns.</AccordionItem>
        <AccordionItem title="Can I theme it?">Eleven styles plus your own tokens.</AccordionItem>
      </Accordion>
      <Pagination total={12} defaultPage={4} />
      <Toaster />
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
