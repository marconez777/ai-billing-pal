import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SplitBadgeProps {
  totalParts: number;
  currentPart?: number;
  isParent?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  showCaret?: boolean;
}

export const SplitBadge = ({ 
  totalParts, 
  currentPart,
  isParent = false,
  isExpanded = false,
  onToggle,
  showCaret = false
}: SplitBadgeProps) => {
  if (isParent) {
    return (
      <div className="flex items-center gap-2">
        {showCaret && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
        <Badge variant="secondary" className="text-xs">
          Split {totalParts}x
        </Badge>
      </div>
    );
  }

  return (
    <Badge variant="outline" className="text-xs">
      Divisão {currentPart}/{totalParts}
    </Badge>
  );
};