import type { ReactElement } from 'react';
import { ButtonDemo } from './button.demo';
import { InputDemo } from './input.demo';
import { DialogDemo } from './dialog.demo';
import { DataTableDemo } from './data-table.demo';
import { ChartDemo } from './chart.demo';

export const demos: Record<string, () => ReactElement> = {
  button: ButtonDemo,
  input: InputDemo,
  dialog: DialogDemo,
  'data-table': DataTableDemo,
  chart: ChartDemo,
};
