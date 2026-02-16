import { useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';

interface EditableCellProps {
  value: string;
  isEditing: boolean;
  isSelected: boolean;
  isFormula: boolean;
  onStartEdit: () => void;
  onChange: (value: string) => void;
  onStopEdit: (save: boolean) => void;
  style: React.CSSProperties;
  cellKey: string; // For memo comparison
}

/**
 * Optimized EditableCell with React.memo
 * Only re-renders when props actually change
 */
const EditableCellComponent = ({
  value,
  isEditing,
  isSelected,
  isFormula,
  onStartEdit,
  onChange,
  onStopEdit,
  style,
}: EditableCellProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div
        style={style}
        className="border-2 border-primary bg-background absolute z-10"
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onStopEdit(true);
            } else if (e.key === 'Escape') {
              e.preventDefault();
              onStopEdit(false);
            } else if (e.key === 'Tab') {
              e.preventDefault();
              onStopEdit(true);
            }
          }}
          onBlur={() => onStopEdit(true)}
          className="w-full h-full px-2 py-1 text-sm outline-none bg-transparent"
        />
      </div>
    );
  }

  return (
    <div
      style={style}
      className={cn(
        // Removed transition-colors for instant response
        "border-r border-b px-2 py-1 text-sm overflow-hidden text-ellipsis whitespace-nowrap cursor-cell",
        // Use CSS :hover instead of JS state for better performance
        "hover:bg-accent/30",
        isSelected
          ? "bg-primary/10 border-2 border-primary ring-2 ring-primary/20"
          : "bg-background",
        isFormula && "text-primary font-mono text-xs"
      )}
      onDoubleClick={onStartEdit}
      title={value}
    >
      {value}
    </div>
  );
};

// Custom comparison function for memo
// Only re-render if these props actually changed
const areEqual = (prevProps: EditableCellProps, nextProps: EditableCellProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isFormula === nextProps.isFormula &&
    prevProps.cellKey === nextProps.cellKey
    // Don't compare functions - they're stable with useCallback
  );
};

export const EditableCell = memo(EditableCellComponent, areEqual);
