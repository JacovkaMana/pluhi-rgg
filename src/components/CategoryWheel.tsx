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

// Constant number of spins for consistent animation
const TOTAL_SPINS = 500;

export const CategoryWheel = ({ categories, isSpinning, onSpinComplete, onCategoryClick, onCategoryDisable, disabledCategories, selectedCategoryId }: CategoryWheelProps) => {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  // Track if spin just completed to preserve final result
  const [justCompletedSpin, setJustCompletedSpin] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const spinStartTime = useRef<number>(0);
  const wasSpinningRef = useRef(false);
  // Track if spin just completed to prevent re-triggering
  const spinCompleteRef = useRef(false);
  // Store the current spin's categories in a ref to ensure consistency
  const spinCategoriesRef = useRef<Category[]>([]);
  // Store the final category index for the current spin
  const spinFinalIndexRef = useRef<number>(0);

  // Handle spinning
  useEffect(() => {
    // Detect when spin just started
    if (isSpinning && !wasSpinningRef.current) {
      spinCompleteRef.current = false;
      
      if (!categories || categories.length === 0) return;
      
      // Store categories in ref to ensure consistency throughout the spin
      spinCategoriesRef.current = categories;
      
      // Pre-select the final result first
      const finalIndex = Math.floor(Math.random() * categories.length);
      spinFinalIndexRef.current = finalIndex;
      
      // Calculate starting position: start from a position that will land on finalIndex
      // after exactly TOTAL_SPINS steps
      const total = categories.length;
      const totalSteps = TOTAL_SPINS;
      
      // Starting index (will increment each step and land on finalIndex after totalSteps)
      const startIndex = ((finalIndex - totalSteps) % total + total) % total;
      
      spinStartTime.current = Date.now();
      let speed = 10; // Start fast
      
      // Total spin duration: 20 seconds (enough for slow-down effect)
      const spinDuration = 20000;
      
      let currentStep = 0;
      let currentIndex = startIndex;

      const spin = () => {
        // Use refs for consistency
        const currentCategories = spinCategoriesRef.current;
        const finalIdx = spinFinalIndexRef.current;
        const total = currentCategories.length;
        
        // Check if we've completed all steps
        if (currentStep >= totalSteps) {
          // Ensure we're at the final position - THIS IS THE WINNING CATEGORY
          setHighlightedIndex(finalIdx);
          
          // Only call onSpinComplete once - defer it to let the display settle first
          if (!spinCompleteRef.current) {
            spinCompleteRef.current = true;
            setJustCompletedSpin(true);
            // Use setTimeout to defer the callback so the visual display has time to settle
            // before the parent state updates cause a re-render
            setTimeout(() => {
              onSpinComplete(currentCategories[finalIdx]);
            }, 100);
          }
          return;
        }
        
        // Update highlighted index
        setHighlightedIndex(currentIndex);

        // Move to next position
        currentIndex = (currentIndex + 1) % total;
        currentStep++;

        // Gradually slow down - from very fast to very slow
        const progress = currentStep / totalSteps;
        
          if (progress < 0.5) {
            // Very fast spinning phase (0-50%): minimum delay
            speed = 1;
          } else if (progress < 0.7) {
            // Fast spinning (50-70%): start slowing down
            speed = 5 + ((progress - 0.5) / 0.2) * 10;
          } else if (progress < 0.85) {
            // Slowing down (70-85%): noticeably slower
            speed = 10 + ((progress - 0.7) / 0.15) * 10;
          } else if (progress < 0.92) {
            // Slow phase (85-92%): much slower
            speed = 50 + ((progress - 0.85) / 0.07) * 50;
          } else if (progress < 0.96) {
            // Final approach (92-96%): very slow
            speed = 100 + ((progress - 0.92) / 0.04) * 100;
          } else if (progress < 0.98) {
            // Turtle slow (96-98%): extremely slow
            speed = 200 + ((progress - 0.96) / 0.02) * 150;
          } else {
            // Crawling (98-100%): very slow, each step clearly visible
            speed = 1200 + ((progress - 0.998) / 0.02) * 900;
          }

        // Continue spinning - no time-based stop, let it complete all steps
        intervalRef.current = setTimeout(spin, speed);
      };

      spin();
    }
    
    // Update the ref
    wasSpinningRef.current = isSpinning;

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
      isHighlighted && "border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-105",
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