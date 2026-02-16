import { useState } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import {
  Grid3x3,
  Square,
  MinusSquare,
  Frame
} from 'lucide-react';
import type { BorderStyle } from '../core-ts/style-types';

interface BorderPickerProps {
  onApplyBorder: (sides: BorderSides, style: BorderStyle) => void;
  disabled?: boolean;
}

export interface BorderSides {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
}

const BORDER_STYLES: Array<{ value: BorderStyle['style'], label: string }> = [
  { value: 'thin', label: 'Thin' },
  { value: 'medium', label: 'Medium' },
  { value: 'thick', label: 'Thick' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'double', label: 'Double' },
];

const BORDER_PRESETS: Array<{
  icon: React.ReactNode;
  label: string;
  sides: BorderSides;
}> = [
  {
    icon: <Grid3x3 className="h-4 w-4" />,
    label: 'All Borders',
    sides: { top: true, right: true, bottom: true, left: true },
  },
  {
    icon: <Square className="h-4 w-4" />,
    label: 'Outside Borders',
    sides: { top: true, right: true, bottom: true, left: true },
  },
  {
    icon: <Frame className="h-4 w-4" />,
    label: 'Top Border',
    sides: { top: true },
  },
  {
    icon: <Frame className="h-4 w-4" />,
    label: 'Bottom Border',
    sides: { bottom: true },
  },
  {
    icon: <Frame className="h-4 w-4" />,
    label: 'Left Border',
    sides: { left: true },
  },
  {
    icon: <Frame className="h-4 w-4" />,
    label: 'Right Border',
    sides: { right: true },
  },
  {
    icon: <MinusSquare className="h-4 w-4" />,
    label: 'No Border',
    sides: {},
  },
];

export function BorderPicker({ onApplyBorder, disabled }: BorderPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<BorderStyle['style']>('thin');
  const [selectedColor, setSelectedColor] = useState('#000000');

  const handleApplyPreset = (sides: BorderSides) => {
    const borderStyle: BorderStyle = {
      style: selectedStyle,
      color: selectedColor,
    };
    onApplyBorder(sides, borderStyle);
    setOpen(false);
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
              <Grid3x3 className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-semibold">Borders</div>
            <div className="text-xs opacity-70">Add cell borders</div>
          </div>
        </TooltipContent>
      </Tooltip>

      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          {/* Border Style Selection */}
          <div>
            <label className="text-xs font-semibold mb-2 block">Border Style</label>
            <div className="grid grid-cols-3 gap-1">
              {BORDER_STYLES.map((style) => (
                <Button
                  key={style.value}
                  variant={selectedStyle === style.value ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setSelectedStyle(style.value)}
                >
                  {style.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Border Color */}
          <div>
            <label className="text-xs font-semibold mb-2 block">Border Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="h-8 w-16 rounded border cursor-pointer"
              />
              <span className="text-xs text-muted-foreground">{selectedColor}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t my-2" />

          {/* Border Presets */}
          <div>
            <label className="text-xs font-semibold mb-2 block">Quick Presets</label>
            <div className="grid grid-cols-2 gap-1">
              {BORDER_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="h-9 justify-start text-xs"
                  onClick={() => handleApplyPreset(preset.sides)}
                >
                  {preset.icon}
                  <span className="ml-2">{preset.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
