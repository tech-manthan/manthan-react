import type { ReactElement } from 'react';
import { Button } from '../src/components/button';
import { Input } from '../src/components/form';
import { Dialog } from '../src/components/overlay';
import { DataTable } from '../src/components/data-table';
import { Chart } from '../src/components/chart';

const rows = [
  { id: 'INV-1001', customer: 'Ada Lovelace', status: 'Paid' },
  { id: 'INV-1002', customer: 'Alan Turing', status: 'Pending' },
  { id: 'INV-1003', customer: 'Grace Hopper', status: 'Overdue' },
];
const columns = [
  { key: 'id', header: 'Invoice' },
  { key: 'customer', header: 'Customer' },
  { key: 'status', header: 'Status' },
];
const chartData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => ({ month, revenue: 30 + i * 3 }));
const chartSeries = [{ key: 'revenue', label: 'Revenue' }];

export const demos: Record<string, () => ReactElement> = {
  button: () => (
    <Button variant="soft" tone="primary">
      Click me
    </Button>
  ),
  input: () => <Input placeholder="you@example.com" />,
  dialog: () => (
    <Dialog trigger={<Button>Open</Button>} title="Delete project?" description="This permanently deletes the project.">
      Are you sure?
    </Dialog>
  ),
  'data-table': () => <DataTable columns={columns} rows={rows} pageSize={3} />,
  chart: () => <Chart type="area" data={chartData} x="month" series={chartSeries} height={200} />,
};
