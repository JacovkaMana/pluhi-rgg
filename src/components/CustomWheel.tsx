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

export const CustomWheel = ({ wheel, isSpinning, onSpinComplete }: CustomWheelProps) => {
  const [displayedOptions, setDisplayedOptions] = useState<CustomWheelOption[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track the current shuffled options - persists after spin completes
  const [currentOptionsList, setCurrentOptionsList] = useState<CustomWheelOption[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const spinStartTime = useRef<number>(0);
  const wasSpinningRef = useRef(false);

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
  useEffect(() => {
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
      if (!wheel.options || wheel.options.length === 0) return;
      
      // SHUFFLE the options when spin starts
      const shuffled = shuffleArray(wheel.options);
      setCurrentOptionsList(shuffled);
      
      // Pre-select the final result first
      const finalIndex = Math.floor(Math.random() * shuffled.length);
      
      // Calculate total steps to reach the target with multiple rotations
      const fullRotations = 10;
      const totalSteps = (fullRotations * shuffled.length) + finalIndex;
      
      spinStartTime.current = Date.now();
      let speed = 40;
      
      const maxSpeed = 800;
      const spinDuration = 10000;
      const slowDownStart = 3000;
      const finalSlowDown = 3000;

      let currentStep = 0;
      let currentIndex = 0;

      const spin = () => {
        const elapsed = Date.now() - spinStartTime.current;
        
        // Update display
        setCurrentIndex(currentIndex);
        setDisplayedOptions([
          shuffled[(currentIndex - 2 + shuffled.length) % shuffled.length],
          shuffled[(currentIndex - 1 + shuffled.length) % shuffled.length],
          shuffled[currentIndex],
          shuffled[(currentIndex + 1) % shuffled.length],
          shuffled[(currentIndex + 2) % shuffled.length],
        ]);

        currentIndex = (currentIndex + 1) % shuffled.length;
        currentStep++;

        // Check if we've completed enough steps to reach the target
        if (currentStep >= totalSteps) {
          // Ensure we're at the final position
          setCurrentIndex(finalIndex);
          setDisplayedOptions([
            shuffled[(finalIndex - 2 + shuffled.length) % shuffled.length],
            shuffled[(finalIndex - 1 + shuffled.length) % shuffled.length],
            shuffled[finalIndex],
            shuffled[(finalIndex + 1) % shuffled.length],
            shuffled[(finalIndex + 2) % shuffled.length],
          ]);
          onSpinComplete(shuffled[finalIndex]);
          return;
        }

        // Gradually slow down - slot machine style
        const remainingSteps = totalSteps - currentStep;
        if (remainingSteps < 50) {
          speed = Math.min(speed + 30, maxSpeed);
        } else if (elapsed > slowDownStart) {
          const slowDownProgress = Math.min((elapsed - slowDownStart) / (spinDuration - slowDownStart), 1);
          
          if (elapsed > spinDuration - finalSlowDown) {
            const finalSlowProgress = 1 - ((spinDuration - elapsed) / finalSlowDown);
            speed = Math.min(speed + 30 + (finalSlowProgress * 200), maxSpeed);
          } else {
            speed = Math.min(speed + 15 + (slowDownProgress * 50), maxSpeed);
          }
        }

        // Also stop after max duration
        if (elapsed < spinDuration) {
          intervalRef.current = setTimeout(spin, speed);
        } else {
          // Time's up - force stop at final position
          setCurrentIndex(finalIndex);
          setDisplayedOptions([
            shuffled[(finalIndex - 2 + shuffled.length) % shuffled.length],
            shuffled[(finalIndex - 1 + shuffled.length) % shuffled.length],
            shuffled[finalIndex],
            shuffled[(finalIndex + 1) % shuffled.length],
            shuffled[(finalIndex + 2) % shuffled.length],
          ]);
          onSpinComplete(shuffled[finalIndex]);
        }
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
                  ? "bg-primary/20 border-2 border-primary text-foreground font-bold text-xl min-w-[200px]"
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