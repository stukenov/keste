import { FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SheetModel } from '../core-ts/types';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

interface SheetNavProps {
  sheets: SheetModel[];
  selectedIndex: number;
  onSelectSheet: (index: number) => void;
}

function SheetNav({ sheets, selectedIndex, onSelectSheet }: SheetNavProps) {
  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          Worksheets
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {sheets.length} sheet{sheets.length !== 1 ? 's' : ''}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sheets.map((sheet, index) => (
            <motion.button
              key={sheet.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectSheet(index)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                index === selectedIndex
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <FileSpreadsheet className="h-4 w-4 flex-shrink-0" />
              <div className="flex-1 text-left truncate">
                <div className="truncate">{sheet.name}</div>
                <div className={cn(
                  "text-xs mt-0.5",
                  index === selectedIndex ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {sheet.cells.size} cells
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default SheetNav;
