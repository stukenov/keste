import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ChartConfig, ChartData } from '../core-ts/chart-types';
import type { SheetModel } from '../core-ts/types';

interface ChartRendererProps {
  config: ChartConfig;
  sheet: SheetModel;
}

export function ChartRenderer({ config, sheet }: ChartRendererProps) {
  // Extract data from sheet based on config
  const chartData = useMemo<ChartData>(() => {
    const categories: string[] = [];
    const seriesData: Array<{ name: string; data: number[]; color?: string }> = [];

    // Extract categories (X-axis)
    if (config.categoryRange) {
      const { startRow, startCol, endRow } = config.categoryRange;
      for (let row = startRow; row <= endRow; row++) {
        const cellKey = `${row}-${startCol}`;
        const cell = sheet.cells.get(cellKey);
        categories.push(cell?.value?.toString() || '');
      }
    }

    // Extract series data (Y-axis)
    config.series.forEach((series) => {
      const { startRow, startCol, endRow } = series.dataRange;
      const data: number[] = [];

      for (let row = startRow; row <= endRow; row++) {
        const cellKey = `${row}-${startCol}`;
        const cell = sheet.cells.get(cellKey);
        const value = cell?.value;
        data.push(typeof value === 'number' ? value : parseFloat(value?.toString() || '0') || 0);
      }

      seriesData.push({
        name: series.name,
        data,
        color: series.color,
      });
    });

    return { categories, series: seriesData };
  }, [config, sheet]);

  // Transform data for Recharts format
  const rechartsData = useMemo(() => {
    return chartData.categories.map((category, index) => {
      const dataPoint: any = { name: category };
      chartData.series.forEach((series) => {
        dataPoint[series.name] = series.data[index] || 0;
      });
      return dataPoint;
    });
  }, [chartData]);

  const colors = config.colors || ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data: rechartsData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    switch (config.type) {
      case 'column':
      case 'bar':
        return (
          <BarChart {...commonProps} layout={config.type === 'bar' ? 'vertical' : 'horizontal'}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              type={config.type === 'bar' ? 'number' : 'category'}
              label={config.xAxis?.title ? { value: config.xAxis.title, position: 'insideBottom', offset: -10 } : undefined}
            />
            <YAxis
              type={config.type === 'bar' ? 'category' : 'number'}
              label={config.yAxis?.title ? { value: config.yAxis.title, angle: -90, position: 'insideLeft' } : undefined}
            />
            <Tooltip />
            {config.legend?.show && <Legend />}
            {chartData.series.map((series, index) => (
              <Bar
                key={series.name}
                dataKey={series.name}
                fill={series.color || colors[index % colors.length]}
                stackId={config.subType === 'stacked' || config.subType === 'stacked100' ? 'stack' : undefined}
              />
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              label={config.xAxis?.title ? { value: config.xAxis.title, position: 'insideBottom', offset: -10 } : undefined}
            />
            <YAxis
              label={config.yAxis?.title ? { value: config.yAxis.title, angle: -90, position: 'insideLeft' } : undefined}
            />
            <Tooltip />
            {config.legend?.show && <Legend />}
            {chartData.series.map((series, index) => (
              <Line
                key={series.name}
                type="monotone"
                dataKey={series.name}
                stroke={series.color || colors[index % colors.length]}
                strokeWidth={2}
                dot={config.subType === 'line-markers'}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              label={config.xAxis?.title ? { value: config.xAxis.title, position: 'insideBottom', offset: -10 } : undefined}
            />
            <YAxis
              label={config.yAxis?.title ? { value: config.yAxis.title, angle: -90, position: 'insideLeft' } : undefined}
            />
            <Tooltip />
            {config.legend?.show && <Legend />}
            {chartData.series.map((series, index) => (
              <Area
                key={series.name}
                type="monotone"
                dataKey={series.name}
                fill={series.color || colors[index % colors.length]}
                stroke={series.color || colors[index % colors.length]}
                stackId={config.subType === 'stacked' ? 'stack' : undefined}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
      case 'donut':
        // For pie charts, use first series only
        const pieData = rechartsData.map((item, index) => ({
          name: item.name,
          value: item[chartData.series[0]?.name] || 0,
          fill: colors[index % colors.length],
        }));

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={config.showDataLabels}
              label={config.showDataLabels ? (entry) => entry.name : undefined}
              outerRadius={config.type === 'donut' ? 120 : 150}
              innerRadius={config.type === 'donut' ? 60 : 0}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            {config.legend?.show && <Legend />}
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid />
            <XAxis
              type="number"
              dataKey="name"
              label={config.xAxis?.title ? { value: config.xAxis.title, position: 'insideBottom', offset: -10 } : undefined}
            />
            <YAxis
              type="number"
              label={config.yAxis?.title ? { value: config.yAxis.title, angle: -90, position: 'insideLeft' } : undefined}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            {config.legend?.show && <Legend />}
            {chartData.series.map((series, index) => (
              <Scatter
                key={series.name}
                name={series.name}
                data={rechartsData}
                fill={series.color || colors[index % colors.length]}
              />
            ))}
          </ScatterChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Chart type "{config.type}" not supported yet
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full p-4 bg-background border rounded-lg">
      {config.title && (
        <h3 className="text-lg font-semibold text-center mb-4">{config.title}</h3>
      )}
      <ResponsiveContainer width="100%" height={config.size?.height || 400}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
