import type { ReactElement } from 'react';
import { ButtonDemo } from './button.demo';
import { InputDemo } from './input.demo';
import { DialogDemo } from './dialog.demo';
import { DataTableDemo } from './data-table.demo';
import { ChartDemo } from './chart.demo';
import { BadgeDemo } from './badge.demo';
import { AvatarDemo } from './avatar.demo';
import { SeparatorDemo } from './separator.demo';
import { HeadingDemo } from './heading.demo';
import { SpinnerDemo } from './spinner.demo';
import { SkeletonDemo } from './skeleton.demo';

export const demos: Record<string, () => ReactElement> = {
  button: ButtonDemo,
  input: InputDemo,
  dialog: DialogDemo,
  'data-table': DataTableDemo,
  chart: ChartDemo,
  badge: BadgeDemo,
  avatar: AvatarDemo,
  separator: SeparatorDemo,
  heading: HeadingDemo,
  spinner: SpinnerDemo,
  skeleton: SkeletonDemo,
};
