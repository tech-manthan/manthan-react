import { createContext, useContext, useState, type ComponentProps, type ReactNode } from 'react';
import {
  avatar,
  avatarGroup,
  badge,
  card,
  heading,
  kbd,
  separator,
  table,
  type VariantProps,
  type Tone,
} from '@manthan/base';

// Badge
export interface BadgeProps extends ComponentProps<'span'>, VariantProps<typeof badge> {}
export function Badge({ variant, size, tone, className, ...props }: BadgeProps) {
  return <span className={badge({ variant, size, tone, class: className })} {...props} />;
}

// Avatar
export interface AvatarProps extends Omit<ComponentProps<'span'>, 'children'> {
  src?: string;
  alt?: string;
  /** Shown while loading, when there is no src or when the image fails. Defaults to initials of `alt`. */
  fallback?: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  tone?: Tone;
}
export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

export function Avatar({ src, alt = '', fallback, size, shape, tone, className, ...props }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const s = avatar({ size, shape, tone });
  const showImage = src && failedSrc !== src;
  return (
    <span className={s.root(className)} {...props}>
      {showImage ? (
        <img src={src} alt={alt} className={s.image()} onError={() => setFailedSrc(src)} />
      ) : (
        <span className={s.fallback()} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
          {fallback ?? initials(alt)}
        </span>
      )}
    </span>
  );
}
export function AvatarGroup({ className, ...props }: ComponentProps<'div'>) {
  return <div className={avatarGroup({ class: className })} {...props} />;
}

// Card
type CardSlots = ReturnType<typeof card>;
const CardContext = createContext<CardSlots>(card());
export interface CardProps extends ComponentProps<'div'>, VariantProps<typeof card> {}
export function Card({ variant, size, interactive, className, ...props }: CardProps) {
  const slots = card({ variant, size, interactive });
  return (
    <CardContext.Provider value={slots}>
      <div className={slots.root(className)} tabIndex={interactive ? 0 : undefined} {...props} />
    </CardContext.Provider>
  );
}
export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={useContext(CardContext).header(className)} {...props} />;
}
export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 className={useContext(CardContext).title(className)} {...props} />;
}
export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={useContext(CardContext).description(className)} {...props} />;
}
export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={useContext(CardContext).content(className)} {...props} />;
}
export function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div className={useContext(CardContext).footer(className)} {...props} />;
}

// Kbd, Separator, Heading
export function Kbd({ size, className, ...props }: ComponentProps<'kbd'> & { size?: 'sm' | 'md' }) {
  return <kbd className={kbd({ size, class: className })} {...props} />;
}

export interface SeparatorProps extends ComponentProps<'div'> {
  orientation?: 'horizontal' | 'vertical';
  /** Purely visual separators are hidden from assistive tech. @default true */
  decorative?: boolean;
}
export function Separator({ orientation = 'horizontal', decorative = true, className, ...props }: SeparatorProps) {
  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      className={separator({ orientation, class: className })}
      {...props}
    />
  );
}

export interface HeadingProps extends ComponentProps<'h2'> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 1 | 2 | 3 | 4 | 5 | 6;
}
export function Heading({ level = 2, size, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return <Tag className={heading({ size: size ?? level, class: className })} {...props} />;
}

// Table
type TableSlots = ReturnType<typeof table>;
const TableContext = createContext<TableSlots>(table());
export interface TableProps extends ComponentProps<'table'> {
  striped?: boolean;
  size?: 'sm' | 'md';
  containerClassName?: string;
}
export function Table({ striped, size, className, containerClassName, ...props }: TableProps) {
  const slots = table({ striped, size });
  return (
    <TableContext.Provider value={slots}>
      <div className={slots.root(containerClassName)}>
        <table className={slots.table(className)} {...props} />
      </div>
    </TableContext.Provider>
  );
}
export const TableHeader = ({ className, ...p }: ComponentProps<'thead'>) => (
  <thead className={useContext(TableContext).header(className)} {...p} />
);
export const TableBody = ({ className, ...p }: ComponentProps<'tbody'>) => (
  <tbody className={useContext(TableContext).body(className)} {...p} />
);
export const TableRow = ({ className, ...p }: ComponentProps<'tr'>) => (
  <tr className={useContext(TableContext).row(className)} {...p} />
);
export const TableHead = ({ className, ...p }: ComponentProps<'th'>) => (
  <th className={useContext(TableContext).head(className)} {...p} />
);
export const TableCell = ({ className, ...p }: ComponentProps<'td'>) => (
  <td className={useContext(TableContext).cell(className)} {...p} />
);
export const TableCaption = ({ className, ...p }: ComponentProps<'caption'>) => (
  <caption className={useContext(TableContext).caption(className)} {...p} />
);
