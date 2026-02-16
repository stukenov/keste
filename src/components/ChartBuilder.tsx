import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart3, LineChart, PieChart, AreaChart, ScatterChart } from 'lucide-react';
import type { ChartConfig, ChartType, ChartSubType } from '../core-ts/chart-types';
import { CHART_TYPE_LABELS, CHART_SUBTYPE_LABELS, DEFAULT_CHART_CONFIG } from '../core-ts/chart-types';

interface ChartBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateChart: (config: ChartConfig) => void;
  currentSheetId: string;
}

const CHART_TYPES: Array<{ value: ChartType; icon: React.ReactNode; label: string }> = [
  { value: 'column', icon: <BarChart3 className="h-6 w-6" />, label: 'Column' },
  { value: 'bar', icon: <BarChart3 className="h-6 w-6 rotate-90" />, label: 'Bar' },
  { value: 'line', icon: <LineChart className="h-6 w-6" />, label: 'Line' },
  { value: 'area', icon: <AreaChart className="h-6 w-6" />, label: 'Area' },
  { value: 'pie', icon: <PieChart className="h-6 w-6" />, label: 'Pie' },
  { value: 'scatter', icon: <ScatterChart className="h-6 w-6" />, label: 'Scatter' },
];

const SUBTYPES_BY_TYPE: Record<ChartType, ChartSubType[]> = {
  column: ['clustered', 'stacked', 'stacked100'],
  bar: ['clustered', 'stacked', 'stacked100'],
  line: ['line-markers', 'stacked'],
  area: ['stacked'],
  pie: ['exploded'],
  donut: [],
  scatter: [],
  combo: [],
};

export function ChartBuilder({ open, onOpenChange, onCreateChart, currentSheetId }: ChartBuilderProps) {
  const [step, setStep] = useState(1);
  const [chartType, setChartType] = useState<ChartType>('column');
  const [chartSubType, setChartSubType] = useState<ChartSubType | undefined>();
  const [chartTitle, setChartTitle] = useState('');

  // Data range inputs
  const [categoryRange, setCategoryRange] = useState('A1:A10');
  const [dataRange, setDataRange] = useState('B1:B10');
  const [seriesName, setSeriesName] = useState('Series 1');

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const parseRange = (range: string) => {
    // Simple parser: "A1:B10" -> { startRow: 1, startCol: 1, endRow: 10, endCol: 2 }
    const match = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
    if (!match) return null;

    const colToNum = (col: string) => {
      let num = 0;
      for (let i = 0; i < col.length; i++) {
        num = num * 26 + (col.charCodeAt(i) - 64);
      }
      return num;
    };

    return {
      sheetId: currentSheetId,
      startRow: parseInt(match[2]),
      startCol: colToNum(match[1]),
      endRow: parseInt(match[4]),
      endCol: colToNum(match[3]),
      includeHeaders: true,
    };
  };

  const handleCreate = () => {
    const categoryRangeParsed = parseRange(categoryRange);
    const dataRangeParsed = parseRange(dataRange);

    if (!categoryRangeParsed || !dataRangeParsed) {
      alert('Invalid range format. Use format like "A1:A10"');
      return;
    }

    const config: ChartConfig = {
      id: `chart-${Date.now()}`,
      type: chartType,
      subType: chartSubType,
      title: chartTitle || CHART_TYPE_LABELS[chartType],
      categoryRange: categoryRangeParsed,
      series: [
        {
          name: seriesName || 'Series 1',
          dataRange: dataRangeParsed,
        },
      ],
      ...DEFAULT_CHART_CONFIG,
    };

    onCreateChart(config);
    onOpenChange(false);

    // Reset form
    setStep(1);
    setChartTitle('');
    setCategoryRange('A1:A10');
    setDataRange('B1:B10');
    setSeriesName('Series 1');
  };

  const availableSubTypes = SUBTYPES_BY_TYPE[chartType] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Chart - Step {step} of 3</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Select Chart Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Select Chart Type</h3>
              <div className="grid grid-cols-3 gap-3">
                {CHART_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant={chartType === type.value ? 'default' : 'outline'}
                    className="h-24 flex-col gap-2"
                    onClick={() => {
                      setChartType(type.value);
                      setChartSubType(undefined);
                    }}
                  >
                    {type.icon}
                    <span className="text-xs">{type.label}</span>
                  </Button>
                ))}
              </div>

              {availableSubTypes.length > 0 && (
                <div className="space-y-2">
                  <Label>Chart Variant</Label>
                  <Select
                    value={chartSubType}
                    onValueChange={(value) => setChartSubType(value as ChartSubType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubTypes.map((subType) => (
                        <SelectItem key={subType} value={subType}>
                          {CHART_SUBTYPE_LABELS[subType]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Data Range */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Select Data Range</h3>

              <div className="space-y-2">
                <Label htmlFor="category-range">Category Range (X-axis)</Label>
                <Input
                  id="category-range"
                  value={categoryRange}
                  onChange={(e) => setCategoryRange(e.target.value)}
                  placeholder="A1:A10"
                />
                <p className="text-xs text-muted-foreground">
                  Example: A1:A10 (column A, rows 1-10)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-range">Data Range (Y-axis)</Label>
                <Input
                  id="data-range"
                  value={dataRange}
                  onChange={(e) => setDataRange(e.target.value)}
                  placeholder="B1:B10"
                />
                <p className="text-xs text-muted-foreground">
                  Example: B1:B10 (column B, rows 1-10)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="series-name">Series Name</Label>
                <Input
                  id="series-name"
                  value={seriesName}
                  onChange={(e) => setSeriesName(e.target.value)}
                  placeholder="Series 1"
                />
              </div>
            </div>
          )}

          {/* Step 3: Customize Chart */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Customize Chart</h3>

              <div className="space-y-2">
                <Label htmlFor="chart-title">Chart Title</Label>
                <Input
                  id="chart-title"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  placeholder={CHART_TYPE_LABELS[chartType]}
                />
              </div>

              <div className="p-4 border rounded-lg bg-muted/30">
                <h4 className="text-sm font-semibold mb-2">Chart Preview</h4>
                <div className="flex items-center justify-center h-48 bg-background rounded border">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Chart preview will appear here</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold">Type:</span> {CHART_TYPE_LABELS[chartType]}
                </div>
                {chartSubType && (
                  <div>
                    <span className="font-semibold">Variant:</span> {CHART_SUBTYPE_LABELS[chartSubType]}
                  </div>
                )}
                <div>
                  <span className="font-semibold">Categories:</span> {categoryRange}
                </div>
                <div>
                  <span className="font-semibold">Data:</span> {dataRange}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {step < 3 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleCreate}>
                  Create Chart
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
