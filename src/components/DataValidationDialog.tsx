import { useState } from 'react';
import { Shield, Plus, Trash2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { CellValidation, ValidationRule } from '../core-ts/data-management-types';

interface DataValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: number;
  col: number;
  currentValidation: CellValidation | null;
  onApply: (validation: CellValidation | null) => void;
}

export function DataValidationDialog({
  open,
  onOpenChange,
  row,
  col,
  currentValidation,
  onApply,
}: DataValidationDialogProps) {
  const [ruleType, setRuleType] = useState<ValidationRule['type']>(
    currentValidation?.rule.type || 'list'
  );

  // List validation
  const [listValues, setListValues] = useState<string[]>(
    currentValidation?.rule.type === 'list' ? currentValidation.rule.values : []
  );
  const [newListValue, setNewListValue] = useState('');

  // Number validation
  const [numberMin, setNumberMin] = useState<string>(
    currentValidation?.rule.type === 'number' && currentValidation.rule.min !== undefined
      ? String(currentValidation.rule.min)
      : ''
  );
  const [numberMax, setNumberMax] = useState<string>(
    currentValidation?.rule.type === 'number' && currentValidation.rule.max !== undefined
      ? String(currentValidation.rule.max)
      : ''
  );

  // Text length validation
  const [textMin, setTextMin] = useState<string>(
    currentValidation?.rule.type === 'textLength' && currentValidation.rule.min !== undefined
      ? String(currentValidation.rule.min)
      : ''
  );
  const [textMax, setTextMax] = useState<string>(
    currentValidation?.rule.type === 'textLength' && currentValidation.rule.max !== undefined
      ? String(currentValidation.rule.max)
      : ''
  );

  // Messages
  const [inputMessage, setInputMessage] = useState(
    currentValidation?.inputMessage || ''
  );
  const [errorMessage, setErrorMessage] = useState(
    currentValidation?.errorMessage || 'Invalid value'
  );
  const [errorStyle, setErrorStyle] = useState<'stop' | 'warning' | 'information'>(
    currentValidation?.errorStyle || 'stop'
  );

  const handleAddListValue = () => {
    if (newListValue && !listValues.includes(newListValue)) {
      setListValues([...listValues, newListValue]);
      setNewListValue('');
    }
  };

  const handleRemoveListValue = (index: number) => {
    setListValues(listValues.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    let rule: ValidationRule;

    switch (ruleType) {
      case 'list':
        if (listValues.length === 0) {
          onApply(null);
          onOpenChange(false);
          return;
        }
        rule = { type: 'list', values: listValues };
        break;

      case 'number': {
        const min = numberMin ? Number(numberMin) : undefined;
        const max = numberMax ? Number(numberMax) : undefined;
        if (min === undefined && max === undefined) {
          onApply(null);
          onOpenChange(false);
          return;
        }
        rule = { type: 'number', min, max };
        break;
      }

      case 'date':
        // TODO: Implement date validation
        rule = { type: 'date' };
        break;

      case 'textLength': {
        const min = textMin ? Number(textMin) : undefined;
        const max = textMax ? Number(textMax) : undefined;
        if (min === undefined && max === undefined) {
          onApply(null);
          onOpenChange(false);
          return;
        }
        rule = { type: 'textLength', min, max };
        break;
      }

      case 'custom':
        // TODO: Implement custom formula validation
        rule = { type: 'custom', formula: '' };
        break;

      default:
        onApply(null);
        onOpenChange(false);
        return;
    }

    const validation: CellValidation = {
      row,
      col,
      rule,
      inputMessage: inputMessage || undefined,
      errorMessage: errorMessage || undefined,
      errorStyle,
    };

    onApply(validation);
    onOpenChange(false);
  };

  const handleRemove = () => {
    onApply(null);
    onOpenChange(false);
  };

  const columnLabel = String.fromCharCode(64 + col);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Validation - {columnLabel}{row}
          </DialogTitle>
          <DialogDescription>
            Set rules to validate data entry
          </DialogDescription>
        </DialogHeader>

        <Tabs value={ruleType} onValueChange={(v) => setRuleType(v as ValidationRule['type'])}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="number">Number</TabsTrigger>
            <TabsTrigger value="textLength">Text</TabsTrigger>
            <TabsTrigger value="date" disabled>Date</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Allowed Values</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add value..."
                  value={newListValue}
                  onChange={(e) => setNewListValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddListValue();
                    }
                  }}
                />
                <Button onClick={handleAddListValue} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {listValues.length > 0 && (
              <div className="border rounded-md p-2 space-y-1 max-h-40 overflow-y-auto">
                {listValues.map((value, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded"
                  >
                    <span className="text-sm">{value}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveListValue(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="number" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum</label>
                <Input
                  type="number"
                  placeholder="Min value..."
                  value={numberMin}
                  onChange={(e) => setNumberMin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum</label>
                <Input
                  type="number"
                  placeholder="Max value..."
                  value={numberMax}
                  onChange={(e) => setNumberMax(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="textLength" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Length</label>
                <Input
                  type="number"
                  placeholder="Min length..."
                  value={textMin}
                  onChange={(e) => setTextMin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum Length</label>
                <Input
                  type="number"
                  placeholder="Max length..."
                  value={textMax}
                  onChange={(e) => setTextMax(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="date" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Date validation coming soon...
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <label className="text-sm font-medium">Input Message (optional)</label>
            <Input
              placeholder="Message when cell is selected..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Error Message</label>
            <Input
              placeholder="Message for invalid data..."
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Error Style</label>
            <Select value={errorStyle} onValueChange={(v) => setErrorStyle(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stop">Stop (Prevent invalid entry)</SelectItem>
                <SelectItem value="warning">Warning (Allow with warning)</SelectItem>
                <SelectItem value="information">Information (Show info only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleRemove}>
            <Trash2 className="mr-2 h-4 w-4" />
            Remove Validation
          </Button>
          <Button onClick={handleApply}>
            <Shield className="mr-2 h-4 w-4" />
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
