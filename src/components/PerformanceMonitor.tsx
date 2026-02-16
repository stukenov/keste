import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Activity, RefreshCw, Trash2 } from 'lucide-react';
import { performanceMonitor, type PerformanceMetrics } from '../utils/performance';

interface PerformanceMonitorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PerformanceMonitor({ open, onOpenChange }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(performanceMonitor.getMetrics());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!open || !autoRefresh) return;

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, [open, autoRefresh]);

  const handleRefresh = () => {
    setMetrics(performanceMonitor.getMetrics());
  };

  const handleClear = () => {
    performanceMonitor.clear();
    setMetrics(performanceMonitor.getMetrics());
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 MB';
    return `${bytes.toFixed(2)} MB`;
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const recentBenchmarks = performanceMonitor.getBenchmarks(10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Monitor
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}
            </Button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              label="Load Time"
              value={formatTime(metrics.loadTime)}
              color="text-blue-500"
            />
            <MetricCard
              label="Render Time"
              value={formatTime(metrics.renderTime)}
              color="text-green-500"
            />
            <MetricCard
              label="Calculation Time"
              value={formatTime(metrics.calculationTime)}
              color="text-yellow-500"
            />
            <MetricCard
              label="Memory Usage"
              value={formatBytes(metrics.memoryUsage)}
              color="text-red-500"
            />
            <MetricCard
              label="Cell Count"
              value={metrics.cellCount.toLocaleString()}
              color="text-purple-500"
            />
            <MetricCard
              label="Formula Count"
              value={metrics.formulaCount.toLocaleString()}
              color="text-indigo-500"
            />
          </div>

          {/* Recent Operations */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Recent Operations</h3>
            <ScrollArea className="h-[200px] border rounded-lg">
              {recentBenchmarks.length > 0 ? (
                <div className="p-2 space-y-1">
                  {recentBenchmarks.map((benchmark, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 text-xs hover:bg-accent rounded"
                    >
                      <span className="font-mono">{benchmark.operation}</span>
                      <span className="text-muted-foreground">
                        {formatTime(benchmark.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No operations recorded yet
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Performance Report */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Full Report</h3>
            <pre className="p-3 bg-muted rounded text-xs font-mono overflow-x-auto">
              {performanceMonitor.generateReport()}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  color: string;
}

function MetricCard({ label, value, color }: MetricCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
