import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface AllocationItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface PortfolioAllocationChartProps {
  data: AllocationItem[];
  className?: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(25, 95%, 53%)',   // orange
  'hsl(142, 76%, 36%)',  // green
  'hsl(262, 83%, 58%)',  // purple
  'hsl(199, 89%, 48%)',  // blue
  'hsl(0, 84%, 60%)',    // red
  'hsl(47, 96%, 53%)',   // yellow
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="font-semibold text-sm">{data.name}</p>
      <p className="text-xs text-muted-foreground">
        ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <p className="text-xs font-medium" style={{ color: data.color }}>
        {data.percentage.toFixed(1)}%
      </p>
    </div>
  );
};

export function PortfolioAllocationChart({ data, className }: PortfolioAllocationChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    return data
      .filter(d => d.value > 0)
      .map((d, i) => ({
        ...d,
        color: COLORS[i % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const total = chartData.reduce((s, d) => s + d.value, 0);

  if (chartData.length === 0 || total === 0) {
    return (
      <div className={cn("flex items-center justify-center h-48 text-muted-foreground text-sm", className)}>
        No assets to display
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                  className="transition-opacity duration-200"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="space-y-1.5">
        {chartData.slice(0, 5).map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="flex-1 truncate text-muted-foreground">{item.name}</span>
            <span className="font-medium">{item.percentage.toFixed(1)}%</span>
          </div>
        ))}
        {chartData.length > 5 && (
          <div className="text-xs text-muted-foreground text-center">+{chartData.length - 5} more</div>
        )}
      </div>
    </div>
  );
}
