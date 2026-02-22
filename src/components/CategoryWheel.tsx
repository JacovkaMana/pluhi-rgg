import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { isIconUrl } from "@/hooks/useGameLists";

interface Category {
  id: string;
  name: string;
  icon: string;
  games: string[];
}

import { X, Check } from "lucide-react";

interface CategoryWheelProps {
  categories: Category[];
  isSpinning: boolean;
  onSpinComplete: (category: Category) => void;
  onCategoryClick?: (category: Category) => void;
  onCategoryDisable?: (category: Category, e: React.MouseEvent) => void;
  disabledCategories?: string[];
  selectedCategoryId?: string | null;
}

export const CategoryWheel = ({ categories, isSpinning, onSpinComplete, onCategoryClick, onCategoryDisable, disabledCategories, selectedCategoryId }: CategoryWheelProps) => {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const spinStartTime = useRef<number>(0);
  const finalIndexRef = useRef<number>(0);

  useEffect(() => {
    if (isSpinning && categories.length > 0) {
      spinStartTime.current = Date.now();
      let speed = 40;
      
      // Generate a random starting index
      const randomStartIndex = Math.floor(Math.random() * categories.length);
      console.log(randomStartIndex);
      let currentIndex = randomStartIndex;
      
      const maxSpeed = 800;
      const spinDuration = 10000; // 10 seconds total
      const slowDownStart = 3000; // Start slowing after 3 seconds
      const finalSlowDown = 3000; // Final dramatic slowdown

      // Track the actual final index that was highlighted
      let actualFinalIndex = 0;

      const spin = () => {
        const elapsed = Date.now() - spinStartTime.current;
        
        // Update highlighted index
        setHighlightedIndex(currentIndex);
        actualFinalIndex = currentIndex; // Track the actual final index

        currentIndex = (currentIndex + 1) % categories.length;

        // Gradually slow down after 2 seconds
        if (elapsed > slowDownStart) {
          const slowDownProgress = Math.min((elapsed - slowDownStart) / (spinDuration - slowDownStart), 1);
          
          // More aggressive slowdown in the final second
          if (elapsed > spinDuration - finalSlowDown) {
            const finalSlowProgress = 1 - ((spinDuration - elapsed) / finalSlowDown);
            speed = Math.min(speed + 30 + (finalSlowProgress * 200), maxSpeed);
          } else {
            speed = Math.min(speed + 15 + (slowDownProgress * 50), maxSpeed);
          }
        }

        // Stop after spin duration
        if (elapsed < spinDuration) {
          intervalRef.current = setTimeout(spin, speed);
        } else {
          // Select the actual final index that was highlighted
          setHighlightedIndex(actualFinalIndex);
          onSpinComplete(categories[actualFinalIndex]);
        }
      };

      spin();
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isSpinning, categories, onSpinComplete]);

  const getCategoryStyle = (index: number) => {
    const category = categories[index];
    const isHighlighted = highlightedIndex === index;
    const isDisabled = disabledCategories?.includes(category.id) || false;
    const isSelected = selectedCategoryId === category.id;

    return cn(
      "relative flex flex-col items-center p-4 rounded-xl transition-all duration-200",
      "border bg-card min-w-[120px] h-[160px]",
      isHighlighted && "border-primary bg-primary/10 shadow-lg shadow-primary/20",
      isSelected && !isHighlighted && "border-green-500/50 bg-green-500/10 shadow-lg shadow-green-500/10",
      !isHighlighted && !isSelected && "border-border/60",
      isDisabled && "opacity-40 cursor-not-allowed",
      !isDisabled && "cursor-pointer hover:bg-secondary/50"
    );
  };

  const getBulbStyle = (index: number) => {
    const isHighlighted = highlightedIndex === index;

    return cn(
      "w-4 h-4 rounded-lg transition-all duration-200 border",
      isHighlighted && "bg-primary/20 border-primary/50 shadow-[0_0_12px_4px_rgba(var(--primary),0.6)]",
      !isHighlighted && "bg-muted/50 border-border/50"
    );
  };

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        No categories available
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className={getCategoryStyle(index)}
            onClick={() => onCategoryClick?.(category)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCategoryClick?.(category);
              }
            }}
          >
            {/* Top row: Bulb indicator and status buttons */}
            <div className="absolute top-2 left-0 right-0 flex justify-between items-start px-2">
              {/* Bulb indicator */}
              <div className={getBulbStyle(index)} />
              
              {/* Status buttons inside card */}
              <div className="flex gap-1">
                {/* Disable button */}
                {onCategoryDisable && !disabledCategories?.includes(category.id) && (
                  <button
                    onClick={(e) => onCategoryDisable(category, e)}
                    className="w-5 h-5 bg-red-500/20 border border-red-500/40 rounded flex items-center justify-center hover:bg-red-500/30 transition-colors"
                    title="Remove from wheel"
                  >
                    <X className="w-3 h-3 text-red-400" />
                  </button>
                )}
                
                {/* Selection indicator */}
                {selectedCategoryId === category.id && (
                  <div className="w-5 h-5 bg-green-500/20 border border-green-500/40 rounded flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Middle: Category icon */}
            <div className="mt-4 mb-2">
              {isIconUrl(category.icon) ? (
                <img
                  src={category.icon}
                  alt={category.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<span class="text-3xl">❓</span>`;
                  }}
                />
              ) : (
                <span className="text-3xl">{category.icon}</span>
              )}
            </div>
            
            {/* Category name */}
            <span className="text-sm font-medium text-foreground text-center block mb-1">
              {category.name}
            </span>
            
            {/* Game count */}
            <span className="text-xs text-muted-foreground">
              {category.games.length} games
            </span>
            
            {/* Disabled overlay */}
            {disabledCategories?.includes(category.id) && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-xl">
                <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-red-500/10 rounded">Disabled</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};