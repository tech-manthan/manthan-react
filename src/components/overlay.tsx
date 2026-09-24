import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { X } from '@manthan/icons';
import {
  button,
  closeButton,
  cx,
  dialog,
  menu,
  popover,
  spinner,
  toast as defaultToaster,
  toastRecipe,
  tooltip,
  type Placement,
  type ToastStore as ToasterStore,
  type ToastRecord,
  type Tone,
} from '@manthan/base';
import { createDialog, createMenu, createPopover, createTooltip, toastIcons, type DialogController, type PopoverController } from '@manthan/base/dom';
import { Icon } from './icon';
import { useControllableState, useLatest } from '../utils';

type TriggerElement = ReactElement<{ id?: string; onClick?: (e: MouseEvent) => void }>;

function withId(trigger: ReactNode, id: string) {
  return isValidElement(trigger) ? cloneElement(trigger as TriggerElement, { id }) : trigger;
}

/** Sync a controlled `open` prop into an imperative controller. */
function useOpenSync(open: boolean | undefined, controller: { current?: { open(): void; close(): void } | null }) {
  useEffect(() => {
    if (open === undefined || !controller.current) return;
    if (open) controller.current.open();
    else controller.current.close();
  }, [open, controller]);
}

// ── Dialog / Drawer ──

const DialogContext = createContext<{ close: () => void } | null>(null);
/** Access the enclosing dialog, e.g. to close it after a form submits. */
export const useDialog = () => useContext(DialogContext);

export interface DialogProps extends Omit<ComponentProps<'dialog'>, 'open' | 'title'> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Element that opens the dialog; it receives an onClick handler. */
  trigger?: ReactElement;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  placement?: 'center' | 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  /** Show the × button. @default true */
  showClose?: boolean;
}

export function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  title,
  description,
  footer,
  placement,
  size,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showClose = true,
  className,
  children,
  ...props
}: DialogProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const ref = useRef<HTMLDialogElement>(null);
  const controller = useRef<DialogController>(null);
  const setOpenRef = useLatest(setOpen);
  const id = useId();
  const s = dialog({ placement, size });

  useEffect(() => {
    const ctl = createDialog(ref.current!, {
      closeOnBackdrop,
      closeOnEscape,
      onOpenChange: (next) => setOpenRef.current(next),
    });
    controller.current = ctl;
    return () => {
      ctl.destroy();
      controller.current = null;
    };
  }, [closeOnBackdrop, closeOnEscape, setOpenRef]);
  useOpenSync(isOpen, controller);

  const triggerEl =
    trigger && isValidElement(trigger)
      ? cloneElement(trigger as TriggerElement, {
          onClick: (e: MouseEvent) => {
            (trigger as TriggerElement).props.onClick?.(e);
            setOpen(true);
          },
        })
      : null;

  return (
    <DialogContext.Provider value={{ close: () => setOpen(false) }}>
      {triggerEl}
      <dialog
        ref={ref}
        aria-labelledby={title ? `${id}-title` : undefined}
        aria-describedby={description ? `${id}-description` : undefined}
        className={s.content(className)}
        {...props}
      >
        {(title || description) && (
          <div className={s.header()}>
            {title && (
              <h2 id={`${id}-title`} className={s.title()}>
                {title}
              </h2>
            )}
            {description && (
              <p id={`${id}-description`} className={s.description()}>
                {description}
              </p>
            )}
          </div>
        )}
        <div className={s.body()}>{children}</div>
        {footer && <div className={s.footer()}>{footer}</div>}
        {showClose && (
          <button type="button" aria-label="Close" className={closeButton({ class: s.close() })} onClick={() => setOpen(false)}>
            <Icon icon={X} />
          </button>
        )}
      </dialog>
    </DialogContext.Provider>
  );
}

/** Wraps a button so that clicking it closes the enclosing dialog. */
export function DialogClose({ children }: { children: ReactElement }) {
  const ctx = useDialog();
  return cloneElement(children as TriggerElement, {
    onClick: (e: MouseEvent) => {
      (children as TriggerElement).props.onClick?.(e);
      ctx?.close();
    },
  });
}

// ── Popover ──

export interface PopoverProps extends Omit<ComponentProps<'div'>, 'title'> {
  trigger: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  offset?: number;
  title?: ReactNode;
  description?: ReactNode;
}

export function Popover({ trigger, open, onOpenChange, placement, offset, title, description, className, children, ...props }: PopoverProps) {
  const id = useId();
  const triggerId = `${id}-trigger`;
  const ref = useRef<HTMLDivElement>(null);
  const controller = useRef<PopoverController>(null);
  const onOpenChangeRef = useLatest(onOpenChange);
  const s = popover();

  useEffect(() => {
    const trig = document.getElementById(triggerId);
    if (!trig || !ref.current) return;
    const ctl = createPopover({ trigger: trig, content: ref.current, placement, offset, onOpenChange: (o) => onOpenChangeRef.current?.(o) });
    controller.current = ctl;
    return () => ctl.destroy();
  }, [triggerId, placement, offset, onOpenChangeRef]);
  useOpenSync(open, controller);

  return (
    <>
      {withId(trigger, triggerId)}
      <div ref={ref} popover="auto" className={s.content(className)} {...props}>
        {title && <h3 className={s.title()}>{title}</h3>}
        {description && <p className={s.description()}>{description}</p>}
        {children}
      </div>
    </>
  );
}

// ── Menu ──

const MenuSlotsContext = createContext(menu());

export interface MenuProps extends ComponentProps<'div'> {
  trigger: ReactElement;
  placement?: Placement;
  onOpenChange?: (open: boolean) => void;
}

export function Menu({ trigger, placement, onOpenChange, className, children, ...props }: MenuProps) {
  const id = useId();
  const triggerId = `${id}-trigger`;
  const ref = useRef<HTMLDivElement>(null);
  const onOpenChangeRef = useLatest(onOpenChange);
  const s = menu();
  useEffect(() => {
    const trig = document.getElementById(triggerId);
    if (!trig || !ref.current) return;
    return createMenu({ trigger: trig, content: ref.current, placement, onOpenChange: (o) => onOpenChangeRef.current?.(o) }).destroy;
  }, [triggerId, placement, onOpenChangeRef]);
  return (
    <MenuSlotsContext.Provider value={s}>
      {withId(trigger, triggerId)}
      <div ref={ref} popover="auto" role="menu" tabIndex={-1} className={s.content(className)} {...props}>
        {children}
      </div>
    </MenuSlotsContext.Provider>
  );
}

export interface MenuItemProps extends Omit<ComponentProps<'button'>, 'onSelect'> {
  onSelect?: () => void;
  tone?: Tone;
  /** Leading icon element. */
  icon?: ReactNode;
  shortcut?: ReactNode;
  /** Keep the menu open after selecting. */
  keepOpen?: boolean;
}

export function MenuItem({ onSelect, tone, icon, shortcut, keepOpen, disabled, className, children, onClick, ...props }: MenuItemProps) {
  const inherited = useContext(MenuSlotsContext);
  const s = tone ? menu({ tone }) : inherited;
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      data-keep-open={keepOpen || undefined}
      className={s.item(tone ? cx('text-accent-11', className) : className)}
      onClick={(e) => {
        if (disabled) return;
        onClick?.(e);
        onSelect?.();
      }}
      {...props}
    >
      {icon}
      {children}
      {shortcut && <span className={s.shortcut()}>{shortcut}</span>}
    </button>
  );
}

export function MenuLabel({ className, ...props }: ComponentProps<'div'>) {
  return <div className={useContext(MenuSlotsContext).label(className)} {...props} />;
}
export function MenuSeparator({ className, ...props }: ComponentProps<'div'>) {
  return <div role="separator" className={useContext(MenuSlotsContext).separator(className)} {...props} />;
}

// ── Tooltip ──

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  placement?: Placement;
  openDelay?: number;
  closeDelay?: number;
  className?: string;
}

export function Tooltip({ content, children, placement, openDelay, closeDelay, className }: TooltipProps) {
  const id = useId();
  const triggerId = `${id}-trigger`;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const trig = document.getElementById(triggerId);
    if (!trig || !ref.current) return;
    return createTooltip({ trigger: trig, content: ref.current, placement, openDelay, closeDelay }).destroy;
  }, [triggerId, placement, openDelay, closeDelay]);
  return (
    <>
      {withId(children, triggerId)}
      <div ref={ref} popover="manual" role="tooltip" className={tooltip({ class: className })}>
        {content}
      </div>
    </>
  );
}

// ── Toaster ──

const EMPTY: readonly ToastRecord[] = [];

export interface ToasterProps {
  toaster?: ToasterStore;
  placement?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  label?: string;
  className?: string;
}

/** Renders toasts from a store. Call `toast()` / `toast.success()` anywhere. */
export function Toaster({ toaster = defaultToaster, placement = 'bottom-right', label = 'Notifications', className }: ToasterProps) {
  const toasts = useSyncExternalStore(toaster.subscribe, toaster.getSnapshot, () => EMPTY);
  const region = toastRecipe({ placement }).region(className);
  return (
    <section aria-label={label} aria-live="polite" className={region} onPointerEnter={toaster.pause} onPointerLeave={toaster.resume}>
      {toasts.map((t) => {
        const s = toastRecipe({ placement, tone: t.tone });
        const icon = t.tone ? toastIcons[t.tone] : undefined;
        return (
          <div key={t.id} role={t.tone === 'danger' ? 'alert' : 'status'} data-state={t.state} className={s.root()}>
            {t.loading ? (
              <span className={spinner({ size: 'sm', class: 'mt-0.5 text-accent-11' })} aria-hidden />
            ) : (
              t.icon !== false && icon && <Icon icon={icon} className={s.icon()} />
            )}
            <div className={s.content()}>
              {t.title && <div className={s.title()}>{t.title}</div>}
              {t.description && <div className={s.description()}>{t.description}</div>}
              {t.action && (
                <div className={s.actions()}>
                  <button
                    type="button"
                    className={button({ size: 'xs', variant: 'soft' })}
                    onClick={() => {
                      t.action!.onClick();
                      toaster.dismiss(t.id);
                    }}
                  >
                    {t.action.label}
                  </button>
                </div>
              )}
            </div>
            <button type="button" aria-label="Dismiss notification" className={closeButton({ class: s.close() })} onClick={() => toaster.dismiss(t.id)}>
              <Icon icon={X} />
            </button>
          </div>
        );
      })}
    </section>
  );
}
