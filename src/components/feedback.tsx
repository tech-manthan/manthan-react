import type { ComponentProps, ReactNode } from 'react';
import type { IconNode } from '@manthan/icons';
import { alert, progress, progressCircle, skeleton, spinner, valueToPercent, type Tone } from '@manthan/base';
import { toastIcons } from '@manthan/base/dom';
import { Icon } from './icon';

export interface AlertProps extends Omit<ComponentProps<'div'>, 'title'> {
  tone?: Tone;
  variant?: 'soft' | 'surface' | 'outline' | 'solid';
  title?: ReactNode;
  /** Custom icon, or `false` to hide it. Defaults to the tone icon. */
  icon?: IconNode | false;
}

export function Alert({ tone = 'info', variant, title, icon, className, children, ...props }: AlertProps) {
  const s = alert({ tone, variant });
  const node = icon === false ? undefined : (icon ?? toastIcons[tone]);
  return (
    <div role="alert" className={s.root(className)} {...props}>
      {node && <Icon icon={node} className={s.icon()} />}
      <div className={s.content()}>
        {title && <div className={s.title()}>{title}</div>}
        {children && <div className={s.description()}>{children}</div>}
      </div>
    </div>
  );
}

export interface ProgressProps extends ComponentProps<'div'> {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  tone?: Tone;
}

export function Progress({ value = 0, max = 100, indeterminate, size, tone, className, ...props }: ProgressProps) {
  const s = progress({ size, tone, indeterminate });
  const percent = valueToPercent(value, 0, max);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : value}
      className={s.root(className)}
      {...props}
    >
      <div className={s.indicator()} style={indeterminate ? undefined : { translate: `-${100 - percent}% 0` }} />
    </div>
  );
}

export interface ProgressCircleProps extends ComponentProps<'div'> {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: Tone;
  /** Render the percentage in the middle. @default true (except size sm) */
  showValue?: boolean;
  thickness?: number;
}

export function ProgressCircle({
  value = 0,
  max = 100,
  indeterminate,
  size = 'md',
  tone,
  showValue = size !== 'sm',
  thickness = 4,
  className,
  ...props
}: ProgressCircleProps) {
  const s = progressCircle({ size, tone, indeterminate });
  const r = 20 - thickness / 2;
  const c = 2 * Math.PI * r;
  const percent = indeterminate ? 25 : valueToPercent(value, 0, max);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : value}
      className={s.root(className)}
      {...props}
    >
      <svg viewBox="0 0 40 40" className={s.svg()} aria-hidden>
        <circle cx="20" cy="20" r={r} strokeWidth={thickness} className={s.track()} />
        <circle cx="20" cy="20" r={r} strokeWidth={thickness} strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)} className={s.indicator()} />
      </svg>
      {showValue && !indeterminate && <span className={s.label()}>{Math.round(percent)}%</span>}
    </div>
  );
}

export interface SpinnerProps extends ComponentProps<'span'> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  tone?: Tone | 'current';
  label?: string;
}
export function Spinner({ size, tone, label = 'Loading', className, ...props }: SpinnerProps) {
  return <span role="status" aria-label={label} className={spinner({ size, tone, class: className })} {...props} />;
}

export interface SkeletonProps extends ComponentProps<'span'> {
  shape?: 'text' | 'rect' | 'circle';
}
export function Skeleton({ shape, className, ...props }: SkeletonProps) {
  return <span aria-hidden className={skeleton({ shape, class: className })} {...props} />;
}
