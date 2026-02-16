import { Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormulaBarProps {
  cellReference: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  onFocus: () => void;
}

export function FormulaBar({
  cellReference,
  value,
  isEditing,
  onChange,
  onFocus,
}: FormulaBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="border-b bg-card px-4 py-2 flex items-center gap-4">
      {/* Cell Reference */}
      <div className="flex items-center gap-2 min-w-[100px]">
        <div className="w-20 px-2 py-1 bg-muted rounded text-sm font-mono font-semibold text-center">
          {cellReference || 'A1'}
        </div>
      </div>

      {/* Formula Icon */}
      <div className="flex items-center justify-center w-8 h-8 text-muted-foreground">
        <Calculator className="h-4 w-4" />
      </div>

      {/* Formula Input */}
      <div className="flex-1">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={onFocus}
          onKeyDown={handleKeyDown}
          placeholder="Enter value or formula (=SUM(A1:A10))"
          className={cn(
            "w-full px-3 py-1.5 text-sm border rounded-md outline-none transition-colors",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            isEditing ? "bg-background" : "bg-muted/30",
            value.startsWith('=') && "font-mono text-primary"
          )}
        />
      </div>
    </div>
  );
}
