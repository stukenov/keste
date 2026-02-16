import { useState, useMemo } from 'react';
import { Filter, Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { FilterCondition } from '../core-ts/data-management-types';
import type { SheetModel } from '../core-ts/types';

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: number;
  sheet: SheetModel;
  currentFilter: FilterCondition | null;
  onApply: (condition: FilterCondition | null) => void;
}

export function FilterDialog({
  open,
  onOpenChange,
  column,
  sheet,
  currentFilter,
  onApply,
}: FilterDialogProps) {
  const [filterType, setFilterType] = useState<'value' | 'condition'>(
    currentFilter?.type === 'condition' ? 'condition' : 'value'
  );
  const [searchText, setSearchText] = useState('');
  const [selectedValues, setSelectedValues] = useState<Set<string>>(
    () => currentFilter?.type === 'value' && currentFilter.values
      ? new Set(currentFilter.values)
      : new Set()
  );
  const [conditionOperator, setConditionOperator] = useState<string>(
    currentFilter?.type === 'condition' && currentFilter.operator
      ? currentFilter.operator
      : 'contains'
  );
  const [conditionValue, setConditionValue] = useState(
    currentFilter?.type === 'condition' && currentFilter.value
      ? String(currentFilter.value)
      : ''
  );

  // Get unique values for the column
  const uniqueValues = useMemo(() => {
    const values = new Set<string>();
    for (const [, cell] of sheet.cells) {
      if (cell.col === column) {
        values.add(String(cell.value ?? ''));
      }
    }
    return Array.from(values).sort();
  }, [sheet.cells, column]);

  const filteredValues = useMemo(() => {
    if (!searchText) return uniqueValues;
    const search = searchText.toLowerCase();
    return uniqueValues.filter(v => v.toLowerCase().includes(search));
  }, [uniqueValues, searchText]);

  const handleToggleValue = (value: string) => {
    const newSelected = new Set(selectedValues);
    if (newSelected.has(value)) {
      newSelected.delete(value);
    } else {
      newSelected.add(value);
    }
    setSelectedValues(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedValues(new Set(filteredValues));
  };

  const handleClearAll = () => {
    setSelectedValues(new Set());
  };

  const handleApply = () => {
    if (filterType === 'value') {
      if (selectedValues.size === 0) {
        onApply(null);
      } else {
        onApply({
          type: 'value',
          values: selectedValues,
        });
      }
    } else {
      if (!conditionValue) {
        onApply(null);
      } else {
        onApply({
          type: 'condition',
          operator: conditionOperator as any,
          value: conditionValue,
        });
      }
    }
    onOpenChange(false);
  };

  const handleClear = () => {
    onApply(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Column {String.fromCharCode(64 + column)}
          </DialogTitle>
          <DialogDescription>
            Choose how to filter this column
          </DialogDescription>
        </DialogHeader>

        <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="value">Filter by Values</TabsTrigger>
            <TabsTrigger value="condition">Filter by Condition</TabsTrigger>
          </TabsList>

          <TabsContent value="value" className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search values..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Select/Clear All */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex-1"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="flex-1"
              >
                Clear All
              </Button>
            </div>

            {/* Values list */}
            <ScrollArea className="h-[300px] border rounded-md p-2">
              <div className="space-y-2">
                {filteredValues.map((value) => (
                  <div key={value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`value-${value}`}
                      checked={selectedValues.has(value)}
                      onCheckedChange={() => handleToggleValue(value)}
                    />
                    <label
                      htmlFor={`value-${value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {value || '(blank)'}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="text-xs text-muted-foreground">
              {selectedValues.size} of {uniqueValues.length} selected
            </div>
          </TabsContent>

          <TabsContent value="condition" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Condition</label>
              <Select value={conditionOperator} onValueChange={setConditionOperator}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="startsWith">Starts with</SelectItem>
                  <SelectItem value="endsWith">Ends with</SelectItem>
                  <SelectItem value="greaterThan">Greater than</SelectItem>
                  <SelectItem value="lessThan">Less than</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Value</label>
              <Input
                placeholder="Enter value..."
                value={conditionValue}
                onChange={(e) => setConditionValue(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClear}>
            <X className="mr-2 h-4 w-4" />
            Clear Filter
          </Button>
          <Button onClick={handleApply}>
            <Filter className="mr-2 h-4 w-4" />
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
