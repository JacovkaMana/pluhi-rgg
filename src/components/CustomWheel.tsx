import { useState, useEffect, useRef } from "react";
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const spinStartTime = useRef<number>(0);

  useEffect(() => {
    if (wheel.options.length > 0) {
      setDisplayedOptions([
        wheel.options[wheel.options.length - 2] || wheel.options[0],
        wheel.options[wheel.options.length - 1] || wheel.options[0],
        wheel.options[0],
        wheel.options[1] || wheel.options[0],
        wheel.options[2] || wheel.options[0],
      ]);
      setCurrentIndex(0);
    }
  }, [wheel]);

  useEffect(() => {
    if (isSpinning && wheel.options.length > 0) {
      spinStartTime.current = Date.now();
      let speed = 40;
      let currentIndex = Math.floor(Math.random() * wheel.options.length);
      const maxSpeed = 800;
      const spinDuration = 10000;
      const slowDownStart = 3000;
      const finalSlowDown = 3000;
      let actualFinalIndex = 0;

      const spin = () => {
        const elapsed = Date.now() - spinStartTime.current;
        
        // Update display
        setCurrentIndex(currentIndex);
        setDisplayedOptions([
          wheel.options[(currentIndex - 2 + wheel.options.length) % wheel.options.length],
          wheel.options[(currentIndex - 1 + wheel.options.length) % wheel.options.length],
          wheel.options[currentIndex],
          wheel.options[(currentIndex + 1) % wheel.options.length],
          wheel.options[(currentIndex + 2) % wheel.options.length],
        ]);
        actualFinalIndex = currentIndex;

        currentIndex = (currentIndex + 1) % wheel.options.length;

        // Gradually slow down after 2 seconds
        if (elapsed > slowDownStart) {
          const slowDownProgress = Math.min((elapsed - slowDownStart) / (spinDuration - slowDownStart), 1);
          
          if (elapsed > spinDuration - finalSlowDown) {
            const finalSlowProgress = 1 - ((spinDuration - elapsed) / finalSlowDown);
            speed = Math.min(speed + 30 + (finalSlowProgress * 200), maxSpeed);
          } else {
            speed = Math.min(speed + 15 + (slowDownProgress * 50), maxSpeed);
          }
        }

        if (elapsed < spinDuration) {
          intervalRef.current = setTimeout(spin, speed);
        } else {
          setCurrentIndex(actualFinalIndex);
          setDisplayedOptions([
            wheel.options[(actualFinalIndex - 2 + wheel.options.length) % wheel.options.length],
            wheel.options[(actualFinalIndex - 1 + wheel.options.length) % wheel.options.length],
            wheel.options[actualFinalIndex],
            wheel.options[(actualFinalIndex + 1) % wheel.options.length],
            wheel.options[(actualFinalIndex + 2) % wheel.options.length],
          ]);
          onSpinComplete(wheel.options[actualFinalIndex]);
        }
      };

      spin();
    }

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