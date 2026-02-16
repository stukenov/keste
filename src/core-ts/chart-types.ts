/**
 * Chart types and interfaces for Keste Phase 8
 * Visualization & Charts support
 */

export type ChartType =
  | 'column'
  | 'bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'combo';

export type ChartSubType =
  | 'clustered'
  | 'stacked'
  | 'stacked100'
  | 'line-markers'
  | 'exploded';

export interface ChartDataRange {
  sheetId: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  includeHeaders?: boolean;
}

export interface ChartSeries {
  name: string;
  dataRange: ChartDataRange;
  color?: string;
}

export interface ChartAxisConfig {
  title?: string;
  min?: number;
  max?: number;
  gridlines?: boolean;
  format?: string;
}

export interface ChartLegendConfig {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface ChartConfig {
  id: string;
  type: ChartType;
  subType?: ChartSubType;
  title?: string;

  // Data
  categoryRange?: ChartDataRange; // X-axis categories
  series: ChartSeries[]; // Y-axis data series

  // Customization
  xAxis?: ChartAxisConfig;
  yAxis?: ChartAxisConfig;
  legend?: ChartLegendConfig;
  colors?: string[];
  showDataLabels?: boolean;

  // Position & Size
  position?: {
    row: number;
    col: number;
  };
  size?: {
    width: number;
    height: number;
  };
}

export interface ChartData {
  categories: string[];
  series: Array<{
    name: string;
    data: number[];
    color?: string;
  }>;
}

export interface SparklineConfig {
  type: 'line' | 'column' | 'winloss';
  dataRange: ChartDataRange;
  color?: string;
  showMarkers?: boolean;
  showMinMax?: boolean;
}

// Default chart configurations
export const DEFAULT_CHART_CONFIG: Partial<ChartConfig> = {
  legend: {
    show: true,
    position: 'right',
  },
  xAxis: {
    gridlines: true,
  },
  yAxis: {
    gridlines: true,
  },
  colors: [
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#14b8a6', // teal-500
    '#f97316', // orange-500
  ],
  showDataLabels: false,
  size: {
    width: 600,
    height: 400,
  },
};

export const CHART_TYPE_LABELS: Record<ChartType, string> = {
  column: 'Column Chart',
  bar: 'Bar Chart',
  line: 'Line Chart',
  area: 'Area Chart',
  pie: 'Pie Chart',
  donut: 'Donut Chart',
  scatter: 'Scatter Chart',
  combo: 'Combo Chart',
};

export const CHART_SUBTYPE_LABELS: Record<ChartSubType, string> = {
  clustered: 'Clustered',
  stacked: 'Stacked',
  stacked100: '100% Stacked',
  'line-markers': 'Line with Markers',
  exploded: 'Exploded',
};
