import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { SheetModel } from '../core-ts/types';

interface SheetTabsProps {
  sheets: SheetModel[];
  selectedIndex: number;
  onSelectSheet: (index: number) => void;
  onAddSheet?: () => void;
}

function SheetTabs({ sheets, selectedIndex, onSelectSheet, onAddSheet }: SheetTabsProps) {
  return (
    <div className="flex items-center border-t bg-card">
      {/* Sheet navigation controls */}
      <div className="flex items-center border-r px-1">
        {/* Tab scroll buttons would go here */}
      </div>

      {/* Sheet tabs */}
      <div className="flex items-center flex-1 overflow-x-auto scrollbar-thin">
        {sheets.map((sheet, index) => (
          <button
            key={sheet.id}
            onClick={() => onSelectSheet(index)}
            className={cn(
              "px-4 py-2 text-xs font-medium border-r transition-colors relative",
              selectedIndex === index
                ? "bg-background text-foreground border-t-2 border-t-primary -mt-[2px]"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            )}
          >
            {sheet.name}
            {selectedIndex === index && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}

        {/* Add sheet button */}
        {onAddSheet && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 ml-1"
            onClick={onAddSheet}
            title="Add sheet"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Status bar area */}
      <div className="flex items-center gap-4 px-4 py-1 text-xs text-muted-foreground border-l">
        <span>Ready</span>
      </div>
    </div>
  );
}

export default SheetTabs;
