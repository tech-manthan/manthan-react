import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from '@manthan/icons';
import {
  ariaSort,
  cellAlign,
  dataTable,
  formatCell,
  getSelectionState,
  getTableView,
  nextSort,
  table,
  toggleAll,
  toggleId,
  type ColumnDef,
  type SortState,
} from '@manthan/base';
import { Checkbox, Input } from './form';
import { Icon } from './icon';
import { Pagination } from './navigation';
import { useControllableState } from '../utils';

export interface DataTableColumn<T> extends ColumnDef<T> {
  /** Custom cell content; defaults to the formatted value. */
  cell?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId?: (row: T, index: number) => string;
  /** 0 shows every row. @default 10 */
  pageSize?: number;
  /** Show the search box. @default true */
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  selected?: string[];
  defaultSelected?: string[];
  onSelectionChange?: (ids: string[]) => void;
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  caption?: ReactNode;
  emptyText?: ReactNode;
  striped?: boolean;
  size?: 'sm' | 'md';
  /** Extra content in the toolbar (filters, actions). */
  toolbar?: ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId = (row, i) => String((row as { id?: unknown }).id ?? i),
  pageSize = 10,
  searchable = true,
  searchPlaceholder = 'Search…',
  selectable = false,
  selected,
  defaultSelected = [],
  onSelectionChange,
  sort,
  defaultSort = null,
  onSortChange,
  caption,
  emptyText = 'No results.',
  striped,
  size,
  toolbar,
  className,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [currentSort, setSort] = useControllableState(sort, defaultSort, onSortChange);
  const [selection, setSelection] = useControllableState(selected, defaultSelected, onSelectionChange);
  const s = dataTable();
  const t = table({ striped, size });
  const ids = new Map(rows.map((row, i) => [row, getRowId(row, i)]));
  const view = getTableView(rows, { columns, sort: currentSort, query, page, pageSize });
  const visibleIds = view.rows.map((r) => ids.get(r)!);
  const all = getSelectionState(visibleIds, selection);

  return (
    <div className={s.root(className)}>
      {(searchable || toolbar || selectable) && (
        <div className={s.toolbar()}>
          {searchable && (
            <Input
              type="search"
              size="sm"
              aria-label="Search table"
              placeholder={searchPlaceholder}
              startContent={<Icon icon={Search} />}
              className={s.search()}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          )}
          {toolbar}
          <div className={s.summary()} aria-live="polite">
            {selectable && selection.length ? `${selection.length} of ${rows.length} selected` : `${view.total} ${view.total === 1 ? 'row' : 'rows'}`}
          </div>
        </div>
      )}
      <div className={t.root()}>
        <table className={t.table()}>
          {caption && <caption className={t.caption()}>{caption}</caption>}
          <thead className={t.header()}>
            <tr className={t.row()}>
              {selectable && (
                <th className={t.head(s.selectCell())}>
                  <Checkbox
                    size="sm"
                    aria-label="Select all rows on this page"
                    checked={all === 'all'}
                    indeterminate={all === 'some'}
                    onCheckedChange={() => setSelection(toggleAll(selection, visibleIds))}
                  />
                </th>
              )}
              {columns.map((col) => {
                const active = currentSort?.key === col.key;
                return (
                  <th key={col.key} scope="col" aria-sort={ariaSort(currentSort, col.key)} style={col.width ? { width: col.width } : undefined} className={t.head(cellAlign[col.align ?? 'start'])}>
                    {col.sortable === false ? (
                      col.header
                    ) : (
                      <button type="button" className={s.sortButton()} onClick={() => setSort(nextSort(currentSort, col.key))}>
                        {col.header}
                        <Icon
                          icon={active ? (currentSort!.direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown}
                          data-active={active ? '' : undefined}
                          className={s.sortIcon()}
                        />
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className={t.body()}>
            {view.rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className={s.empty()}>
                  {emptyText}
                </td>
              </tr>
            )}
            {view.rows.map((row) => {
              const id = ids.get(row)!;
              const isSelected = selection.includes(id);
              return (
                <tr key={id} aria-selected={selectable ? isSelected : undefined} className={t.row()}>
                  {selectable && (
                    <td className={t.cell(s.selectCell())}>
                      <Checkbox size="sm" aria-label={`Select row ${id}`} checked={isSelected} onCheckedChange={() => setSelection(toggleId(selection, id))} />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={t.cell(cellAlign[col.align ?? 'start'])}>
                      {col.cell ? col.cell(row) : formatCell(row, col)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={s.footer()}>
        <span className="tabular-nums">{view.total ? `${view.start}–${view.end} of ${view.total}` : '0 results'}</span>
        {view.pageCount > 1 && <Pagination aria-label="Table pages" size="sm" total={view.pageCount} page={view.page} onPageChange={setPage} />}
      </div>
    </div>
  );
}
