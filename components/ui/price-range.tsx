// components/ui/price-range.tsx
import { Euro } from 'lucide-react';

interface PriceRangeProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

export function PriceRange({ value, onChange, readonly = false }: PriceRangeProps) {
  const ranges = [1, 2, 3, 4, 5];

  return (
    <div className="flex gap-2">
      {ranges.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => !readonly && onChange?.(range)}
          disabled={readonly}
          className={`p-2 rounded-md transition-colors ${
            range <= value 
              ? 'text-primary bg-primary/10' 
              : 'text-muted-foreground bg-transparent'
          }`}
        >
          <Euro className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}