import type { ComponentProps } from 'react';
import { button, buttonGroup, spinner, type VariantProps } from '@manthan/base';

type ButtonVariants = VariantProps<typeof button>;

export interface ButtonProps extends Omit<ComponentProps<'button'>, 'color'>, ButtonVariants {
  /** Shows a spinner, sets aria-busy and disables the button. */
  loading?: boolean;
}

export function Button({
  variant,
  size,
  tone,
  iconOnly,
  fullWidth,
  loading,
  disabled,
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={button({ variant, size, tone, iconOnly, fullWidth, class: className })}
      {...props}
    >
      {loading && <span className={spinner({ size: 'sm' })} aria-hidden />}
      {children}
    </button>
  );
}

export interface ButtonGroupProps extends ComponentProps<'div'> {
  attached?: boolean;
}

export function ButtonGroup({ attached, className, ...props }: ButtonGroupProps) {
  return <div role="group" className={buttonGroup({ attached, class: className })} {...props} />;
}
