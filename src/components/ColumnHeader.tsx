import { useState } from 'react';
import { ArrowUp, ArrowDown, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import type { SortOrder } from '../core-ts/data-management-types';

interface ColumnHeaderProps {
  column: number;
  label: string;
  sortOrder: SortOrder;
  hasFilter: boolean;
  onSort: (order: SortOrder, multiColumn: boolean) => void;
  onFilter: () => void;
  onClearFilter: () => void;
}

export function ColumnHeader({
  label,
  sortOrder,
  hasFilter,
  onSort,
  onFilter,
  onClearFilter,
}: ColumnHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSort = (order: SortOrder, e: React.MouseEvent) => {
    const multiColumn = e.shiftKey;
    onSort(order, multiColumn);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-between h-full px-2 bg-muted/50 border-r border-b group hover:bg-muted/70 transition-colors">
      <span className="font-semibold text-xs text-muted-foreground select-none">
        {label}
      </span>

      <div className="flex items-center gap-0.5">
        {/* Sort indicator */}
        {sortOrder && (
          <div className="text-primary">
            {sortOrder === 'asc' ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
          </div>
        )}

        {/* Filter indicator */}
        {hasFilter && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              onClearFilter();
            }}
          >
            <Filter className="h-3 w-3 text-primary" />
          </Button>
        )}

        {/* Dropdown menu */}
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                (sortOrder || hasFilter) && "opacity-100"
              )}
            >
              <span className="text-xs">▼</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={(e) => handleSort('asc', e)}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Sort A → Z
              <span className="ml-auto text-xs text-muted-foreground">Shift for multi</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleSort('desc', e)}>
              <ArrowDown className="mr-2 h-4 w-4" />
              Sort Z → A
              <span className="ml-auto text-xs text-muted-foreground">Shift for multi</span>
            </DropdownMenuItem>
            {sortOrder && (
              <DropdownMenuItem onClick={(e) => handleSort(null, e)}>
                <X className="mr-2 h-4 w-4" />
                Clear Sort
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onFilter}>
              <Filter className="mr-2 h-4 w-4" />
              Filter...
            </DropdownMenuItem>
            {hasFilter && (
              <DropdownMenuItem onClick={onClearFilter}>
                <X className="mr-2 h-4 w-4" />
                Clear Filter
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
