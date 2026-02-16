import { useState } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Hash, Percent, DollarSign, Calendar } from 'lucide-react';

interface NumberFormatPickerProps {
  currentFormat?: string;
  onApplyFormat: (formatCode: string) => void;
  disabled?: boolean;
}

const NUMBER_FORMATS = [
  {
    category: 'General',
    formats: [
      { code: 'General', label: 'General', example: '1000' },
      { code: '0', label: 'Number', example: '1000' },
      { code: '0.00', label: 'Number (2 decimals)', example: '1000.00' },
      { code: '#,##0', label: 'Number with separator', example: '1,000' },
      { code: '#,##0.00', label: 'Number with separator (2 decimals)', example: '1,000.00' },
    ],
  },
  {
    category: 'Currency',
    formats: [
      { code: '$#,##0', label: 'Currency', example: '$1,000' },
      { code: '$#,##0.00', label: 'Currency (2 decimals)', example: '$1,000.00' },
      { code: '€#,##0.00', label: 'Euro', example: '€1,000.00' },
      { code: '£#,##0.00', label: 'Pound', example: '£1,000.00' },
      { code: '¥#,##0', label: 'Yen', example: '¥1,000' },
    ],
  },
  {
    category: 'Percentage',
    formats: [
      { code: '0%', label: 'Percentage', example: '10%' },
      { code: '0.0%', label: 'Percentage (1 decimal)', example: '10.0%' },
      { code: '0.00%', label: 'Percentage (2 decimals)', example: '10.00%' },
    ],
  },
  {
    category: 'Date/Time',
    formats: [
      { code: 'MM/DD/YYYY', label: 'Date (MM/DD/YYYY)', example: '12/31/2025' },
      { code: 'DD/MM/YYYY', label: 'Date (DD/MM/YYYY)', example: '31/12/2025' },
      { code: 'YYYY-MM-DD', label: 'Date (YYYY-MM-DD)', example: '2025-12-31' },
      { code: 'MMM DD, YYYY', label: 'Date (MMM DD, YYYY)', example: 'Dec 31, 2025' },
      { code: 'HH:MM:SS', label: 'Time (24-hour)', example: '14:30:00' },
      { code: 'hh:MM:SS AM/PM', label: 'Time (12-hour)', example: '02:30:00 PM' },
      { code: 'MM/DD/YYYY HH:MM', label: 'Date and Time', example: '12/31/2025 14:30' },
    ],
  },
  {
    category: 'Scientific',
    formats: [
      { code: '0.00E+00', label: 'Scientific', example: '1.00E+03' },
      { code: '0.000E+00', label: 'Scientific (3 decimals)', example: '1.000E+03' },
    ],
  },
  {
    category: 'Fraction',
    formats: [
      { code: '# ?/?', label: 'Fraction (1 digit)', example: '1 1/2' },
      { code: '# ??/??', label: 'Fraction (2 digits)', example: '1 10/25' },
    ],
  },
  {
    category: 'Text',
    formats: [
      { code: '@', label: 'Text', example: 'Text' },
    ],
  },
];

export function NumberFormatPicker({ currentFormat = 'General', onApplyFormat, disabled }: NumberFormatPickerProps) {
  const [open, setOpen] = useState(false);
  const [customFormat, setCustomFormat] = useState('');

  const handleApplyFormat = (formatCode: string) => {
    onApplyFormat(formatCode);
    setOpen(false);
  };

  const handleApplyCustom = () => {
    if (customFormat.trim()) {
      onApplyFormat(customFormat);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={disabled}
            >
              <Hash className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-semibold">Number Format</div>
            <div className="text-xs opacity-70">Format numbers, dates, currency</div>
          </div>
        </TooltipContent>
      </Tooltip>

      <PopoverContent className="w-96 p-0" align="start">
        <div className="max-h-[500px] overflow-y-auto">
          {/* Current Format Display */}
          <div className="sticky top-0 bg-background border-b p-3">
            <div className="text-xs font-semibold text-muted-foreground">Current Format</div>
            <div className="text-sm font-mono mt-1">{currentFormat}</div>
          </div>

          {/* Format Categories */}
          {NUMBER_FORMATS.map((category) => (
            <div key={category.category} className="border-b last:border-b-0">
              <div className="bg-muted/50 px-3 py-2">
                <h3 className="text-xs font-semibold flex items-center gap-2">
                  {category.category === 'Currency' && <DollarSign className="h-3 w-3" />}
                  {category.category === 'Percentage' && <Percent className="h-3 w-3" />}
                  {category.category === 'Date/Time' && <Calendar className="h-3 w-3" />}
                  {category.category}
                </h3>
              </div>
              <div className="p-2 space-y-1">
                {category.formats.map((format) => (
                  <Button
                    key={format.code}
                    variant={currentFormat === format.code ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-full justify-between h-auto py-2 px-3"
                    onClick={() => handleApplyFormat(format.code)}
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-xs font-medium">{format.label}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {format.code}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{format.example}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}

          {/* Custom Format */}
          <div className="border-t p-3 bg-muted/30">
            <label className="text-xs font-semibold mb-2 block">Custom Format</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customFormat}
                onChange={(e) => setCustomFormat(e.target.value)}
                placeholder="e.g., #,##0.00"
                className="flex-1 h-8 px-2 text-xs border rounded bg-background"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleApplyCustom();
                  }
                }}
              />
              <Button
                size="sm"
                onClick={handleApplyCustom}
                disabled={!customFormat.trim()}
                className="h-8"
              >
                Apply
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use Excel-style format codes (e.g., 0, #,##0.00, @)
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
