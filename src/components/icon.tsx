import { createElement, type Ref, type SVGProps } from 'react';
import type { IconNode } from '@manthan/icons';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  icon: IconNode;
  size?: number | string;
  strokeWidth?: number | string;
  /** Keep the visual stroke width constant at any size. */
  absoluteStrokeWidth?: boolean;
  /** Accessible label; unlabelled icons are hidden from assistive tech. */
  title?: string;
  ref?: Ref<SVGSVGElement>;
}

export function Icon({ icon, size = 24, strokeWidth = 2, absoluteStrokeWidth, title, children, ...props }: IconProps) {
  const stroke = absoluteStrokeWidth ? (Number(strokeWidth) * 24) / Number.parseFloat(String(size)) : strokeWidth;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {icon.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs }))}
      {children}
    </svg>
  );
}
