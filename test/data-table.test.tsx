import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Badge, DataTable } from '../src/index';

afterEach(cleanup);
const rows = Array.from({ length: 12 }, (_, i) => ({ id: String(i + 1), name: `User ${i + 1}`, score: (i * 7) % 10 }));

describe('DataTable', () => {
  it('sorts, searches, selects and pages', () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        rows={rows}
        pageSize={5}
        selectable
        onSelectionChange={onSelectionChange}
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'score', header: 'Score', align: 'end', searchable: false, cell: (r) => <Badge>{r.score}</Badge> },
        ]}
      />,
    );
    const body = () => screen.getAllByRole('row').slice(1);
    expect(body()).toHaveLength(5);
    expect(screen.getByText('1–5 of 12')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Score' }));
    expect(screen.getByRole('columnheader', { name: 'Score' }).getAttribute('aria-sort')).toBe('ascending');
    expect(within(body()[0]!).getAllByRole('cell')[2]!.textContent).toBe('0');

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search table' }), { target: { value: 'user 1' } });
    expect(body()).toHaveLength(4);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(expect.arrayContaining(['1', '10', '11', '12']));
    expect(screen.getByText('4 of 12 selected')).toBeTruthy();
  });

  it('pages through rows', () => {
    render(<DataTable rows={rows} pageSize={5} columns={[{ key: 'name', header: 'Name' }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('6–10 of 12')).toBeTruthy();
    expect(screen.getByText('User 6')).toBeTruthy();
  });
});
