import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type ChangeEvent,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { Check, ChevronDown, Minus } from '@manthan/icons';
import {
  checkbox,
  cx,
  field,
  input,
  inputGroup,
  radio,
  radioGroup,
  select,
  slider,
  switchRecipe,
  textarea,
  valueToPercent,
  type Tone,
} from '@manthan/base';
import { Icon } from './icon';
import { mergeRefs, useControllableState } from '../utils';

// ── Field: label + description + error, wired to the control via context ──

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required?: boolean;
  disabled?: boolean;
}
const FieldContext = createContext<FieldContextValue | null>(null);
export const useField = () => useContext(FieldContext);

export interface FieldProps extends Omit<ComponentProps<'div'>, 'children'> {
  label?: ReactNode;
  description?: ReactNode;
  /** Error message; also marks the control `aria-invalid`. */
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  children: ReactNode;
}

export function Field({ label, description, error, required, disabled, id, className, children, ...props }: FieldProps) {
  const auto = useId();
  const controlId = id ?? `field-${auto}`;
  const s = field({ required, disabled });
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <FieldContext.Provider value={{ id: controlId, describedBy, invalid: !!error, required, disabled }}>
      <div className={s.root(className)} {...props}>
        {label && (
          <label htmlFor={controlId} className={s.label()}>
            {label}
          </label>
        )}
        {children}
        {description && (
          <p id={descriptionId} className={s.description()}>
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} className={s.error()}>
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}

function useFieldProps<P extends { id?: string; disabled?: boolean; required?: boolean; 'aria-describedby'?: string; 'aria-invalid'?: unknown }>(props: P) {
  const ctx = useField();
  if (!ctx) return props;
  return {
    ...props,
    id: props.id ?? ctx.id,
    disabled: props.disabled ?? ctx.disabled,
    required: props.required ?? ctx.required,
    'aria-describedby': cx(ctx.describedBy, props['aria-describedby']) || undefined,
    'aria-invalid': props['aria-invalid'] ?? (ctx.invalid || undefined),
  };
}

// ── Text inputs ──

export interface InputProps extends Omit<ComponentProps<'input'>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  /** Decorative content at the start (usually an icon). */
  startContent?: ReactNode;
  /** Content at the end (icon, button, unit). */
  endContent?: ReactNode;
}

export function Input({ size, startContent, endContent, className, ...props }: InputProps) {
  const fieldProps = useFieldProps(props);
  const control = (
    <input
      className={input({ size, withStart: !!startContent, withEnd: !!endContent, class: startContent || endContent ? undefined : className })}
      {...fieldProps}
    />
  );
  if (!startContent && !endContent) return control;
  const g = inputGroup();
  return (
    <div className={g.root(className)}>
      {startContent && <span className={g.start()}>{startContent}</span>}
      {control}
      {endContent && <span className={g.end()}>{endContent}</span>}
    </div>
  );
}

export interface TextareaProps extends ComponentProps<'textarea'> {
  /** `auto` grows with its content (CSS field-sizing). */
  resize?: 'none' | 'vertical' | 'auto';
}
export function Textarea({ resize, className, ...props }: TextareaProps) {
  return <textarea className={textarea({ resize, class: className })} {...useFieldProps(props)} />;
}

export type SelectOption = string | { value: string; label?: ReactNode; disabled?: boolean };

export interface SelectProps extends Omit<ComponentProps<'select'>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  options?: SelectOption[];
  placeholder?: string;
}
export function Select({ size, options, placeholder, className, children, ...props }: SelectProps) {
  const s = select({ size });
  const fieldProps = useFieldProps(props);
  return (
    <div className={s.root(className)}>
      <select
        className={s.select()}
        {...fieldProps}
        defaultValue={placeholder && props.value === undefined && props.defaultValue === undefined ? '' : props.defaultValue}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options?.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label ?? opt.value}
            </option>
          );
        })}
        {children}
      </select>
      <Icon icon={ChevronDown} className={s.icon()} />
    </div>
  );
}

// ── Choices ──

interface ChoiceProps extends Omit<ComponentProps<'input'>, 'size' | 'type'> {
  size?: 'sm' | 'md' | 'lg';
  tone?: Tone;
  label?: ReactNode;
  description?: ReactNode;
}

export interface CheckboxProps extends ChoiceProps {
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({
  size,
  tone,
  label,
  description,
  indeterminate = false,
  onCheckedChange,
  onChange,
  className,
  ref,
  ...props
}: CheckboxProps) {
  const inner = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);
  const s = checkbox({ size, tone });
  const Wrapper = label || description ? 'label' : 'span';
  return (
    <Wrapper className={s.label(className)}>
      <span className={s.root()}>
        <input
          ref={mergeRefs(inner, ref)}
          type="checkbox"
          className={s.input()}
          aria-checked={indeterminate ? 'mixed' : undefined}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            onChange?.(e);
            onCheckedChange?.(e.target.checked);
          }}
          {...useFieldProps(props)}
        />
        <span className={s.control()}>
          <Icon icon={Check} strokeWidth={3} className={s.check()} />
          <Icon icon={Minus} strokeWidth={3} className={s.minus()} />
        </span>
      </span>
      {(label || description) && (
        <span className={s.text()}>
          {label}
          {description && <span className={s.description()}>{description}</span>}
        </span>
      )}
    </Wrapper>
  );
}

export interface SwitchProps extends ChoiceProps {
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({ size, tone, label, description, onCheckedChange, onChange, className, ...props }: SwitchProps) {
  const s = switchRecipe({ size, tone });
  const Wrapper = label ? 'label' : 'span';
  return (
    <Wrapper className={s.label(className)}>
      <span className={s.root()}>
        <input
          type="checkbox"
          role="switch"
          className={s.input()}
          onChange={(e) => {
            onChange?.(e);
            onCheckedChange?.(e.target.checked);
          }}
          {...useFieldProps(props)}
        />
        <span className={s.track()}>
          <span className={s.thumb()} />
        </span>
      </span>
      {label}
      {description && <span className="text-xs text-fg-muted">{description}</span>}
    </Wrapper>
  );
}

interface RadioGroupContextValue {
  name: string;
  value?: string;
  setValue: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  tone?: Tone;
  disabled?: boolean;
}
const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  tone?: Tone;
  disabled?: boolean;
}

export function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  name,
  orientation,
  size,
  tone,
  disabled,
  className,
  ...props
}: RadioGroupProps) {
  const auto = useId();
  const [current, setValue] = useControllableState(value, defaultValue, onValueChange as (v: string | undefined) => void);
  return (
    <RadioGroupContext.Provider
      value={{ name: name ?? `radio-${auto}`, value: current, setValue, size, tone, disabled }}
    >
      <div role="radiogroup" aria-orientation={orientation} className={radioGroup({ orientation, class: className })} {...props} />
    </RadioGroupContext.Provider>
  );
}

export interface RadioProps extends ChoiceProps {
  value: string;
}

export function Radio({ value, size, tone, label, description, disabled, className, ...props }: RadioProps) {
  const group = useContext(RadioGroupContext);
  const s = radio({ size: size ?? group?.size, tone: tone ?? group?.tone });
  return (
    <label className={s.label(className)}>
      <span className={s.root()}>
        <input
          type="radio"
          className={s.input()}
          value={value}
          name={group?.name}
          disabled={disabled ?? group?.disabled}
          {...(group ? { checked: group.value === value, onChange: () => group.setValue(value) } : {})}
          {...props}
        />
        <span className={s.control()}>
          <span className={s.dot()} />
        </span>
      </span>
      {(label || description) && (
        <span className={s.text()}>
          {label}
          {description && <span className={s.description()}>{description}</span>}
        </span>
      )}
    </label>
  );
}

// ── Slider (native range) ──

export interface SliderProps extends Omit<ComponentProps<'input'>, 'size' | 'type' | 'value' | 'defaultValue'> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  tone?: Tone;
}

export function Slider({
  value,
  defaultValue = 50,
  onValueChange,
  min = 0,
  max = 100,
  size,
  tone,
  className,
  style,
  onChange,
  ...props
}: SliderProps) {
  const [current, setValue] = useControllableState(value, defaultValue, onValueChange);
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={current}
      onChange={(e) => {
        onChange?.(e);
        setValue(Number(e.target.value));
      }}
      className={slider({ size, tone, class: className })}
      style={{ ...style, ['--mn-fill' as string]: `${valueToPercent(current, Number(min), Number(max))}%` }}
      {...useFieldProps(props)}
    />
  );
}
