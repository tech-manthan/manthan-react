import { createContext, useContext, useEffect, useId, useRef, type ComponentProps, type ReactNode } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from '@manthan/icons';
import { accordion, breadcrumb, getPaginationItems, pagination, tabs } from '@manthan/base';
import { createTabs } from '@manthan/base/dom';
import { Icon } from './icon';
import { useControllableState } from '../utils';

// ── Tabs ──

interface TabsContextValue {
  value?: string;
  setValue: (value: string) => void;
  baseId: string;
  slots: ReturnType<typeof tabs>;
  orientation: 'horizontal' | 'vertical';
  activation: 'automatic' | 'manual';
}
const TabsContext = createContext<TabsContextValue | null>(null);
const useTabs = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used inside <Tabs>');
  return ctx;
};

export interface TabsProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'dir'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: 'line' | 'pills' | 'segmented';
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  /** `automatic` selects on focus, `manual` on Enter/Space. @default 'automatic' */
  activation?: 'automatic' | 'manual';
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  variant,
  orientation = 'horizontal',
  size,
  activation = 'automatic',
  className,
  ...props
}: TabsProps) {
  const [current, setValue] = useControllableState(value, defaultValue, onValueChange as (v: string | undefined) => void);
  const slots = tabs({ variant, orientation, size });
  return (
    <TabsContext.Provider value={{ value: current, setValue, baseId: useId(), slots, orientation, activation }}>
      <div className={slots.root(className)} data-orientation={orientation} {...props} />
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: ComponentProps<'div'>) {
  const { slots, orientation, activation } = useTabs();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => createTabs(ref.current!, { orientation, activation }).destroy, [orientation, activation]);
  return <div ref={ref} role="tablist" aria-orientation={orientation} className={slots.list(className)} {...props} />;
}

export interface TabsTriggerProps extends ComponentProps<'button'> {
  value: string;
}
export function TabsTrigger({ value, className, onClick, ...props }: TabsTriggerProps) {
  const ctx = useTabs();
  const selected = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${ctx.baseId}-tab-${value}`}
      aria-controls={`${ctx.baseId}-panel-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      className={ctx.slots.trigger(className)}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx.setValue(value);
      }}
      {...props}
    />
  );
}

export interface TabsContentProps extends ComponentProps<'div'> {
  value: string;
}
export function TabsContent({ value, className, ...props }: TabsContentProps) {
  const ctx = useTabs();
  return (
    <div
      role="tabpanel"
      id={`${ctx.baseId}-panel-${value}`}
      aria-labelledby={`${ctx.baseId}-tab-${value}`}
      hidden={ctx.value !== value}
      tabIndex={0}
      className={ctx.slots.panel(className)}
      {...props}
    />
  );
}

// ── Accordion (native <details>) ──

interface AccordionContextValue {
  slots: ReturnType<typeof accordion>;
  name?: string;
}
const AccordionContext = createContext<AccordionContextValue>({ slots: accordion() });

export interface AccordionProps extends ComponentProps<'div'> {
  /** `single` keeps at most one item open (uses `<details name>`). @default 'single' */
  type?: 'single' | 'multiple';
  variant?: 'plain' | 'contained' | 'separated';
}
export function Accordion({ type = 'single', variant, className, ...props }: AccordionProps) {
  const slots = accordion({ variant });
  const name = `accordion-${useId()}`;
  return (
    <AccordionContext.Provider value={{ slots, name: type === 'single' ? name : undefined }}>
      <div className={slots.root(className)} {...props} />
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends Omit<ComponentProps<'details'>, 'title' | 'open'> {
  title: ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export function AccordionItem({ title, defaultOpen, onOpenChange, onToggle, className, children, ...props }: AccordionItemProps) {
  const { slots, name } = useContext(AccordionContext);
  return (
    <details
      name={name}
      open={defaultOpen}
      className={slots.item(className)}
      onToggle={(e) => {
        onToggle?.(e);
        onOpenChange?.(e.currentTarget.open);
      }}
      {...props}
    >
      <summary className={slots.trigger()}>
        {title}
        <Icon icon={ChevronDown} className={slots.icon()} />
      </summary>
      <div className={slots.content()}>{children}</div>
    </details>
  );
}

// ── Breadcrumb ──

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
}
export interface BreadcrumbProps extends ComponentProps<'nav'> {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}
export function Breadcrumb({ items, separator, className, ...props }: BreadcrumbProps) {
  const s = breadcrumb();
  return (
    <nav aria-label="Breadcrumb" className={s.root(className)} {...props}>
      <ol className={s.list()}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className={s.item()}>
              {last || !item.href ? (
                <span aria-current={last ? 'page' : undefined} className={last ? s.page() : undefined}>
                  {item.label}
                </span>
              ) : (
                <a href={item.href} className={s.link()}>
                  {item.label}
                </a>
              )}
              {!last && (
                <span role="presentation" aria-hidden className={s.separator()}>
                  {separator ?? <Icon icon={ChevronRight} />}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ── Pagination ──

export interface PaginationProps extends Omit<ComponentProps<'nav'>, 'onChange'> {
  total: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  siblings?: number;
  boundaries?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline';
  /** Accessible label for page buttons. */
  getPageLabel?: (page: number) => string;
}
export function Pagination({
  total,
  page,
  defaultPage = 1,
  onPageChange,
  siblings,
  boundaries,
  size,
  variant,
  getPageLabel = (p) => `Page ${p}`,
  className,
  ...props
}: PaginationProps) {
  const [current, setPage] = useControllableState(page, defaultPage, onPageChange);
  const s = pagination({ size, variant });
  const items = getPaginationItems({ page: current, total, siblings, boundaries });
  return (
    <nav aria-label="Pagination" className={s.root(className)} {...props}>
      <ul className={s.list()}>
        <li>
          <button type="button" className={s.item()} disabled={current <= 1} aria-label="Previous page" onClick={() => setPage(current - 1)}>
            <Icon icon={ChevronLeft} />
          </button>
        </li>
        {items.map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                className={s.item()}
                aria-current={item === current ? 'page' : undefined}
                aria-label={getPageLabel(item)}
                onClick={() => setPage(item)}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className={s.ellipsis()} aria-hidden>
              <Icon icon={MoreHorizontal} size={16} />
            </li>
          ),
        )}
        <li>
          <button type="button" className={s.item()} disabled={current >= total} aria-label="Next page" onClick={() => setPage(current + 1)}>
            <Icon icon={ChevronRight} />
          </button>
        </li>
      </ul>
    </nav>
  );
}
