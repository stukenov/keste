import { useMemo, useState, useEffect } from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps } from 'react-window';
import { Table } from 'lucide-react';
import type { SheetModel } from '../core-ts/types';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';

interface GridViewProps {
  sheet: SheetModel;
}

function GridView({ sheet }: GridViewProps) {
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('grid-container');
      if (container) {
        setDimensions({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { maxRow, maxCol, gridData } = useMemo(() => {
    let maxRow = 0;
    let maxCol = 0;
    const data: Map<string, string> = new Map();

    for (const [, cell] of sheet.cells) {
      maxRow = Math.max(maxRow, cell.row);
      maxCol = Math.max(maxCol, cell.col);

      let displayValue = '';
      if (cell.formula) {
        displayValue = `=${cell.formula}`;
      } else if (cell.value !== null && cell.value !== undefined) {
        displayValue = String(cell.value);
      }

      data.set(`${cell.row}-${cell.col}`, displayValue);
    }

    maxRow = Math.max(maxRow, 100);
    maxCol = Math.max(maxCol, 26);

    return { maxRow, maxCol, gridData: data };
  }, [sheet]);

  const colNumToLetter = (num: number): string => {
    let result = '';
    let n = num;
    while (n > 0) {
      const rem = (n - 1) % 26;
      result = String.fromCharCode(65 + rem) + result;
      n = Math.floor((n - 1) / 26);
    }
    return result;
  };

  const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    if (rowIndex === 0 && columnIndex === 0) {
      return (
        <div
          style={style}
          className="border-r border-b bg-muted/50 flex items-center justify-center"
        >
          <Table className="h-3 w-3 text-muted-foreground" />
        </div>
      );
    }

    if (rowIndex === 0) {
      return (
        <div
          style={style}
          className="border-r border-b bg-muted/50 flex items-center justify-center font-semibold text-xs text-muted-foreground"
        >
          {colNumToLetter(columnIndex)}
        </div>
      );
    }

    if (columnIndex === 0) {
      return (
        <div
          style={style}
          className="border-r border-b bg-muted/50 flex items-center justify-center font-semibold text-xs text-muted-foreground"
        >
          {rowIndex}
        </div>
      );
    }

    const value = gridData.get(`${rowIndex}-${columnIndex}`) || '';
    const hasFormula = value.startsWith('=');

    return (
      <div
        style={style}
        className={cn(
          "border-r border-b px-2 py-1 text-sm overflow-hidden text-ellipsis whitespace-nowrap bg-background hover:bg-accent/50 transition-colors",
          hasFormula && "text-primary font-mono text-xs"
        )}
        title={value}
      >
        {value}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{sheet.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {sheet.cells.size.toLocaleString()} cells · {maxRow.toLocaleString()} rows × {maxCol} columns
            </p>
          </div>
        </div>
      </div>

      <div id="grid-container" className="flex-1 p-4">
        <Card className="h-full overflow-hidden shadow-sm">
          <Grid
            columnCount={maxCol + 1}
            columnWidth={120}
            height={dimensions.height - 140}
            rowCount={maxRow + 1}
            rowHeight={32}
            width={dimensions.width - 32}
            className="font-sans"
          >
            {Cell}
          </Grid>
        </Card>
      </div>
    </div>
  );
}

export default GridView;
