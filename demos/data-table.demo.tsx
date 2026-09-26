import { DataTable } from '../src/components/data-table';

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

export function DataTableDemo() {
  return <DataTable columns={columns} rows={rows} pageSize={3} />;
}
