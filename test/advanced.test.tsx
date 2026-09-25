import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Calendar, Combobox, Command, CommandDialog, DatePicker, ToggleGroup, ToggleGroupItem } from '../src/index';

afterEach(cleanup);
const flush = () => act(() => new Promise((r) => setTimeout(r, 0)));

describe('advanced components', () => {
  it('filters and selects in a Combobox', async () => {
    const onValueChange = vi.fn();
    render(
      <Combobox
        aria-label="Framework"
        options={[
          { value: 'react', label: 'React', group: 'UI' },
          { value: 'svelte', label: 'Svelte', group: 'UI' },
          { value: 'rails', label: 'Rails', group: 'Server' },
        ]}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole('combobox', { name: 'Framework' });
    fireEvent.input(input, { target: { value: 'sv' } });
    await flush();
    expect(screen.getAllByRole('option', { hidden: true }).map((o) => o.textContent)).toEqual(['Svelte']);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onValueChange).toHaveBeenCalledWith('svelte');
    await flush();
    expect((input as HTMLInputElement).value).toBe('Svelte');
  });

  it('runs a Command palette from the keyboard', async () => {
    const onSelect = vi.fn();
    render(<Command options={[{ value: 'open', label: 'Open file', shortcut: 'mod+o' }, { value: 'save', label: 'Save all' }]} onSelect={onSelect} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'save' } });
    await flush();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('save');
  });

  it('opens a CommandDialog with its hotkey', async () => {
    render(<CommandDialog options={[{ value: 'a', label: 'Alpha' }]} />);
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true, metaKey: false });
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    await flush();
    expect((document.querySelector('dialog') as HTMLDialogElement).open).toBe(true);
  });

  it('navigates and selects dates in a Calendar', async () => {
    const onValueChange = vi.fn();
    render(<Calendar defaultValue="2026-09-25" weekStartsOn={1} locale="en-US" onValueChange={onValueChange} />);
    expect(screen.getByText('September 2026')).toBeTruthy();
    const day = screen.getByRole('button', { name: /September 25, 2026/ });
    day.focus();
    fireEvent.keyDown(day, { key: 'PageDown' });
    await flush();
    expect(screen.getByText('October 2026')).toBeTruthy();
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-10-25');
    fireEvent.click(document.activeElement!);
    expect(onValueChange).toHaveBeenCalledWith('2026-10-25');
  });

  it('shows the chosen date in a DatePicker and posts it', () => {
    const { container } = render(<DatePicker defaultValue="2026-09-25" locale="en-US" name="due" />);
    expect(screen.getByRole('button', { name: /Sep 25, 2026/ })).toBeTruthy();
    expect((container.querySelector('input[name=due]') as HTMLInputElement).value).toBe('2026-09-25');
  });

  it('toggles single and multiple groups', () => {
    const single = vi.fn();
    const multiple = vi.fn();
    render(
      <>
        <ToggleGroup aria-label="Range" defaultValue="week" onValueChange={single}>
          <ToggleGroupItem value="day">Day</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="multiple" aria-label="Format" onValueChange={multiple}>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
          <ToggleGroupItem value="i">I</ToggleGroupItem>
        </ToggleGroup>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Week' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Day' }));
    expect(single).toHaveBeenCalledWith('day');
    fireEvent.click(screen.getByRole('button', { name: 'B' }));
    fireEvent.click(screen.getByRole('button', { name: 'I' }));
    expect(multiple).toHaveBeenLastCalledWith(['b', 'i']);
  });
});
