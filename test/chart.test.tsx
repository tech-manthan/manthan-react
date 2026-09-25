import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Chart, Stat } from '../src/index';

afterEach(cleanup);
const data = [
  { m: 'Jan', a: 3, b: 1 },
  { m: 'Feb', a: 5, b: 2 },
];
const series = [
  { key: 'a', label: 'Alpha' },
  { key: 'b', label: 'Beta' },
];

describe('Chart', () => {
  it('renders, toggles series and updates on prop change', () => {
    const onHiddenChange = vi.fn();
    const { container, rerender } = render(<Chart type="bar" title="Sales" data={data} x="m" series={series} onHiddenChange={onHiddenChange} />);
    expect(screen.getByRole('img', { name: 'Sales' })).toBeTruthy();
    expect(container.querySelectorAll('.mn-chart-bar')).toHaveLength(4);
    fireEvent.click(screen.getByRole('button', { name: 'Beta' }));
    expect(onHiddenChange).toHaveBeenCalledWith(['b']);
    expect(container.querySelectorAll('.mn-chart-bar')).toHaveLength(2);
    rerender(<Chart type="line" title="Sales" data={data} x="m" series={series} onHiddenChange={onHiddenChange} />);
    expect(container.querySelectorAll('.mn-chart-line')).toHaveLength(1);
  });

  it('renders a stat tile with a sparkline', () => {
    const { container } = render(<Stat label="Revenue" value="$4.2K" delta="-3%" sentiment="negative" caption="vs last week" trend={[1, 3, 2]} />);
    expect(screen.getByText('$4.2K')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Revenue trend' })).toBeTruthy();
    expect(container.querySelector('.mn-chart-area')).toBeTruthy();
  });
});
