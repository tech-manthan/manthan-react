import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from '@manthan/icons';
import { chart, deltaDirection, stat, type ChartSeries } from '@manthan/base';
import { createChart, type ChartController, type ChartControllerOptions } from '@manthan/base/dom';
import { Icon } from './icon';
import { useLatest } from '../utils';

export interface ChartProps<T = Record<string, unknown>> extends ChartControllerOptions<T> {
  className?: string;
  style?: CSSProperties;
}

const optionKeys = [
  'type', 'data', 'x', 'series', 'stacked', 'horizontal', 'curve', 'markers', 'sparkline', 'grid', 'directLabels', 'yDomain',
  'xFormat', 'yFormat', 'valueFormat', 'innerRadius', 'maxBarSize', 'hidden', 'title', 'height', 'legend', 'toggleable',
  'tooltip', 'centerLabel', 'xLabel',
] as const;

/**
 * Line, area, bar or donut chart drawn by the shared `@manthan/base` controller,
 * so it looks and behaves the same in every framework and follows the active style.
 * Memoise `data` and `series` to avoid re-drawing on unrelated renders.
 */
export function Chart<T = Record<string, unknown>>({ className, style, ...props }: ChartProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const controller = useRef<ChartController<T> | null>(null);
  const latest = useLatest(props);
  const pick = () => Object.fromEntries(optionKeys.map((k) => [k, latest.current[k]])) as unknown as ChartControllerOptions<T>;

  useEffect(() => {
    controller.current = createChart<T>(ref.current!, {
      ...pick(),
      onHiddenChange: (hidden) => latest.current.onHiddenChange?.(hidden),
      onActiveChange: (index) => latest.current.onActiveChange?.(index),
    });
    return () => {
      controller.current?.destroy();
      controller.current = null;
    };
  }, []);

  const deps = optionKeys.map((k) => props[k]);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    controller.current?.update(pick());
  }, deps);

  return <div ref={ref} className={chart().root(className)} style={style} />;
}

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  /** Signed change, e.g. "+12.4%". Its sign picks the arrow. */
  delta?: string | number;
  /** Whether the change is good; colours the delta. @default 'neutral' */
  sentiment?: 'positive' | 'negative' | 'neutral';
  /** Comparison period, e.g. "vs last month". */
  caption?: ReactNode;
  /** Recent values, drawn as a sparkline. */
  trend?: number[];
  className?: string;
}

const sparkSeries: ChartSeries[] = [{ key: 'v', color: 'accent' }];

/** Stat tile: label, headline value, delta and an optional sparkline. */
export function Stat({ label, value, delta, sentiment = 'neutral', caption, trend, className }: StatProps) {
  const s = stat({ sentiment });
  const direction = deltaDirection(delta);
  const points = useMemo(() => trend?.map((v, i) => ({ i, v })) ?? [], [trend]);
  return (
    <div className={s.root(className)}>
      <span className={s.label()}>{label}</span>
      <span className={s.value()}>{value}</span>
      {(delta !== undefined || caption) && (
        <span className={s.footer()}>
          {delta !== undefined && (
            <span className={s.delta()}>
              {direction !== 'flat' && <Icon icon={direction === 'up' ? ArrowUpRight : ArrowDownRight} aria-hidden />}
              {delta}
            </span>
          )}
          {caption}
        </span>
      )}
      {trend && trend.length > 1 && (
        <Chart
          className={s.trend()}
          type="area"
          sparkline
          height={40}
          x="i"
          title={typeof label === 'string' ? `${label} trend` : 'Trend'}
          data={points}
          series={sparkSeries}
        />
      )}
    </div>
  );
}
