import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, ChevronsUpDown, Search } from '@manthan/icons';
import {
  addMonths,
  calendar,
  clampToEnabled,
  combobox,
  command,
  commandDialog,
  compareISO,
  datePicker,
  filterOptions,
  formatDate,
  formatHotkey,
  formatMonthYear,
  getCalendarKeyTarget,
  getCalendarWeeks,
  getWeekdayNames,
  getWeekStart,
  groupOptions,
  input as inputRecipe,
  isDateDisabled,
  normalizeOption,
  startOfMonth,
  todayISO,
  toggleGroup,
  type ISODate,
  type ListOption,
  type OptionInput,
  type Placement,
  type Tone,
} from '@manthan/base';
import {
  createCombobox,
  createDialog,
  createPopover,
  createRovingFocus,
  onHotkey,
  type ComboboxController,
  type DialogController,
  type PopoverController,
} from '@manthan/base/dom';
import { Icon } from './icon';
import { useField } from './form';
import { useControllableState, useLatest } from '../utils';

// ── Combobox ──

export interface ComboboxProps extends Omit<ComponentProps<'input'>, 'value' | 'defaultValue' | 'size' | 'onChange'> {
  options: OptionInput[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  /** Shown when nothing matches. @default 'No results' */
  emptyText?: ReactNode;
  /** Open the list on focus. @default true */
  openOnFocus?: boolean;
  placement?: Placement;
}

export function Combobox({
  options,
  value,
  defaultValue = null,
  onValueChange,
  size,
  emptyText = 'No results',
  openOnFocus = true,
  placement,
  className,
  id,
  disabled,
  ...props
}: ComboboxProps) {
  const field = useField();
  const s = combobox();
  const normalized = useMemo(() => options.map(normalizeOption), [options]);
  const [selected, setSelected] = useControllableState<string | null>(value, defaultValue, onValueChange);
  const selectedLabel = normalized.find((o) => o.value === selected)?.label ?? '';
  const [query, setQuery] = useState<string | null>(null); // null = not typing
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const controller = useRef<ComboboxController>(null);
  const onSelectRef = useLatest((next: string) => {
    setSelected(next);
    setQuery(null);
  });

  useEffect(() => {
    const ctl = createCombobox({
      input: inputRef.current!,
      listbox: listRef.current!,
      anchor: rootRef.current!,
      openOnFocus,
      placement,
      onSelect: (v) => onSelectRef.current(v),
      onOpenChange: (open) => !open && setQuery(null),
    });
    controller.current = ctl;
    return ctl.destroy;
  }, [openOnFocus, placement, onSelectRef]);

  const visible = query ? filterOptions(normalized, query) : normalized;
  return (
    <div ref={rootRef} className={s.root(className)}>
      <input
        ref={inputRef}
        id={id ?? field?.id}
        disabled={disabled ?? field?.disabled}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        className={inputRecipe({ size, withEnd: true })}
        value={query ?? selectedLabel}
        onChange={(e) => setQuery(e.target.value)}
        {...props}
      />
      <span className={s.trigger('pointer-events-none')} aria-hidden>
        <Icon icon={ChevronsUpDown} />
      </span>
      <div ref={listRef} id={listId} popover="manual" className={s.listbox()}>
        {groupOptions(visible).map(({ group, options: items }) => (
          <div key={group} role={group ? 'group' : undefined} aria-label={group || undefined} className={s.group()}>
            {group && <div className={s.groupLabel()} aria-hidden>{group}</div>}
            {items.map((o) => (
              <div
                key={o.value}
                role="option"
                data-value={o.value}
                aria-selected={o.value === selected}
                aria-disabled={o.disabled || undefined}
                className={s.option()}
              >
                {o.label}
                <Icon icon={Check} className={s.check()} />
              </div>
            ))}
          </div>
        ))}
        {visible.length === 0 && <div className={s.empty()}>{emptyText}</div>}
      </div>
    </div>
  );
}

// ── Command palette ──

export interface CommandProps extends Omit<ComponentProps<'div'>, 'onSelect'> {
  options: Array<ListOption & { icon?: ReactNode }>;
  onSelect?: (value: string) => void;
  placeholder?: string;
  emptyText?: ReactNode;
  /** Keyboard hints under the list. @default true */
  footer?: boolean;
  autoFocus?: boolean;
}

export function Command({ options, onSelect, placeholder = 'Type a command or search…', emptyText = 'No results found.', footer = true, autoFocus, className, ...props }: CommandProps) {
  const s = command();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useLatest(onSelect);
  useEffect(
    () =>
      createCombobox({ input: inputRef.current!, listbox: listRef.current!, inline: true, onSelect: (v) => onSelectRef.current?.(v) }).destroy,
    [onSelectRef],
  );
  const visible = filterOptions(options, query);
  return (
    <div className={s.root(className)} {...props}>
      <div className={s.inputWrap()}>
        <Icon icon={Search} />
        <input ref={inputRef} autoFocus={autoFocus} aria-label={placeholder} placeholder={placeholder} className={s.input()} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div ref={listRef} className={s.list()}>
        {groupOptions(visible).map(({ group, options: items }) => (
          <div key={group} role={group ? 'group' : undefined} aria-label={group || undefined}>
            {group && <div className={s.groupLabel()} aria-hidden>{group}</div>}
            {items.map((o) => (
              <div key={o.value} role="option" data-value={o.value} aria-disabled={o.disabled || undefined} className={s.item()}>
                {o.icon}
                <span className="flex min-w-0 flex-col">
                  {o.label}
                  {o.description && <span className={s.itemDescription()}>{o.description}</span>}
                </span>
                {o.shortcut && <span className={s.shortcut()}>{formatHotkey(o.shortcut)}</span>}
              </div>
            ))}
          </div>
        ))}
        {visible.length === 0 && <div className={s.empty()}>{emptyText}</div>}
      </div>
      {footer && (
        <div className={s.footer()}>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      )}
    </div>
  );
}

export interface CommandDialogProps extends CommandProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Global shortcut that opens the palette; `false` disables it. @default 'mod+k' */
  hotkey?: string | false;
}

export function CommandDialog({ open, defaultOpen = false, onOpenChange, hotkey = 'mod+k', onSelect, ...props }: CommandDialogProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const ref = useRef<HTMLDialogElement>(null);
  const controller = useRef<DialogController>(null);
  const setOpenRef = useLatest(setOpen);
  const [session, setSession] = useState(0);
  useEffect(() => {
    const ctl = createDialog(ref.current!, {
      onOpenChange: (o) => {
        setOpenRef.current(o);
        if (!o) setTimeout(() => setSession((n) => n + 1), 200);
      },
    });
    controller.current = ctl;
    return ctl.destroy;
  }, [setOpenRef]);
  useEffect(() => (hotkey ? onHotkey(hotkey, () => setOpenRef.current(true)) : undefined), [hotkey, setOpenRef]);
  useEffect(() => {
    if (isOpen) controller.current?.open();
    else controller.current?.close();
  }, [isOpen]);
  return (
    <dialog ref={ref} aria-label="Command palette" className={commandDialog()}>
      <Command
        key={session}
        onSelect={(v) => {
          setOpen(false);
          onSelect?.(v);
        }}
        {...props}
      />
    </dialog>
  );
}

// ── Calendar ──

export interface CalendarProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  value?: ISODate | null;
  defaultValue?: ISODate | null;
  onValueChange?: (value: ISODate) => void;
  min?: ISODate;
  max?: ISODate;
  isDateDisabled?: (date: ISODate) => boolean;
  locale?: string;
  /** 0 = Sunday … 6 = Saturday. Defaults to the locale's convention. */
  weekStartsOn?: number;
  size?: 'sm' | 'md' | 'lg';
  tone?: Tone;
  /** Focus the selected (or today's) day on mount. */
  autoFocus?: boolean;
}

export function Calendar({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  isDateDisabled: isDisabled,
  locale,
  weekStartsOn,
  size,
  tone,
  autoFocus,
  className,
  ...props
}: CalendarProps) {
  const [selected, setSelected] = useControllableState<ISODate | null>(value, defaultValue, onValueChange as (v: ISODate | null) => void);
  const constraints = { min, max, isDateDisabled: isDisabled };
  const [focused, setFocused] = useState<ISODate>(() => selected ?? clampToEnabled(todayISO(), 1, constraints) ?? todayISO());
  const [month, setMonth] = useState(() => startOfMonth(focused));
  const [focusRequest, setFocusRequest] = useState(!!autoFocus);
  const grid = useRef<HTMLTableElement>(null);
  const weekStart = weekStartsOn ?? getWeekStart(locale);
  const s = calendar({ size, tone });
  const weeks = getCalendarWeeks(month, { weekStartsOn: weekStart });
  const weekdays = getWeekdayNames({ locale, weekStartsOn: weekStart, format: 'narrow' });

  useEffect(() => {
    if (selected) {
      setFocused(selected);
      setMonth(startOfMonth(selected));
    }
  }, [selected]);
  useEffect(() => {
    if (!focusRequest) return;
    grid.current?.querySelector<HTMLElement>(`[data-date="${focused}"]`)?.focus();
    setFocusRequest(false);
  }, [focusRequest, focused]);

  const goMonth = (delta: number) => {
    const next = addMonths(month, delta);
    setMonth(next);
    setFocused(next);
  };
  const onKeyDown = (event: ReactKeyboardEvent) => {
    const date = (event.target as HTMLElement).dataset.date;
    if (!date) return;
    const target = getCalendarKeyTarget(event.key, date, { weekStartsOn: weekStart, shiftKey: event.shiftKey, dir: getComputedStyle(event.currentTarget).direction === 'rtl' ? 'rtl' : 'ltr' });
    if (!target) return;
    event.preventDefault();
    const next = clampToEnabled(target, compareISO(target, date) >= 0 ? 1 : -1, constraints) ?? date;
    setFocused(next);
    setMonth(startOfMonth(next));
    setFocusRequest(true);
  };
  const prevDisabled = !!min && compareISO(month, startOfMonth(min)) <= 0;
  const nextDisabled = !!max && compareISO(addMonths(month, 1), max) > 0;

  return (
    <div className={s.root(className)} {...props}>
      <div className={s.header()}>
        <button type="button" className={s.nav()} aria-label="Previous month" disabled={prevDisabled} onClick={() => goMonth(-1)}>
          <Icon icon={ChevronLeft} />
        </button>
        <div className={s.title()} aria-live="polite">
          {formatMonthYear(month, locale)}
        </div>
        <button type="button" className={s.nav()} aria-label="Next month" disabled={nextDisabled} onClick={() => goMonth(1)}>
          <Icon icon={ChevronRight} />
        </button>
      </div>
      <table ref={grid} role="grid" aria-label={formatMonthYear(month, locale)} className={s.grid()} onKeyDown={onKeyDown}>
        <thead>
          <tr>
            {weekdays.map((w) => (
              <th key={w.long} scope="col" abbr={w.long} className={s.weekday()}>
                {w.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]!.date}>
              {week.map((day) => (
                <td key={day.date} className={s.cell()} aria-selected={day.date === selected || undefined}>
                  <button
                    type="button"
                    data-date={day.date}
                    data-outside={day.inMonth ? undefined : ''}
                    data-today={day.isToday ? '' : undefined}
                    aria-current={day.isToday ? 'date' : undefined}
                    data-selected={day.date === selected ? '' : undefined}
                    aria-label={formatDate(day.date, locale, { dateStyle: 'full' })}
                    tabIndex={day.date === focused ? 0 : -1}
                    disabled={isDateDisabled(day.date, constraints)}
                    className={s.day()}
                    onClick={() => {
                      setSelected(day.date);
                      setFocused(day.date);
                    }}
                  >
                    {day.day}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Date picker ──

export interface DatePickerProps extends Omit<CalendarProps, 'autoFocus' | 'className'> {
  placeholder?: string;
  /** Form field name; a hidden input carries the ISO value. */
  name?: string;
  disabled?: boolean;
  format?: Intl.DateTimeFormatOptions;
  placement?: Placement;
  className?: string;
  id?: string;
}

export function DatePicker({
  value,
  defaultValue = null,
  onValueChange,
  placeholder = 'Pick a date',
  name,
  disabled,
  format,
  placement = 'bottom-start',
  size,
  locale,
  className,
  id,
  ...calendarProps
}: DatePickerProps) {
  const field = useField();
  const [selected, setSelected] = useControllableState<ISODate | null>(value, defaultValue, onValueChange as (v: ISODate | null) => void);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const controller = useRef<PopoverController>(null);
  const s = datePicker({ size });
  useEffect(() => {
    const ctl = createPopover({ trigger: triggerRef.current!, content: contentRef.current!, placement, autoFocus: false, onOpenChange: setOpen });
    controller.current = ctl;
    return ctl.destroy;
  }, [placement]);
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id ?? field?.id}
        disabled={disabled ?? field?.disabled}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        className={s.trigger(className)}
      >
        <Icon icon={CalendarIcon} />
        <span className={selected ? s.value() : s.placeholder()}>{selected ? formatDate(selected, locale, format) : placeholder}</span>
      </button>
      <div ref={contentRef} popover="auto" aria-label="Choose date" className={s.content()}>
        {open && (
          <Calendar
            autoFocus
            locale={locale}
            value={selected}
            onValueChange={(v) => {
              setSelected(v);
              controller.current?.close();
            }}
            {...calendarProps}
          />
        )}
      </div>
      {name && <input type="hidden" name={name} value={selected ?? ''} />}
    </>
  );
}

// ── Toggle group ──

interface ToggleGroupContextValue {
  isPressed: (value: string) => boolean;
  toggle: (value: string) => void;
  item: (extra?: string) => string;
  disabled?: boolean;
}
const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

type ToggleGroupBase = Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> & {
  variant?: 'segmented' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  tone?: Tone;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
};
export type ToggleGroupProps = ToggleGroupBase &
  (
    | { type?: 'single'; value?: string | null; defaultValue?: string | null; onValueChange?: (value: string | null) => void }
    | { type: 'multiple'; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void }
  );

export function ToggleGroup(props: ToggleGroupProps) {
  const { type = 'single', value, defaultValue, onValueChange, variant, size, tone, orientation = 'horizontal', disabled, className, children, ...rest } = props;
  const [current, setCurrent] = useControllableState<string | null | string[]>(
    value,
    defaultValue ?? (type === 'multiple' ? [] : null),
    onValueChange as (v: string | null | string[]) => void,
  );
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => createRovingFocus(ref.current!, { selector: 'button', orientation }).destroy, [orientation]);
  const s = toggleGroup({ variant, size, tone });
  const list = Array.isArray(current) ? current : current ? [current] : [];
  const ctx: ToggleGroupContextValue = {
    isPressed: (v) => list.includes(v),
    toggle: (v) => {
      if (type === 'multiple') setCurrent(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
      else setCurrent(current === v ? null : v);
    },
    item: (extra) => s.item(extra),
    disabled,
  };
  return (
    <ToggleGroupContext.Provider value={ctx}>
      <div ref={ref} role="group" data-orientation={orientation} className={s.root(className)} {...rest}>
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

export interface ToggleGroupItemProps extends ComponentProps<'button'> {
  value: string;
}
export function ToggleGroupItem({ value, className, disabled, onClick, ...props }: ToggleGroupItemProps) {
  const ctx = useContext(ToggleGroupContext);
  if (!ctx) throw new Error('<ToggleGroupItem> must be used inside <ToggleGroup>');
  return (
    <button
      type="button"
      aria-pressed={ctx.isPressed(value)}
      disabled={disabled ?? ctx.disabled}
      className={ctx.item(className)}
      onClick={(e) => {
        onClick?.(e);
        ctx.toggle(value);
      }}
      {...props}
    />
  );
}
