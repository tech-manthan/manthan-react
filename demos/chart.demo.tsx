import { Chart } from '../src/components/chart';

const data = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => ({ month, revenue: 30 + i * 3 }));
const series = [{ key: 'revenue', label: 'Revenue' }];

export function ChartDemo() {
  return <Chart type="area" data={data} x="month" series={series} height={200} />;
}
