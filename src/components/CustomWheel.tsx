import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface CustomWheelOption {
  id: string;
  name: string;
  icon?: string;
}

export interface CustomWheel {
  id: string;
  name: string;
  icon: string;
  options: CustomWheelOption[];
}

interface CustomWheelProps {
  wheel: CustomWheel;
  isSpinning: boolean;
  onSpinComplete: (option: CustomWheelOption) => void;
}

// Constant number of spins for consistent animation
const TOTAL_SPINS = 500;

export const CustomWheel = ({ wheel, isSpinning, onSpinComplete }: CustomWheelProps) => {
  const [displayedOptions, setDisplayedOptions] = useState<CustomWheelOption[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track the current shuffled options - persists after spin completes
  const [currentOptionsList, setCurrentOptionsList] = useState<CustomWheelOption[]>([]);
  // Track if spin just completed to preserve final result
  const [justCompletedSpin, setJustCompletedSpin] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const spinStartTime = useRef<number>(0);
  const wasSpinningRef = useRef(false);
  // Track if spin just completed to prevent re-triggering
  const spinCompleteRef = useRef(false);
  // Store the current spin's shuffled options in a ref to ensure consistency
  const spinOptionsRef = useRef<CustomWheelOption[]>([]);
  // Store the final option index for the current spin
  const spinFinalIndexRef = useRef<number>(0);

  // Fisher-Yates shuffle function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  // Initialize with options in original order when wheel opens (wheel prop changes)
  // Only reset when wheel changes, NOT when isSpinning changes
  // Don't re-initialize if we just completed a spin (keep final result displayed)
  useEffect(() => {
    // Skip re-initialization if we just completed a spin
    if (justCompletedSpin) {
      setJustCompletedSpin(false);
      return;
    }
    
    // Skip re-initialization if we have valid options from a previous session
    // This prevents the wheel from resetting after spin completes
    // Only skip if we're NOT spinning and we already have options displayed
    if (currentOptionsList.length > 0 && !isSpinning) {
      const centerOption = displayedOptions[2];
      if (centerOption && centerOption.id) {
        return; // Keep the current display (final result)
      }
    }
    
    if (wheel.options && wheel.options.length > 0) {
      setCurrentOptionsList(wheel.options);
      setDisplayedOptions([
        wheel.options[(wheel.options.length - 2) % wheel.options.length],
        wheel.options[(wheel.options.length - 1) % wheel.options.length],
        wheel.options[0],
        wheel.options[1 % wheel.options.length],
        wheel.options[2 % wheel.options.length],
      ]);
      setCurrentIndex(0);
    }
  }, [wheel]);

  // Handle spinning - shuffle options when spin STARTS
  useEffect(() => {
    // Detect when spin just started
    if (isSpinning && !wasSpinningRef.current) {
      spinCompleteRef.current = false;
      
      if (!wheel.options || wheel.options.length === 0) return;
      
      // SHUFFLE the options when spin starts
      const shuffled = shuffleArray(wheel.options);
      // Store in ref to ensure consistency throughout the spin
      spinOptionsRef.current = shuffled;
      setCurrentOptionsList(shuffled);
      
      // Pre-select the final result first
      const finalIndex = Math.floor(Math.random() * shuffled.length);
      spinFinalIndexRef.current = finalIndex;
      
      // Calculate starting position: start from a position that will land on finalIndex
      // after exactly TOTAL_SPINS steps
      const total = shuffled.length;
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
        const elapsed = Date.now() - spinStartTime.current;
        
        // Use refs for consistency
        const currentOptions = spinOptionsRef.current;
        const finalIdx = spinFinalIndexRef.current;
        const total = currentOptions.length;
        
        // Check if we've completed all steps
        if (currentStep >= totalSteps) {
          // Ensure we're at the final position - THIS IS THE WINNING OPTION
          setCurrentIndex(finalIdx);
          setDisplayedOptions([
            currentOptions[(finalIdx - 2 + total) % total],
            currentOptions[(finalIdx - 1 + total) % total],
            currentOptions[finalIdx],
            currentOptions[(finalIdx + 1) % total],
            currentOptions[(finalIdx + 2) % total],
          ]);
          
          // Only call onSpinComplete once - defer it to let the display settle first
          if (!spinCompleteRef.current) {
            spinCompleteRef.current = true;
            setJustCompletedSpin(true);
            // Use setTimeout to defer the callback so the visual display has time to settle
            // before the parent state updates cause a re-render
            setTimeout(() => {
              onSpinComplete(currentOptions[finalIdx]);
            }, 100);
          }
          return;
        }
        
        // Update display with current position
        setCurrentIndex(currentIndex);
        setDisplayedOptions([
          currentOptions[(currentIndex - 2 + total) % total],
          currentOptions[(currentIndex - 1 + total) % total],
          currentOptions[currentIndex],
          currentOptions[(currentIndex + 1) % total],
          currentOptions[(currentIndex + 2) % total],
        ]);

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
  }, [isSpinning, wheel, onSpinComplete]);

  if (wheel.options.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No options available
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Wheel header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-2xl">{wheel.icon}</span>
        <h3 className="text-lg font-semibold text-foreground">{wheel.name}</h3>
      </div>

      {/* Wheel display */}
      <div className="relative h-72">
        {/* Gradient overlays */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
        
        {/* Options list */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          {displayedOptions.map((option, index) => (
            <div
              key={`${option.id}-${index}`}
              className={cn(
                "text-center px-4 py-1.5 rounded-md whitespace-nowrap transition-all duration-200",
                index === 2
                  ? "bg-primary/20 border-2 border-primary text-foreground font-bold text-xl min-w-[200px] shadow-lg"
                  : "text-muted-foreground/40 text-sm"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                {option.icon && <span>{option.icon}</span>}
                <span>{option.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};