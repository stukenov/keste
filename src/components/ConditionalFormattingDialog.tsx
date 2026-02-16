import { useState } from 'react';
import { Palette } from 'lucide-react';
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
import type {
  ConditionalFormattingRuleEntry,
  ConditionalFormattingRule,
  ConditionalFormat,
} from '../core-ts/data-management-types';

interface ConditionalFormattingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (rule: ConditionalFormattingRuleEntry) => void;
}

export function ConditionalFormattingDialog({
  open,
  onOpenChange,
  onApply,
}: ConditionalFormattingDialogProps) {
  const [ruleType, setRuleType] = useState<ConditionalFormattingRule['type']>('cellValue');
  const [range, setRange] = useState('A1:A10');

  // Cell value rule
  const [operator, setOperator] = useState<'greaterThan' | 'lessThan' | 'between' | 'equals'>('greaterThan');
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');

  // Top/Bottom rule
  const [rank, setRank] = useState('10');
  const [isTop, setIsTop] = useState(true);

  // Data bar rule
  const [dataBarColor, setDataBarColor] = useState('#3b82f6');

  // Color scale rule
  const [colorScaleColors] = useState(['#ef4444', '#fbbf24', '#22c55e']);

  // Icon set rule
  const [iconSetType] = useState<'arrows' | 'ratings' | 'indicators'>('arrows');

  // Formatting
  const [backgroundColor, setBackgroundColor] = useState('#22c55e');
  const [fontColor, setFontColor] = useState('#000000');
  const [fontBold, setFontBold] = useState(false);
  const [fontItalic, setFontItalic] = useState(false);

  const handleApply = () => {
    let rule: ConditionalFormattingRule;
    const format: ConditionalFormat = {
      backgroundColor,
      fontColor,
      fontBold,
      fontItalic,
    };

    switch (ruleType) {
      case 'cellValue': {
        const val1 = isNaN(Number(value1)) ? value1 : Number(value1);
        const val2 = operator === 'between' && !isNaN(Number(value2)) ? Number(value2) : value2;

        rule = {
          type: 'cellValue',
          operator,
          value: val1,
          value2: operator === 'between' ? val2 : undefined,
          format,
        };
        break;
      }

      case 'topBottom':
        rule = {
          type: 'topBottom',
          rank: Number(rank),
          isTop,
          format,
        };
        break;

      case 'dataBar':
        rule = {
          type: 'dataBar',
          color: dataBarColor,
        };
        break;

      case 'colorScale':
        rule = {
          type: 'colorScale',
          colors: colorScaleColors,
        };
        break;

      case 'iconSet':
        rule = {
          type: 'iconSet',
          iconSetType,
        };
        break;

      case 'customFormula':
        rule = {
          type: 'customFormula',
          formula: '',
          format,
        };
        break;

      default:
        return;
    }

    const ruleEntry: ConditionalFormattingRuleEntry = {
      range,
      rule,
      priority: 0, // Will be set by the manager
    };

    onApply(ruleEntry);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Conditional Formatting
          </DialogTitle>
          <DialogDescription>
            Highlight cells based on their values
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Apply to Range</label>
            <Input
              placeholder="e.g. A1:B10"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            />
          </div>

          {/* Rule Type */}
          <Tabs value={ruleType} onValueChange={(v) => setRuleType(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cellValue">Cell Value</TabsTrigger>
              <TabsTrigger value="topBottom">Top/Bottom</TabsTrigger>
              <TabsTrigger value="dataBar">Data Bar</TabsTrigger>
            </TabsList>

            <TabsContent value="cellValue" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Condition</label>
                <Select value={operator} onValueChange={(v) => setOperator(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="greaterThan">Greater than</SelectItem>
                    <SelectItem value="lessThan">Less than</SelectItem>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="between">Between</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Value</label>
                  <Input
                    placeholder="Enter value..."
                    value={value1}
                    onChange={(e) => setValue1(e.target.value)}
                  />
                </div>
                {operator === 'between' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">And</label>
                    <Input
                      placeholder="Enter value..."
                      value={value2}
                      onChange={(e) => setValue2(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Formatting */}
              <div className="pt-4 border-t space-y-4">
                <h4 className="text-sm font-medium">Format</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Background Color</label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-20"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Font Color</label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        className="w-20"
                      />
                      <Input
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={fontBold}
                      onChange={(e) => setFontBold(e.target.checked)}
                    />
                    <span className="text-sm font-medium">Bold</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={fontItalic}
                      onChange={(e) => setFontItalic(e.target.checked)}
                    />
                    <span className="text-sm font-medium">Italic</span>
                  </label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="topBottom" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rule Type</label>
                <Select value={isTop ? 'top' : 'bottom'} onValueChange={(v) => setIsTop(v === 'top')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rank</label>
                <Input
                  type="number"
                  placeholder="10"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                />
              </div>

              {/* Formatting */}
              <div className="pt-4 border-t space-y-4">
                <h4 className="text-sm font-medium">Format</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Background Color</label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-20"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Font Color</label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        className="w-20"
                      />
                      <Input
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="dataBar" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bar Color</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={dataBarColor}
                    onChange={(e) => setDataBarColor(e.target.value)}
                    className="w-20"
                  />
                  <Input
                    value={dataBarColor}
                    onChange={(e) => setDataBarColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  Data bars will be displayed based on cell values in the range.
                  Higher values will show longer bars.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            <Palette className="mr-2 h-4 w-4" />
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
