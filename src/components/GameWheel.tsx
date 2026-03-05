import { useState, useEffect, useRef, useCallback } from "react";

interface GameWheelProps {
  games: string[];
  isSpinning: boolean;
  onSpinComplete: (game: string) => void;
}

export const GameWheel = ({ games, isSpinning, onSpinComplete }: GameWheelProps) => {
  const [displayedGames, setDisplayedGames] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track the current shuffled games - persists after spin completes
  const [currentGamesList, setCurrentGamesList] = useState<string[]>([]);
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

  // Initialize with games in original order when wheel opens (games prop changes)
  useEffect(() => {
    if (games && games.length > 0) {
      setCurrentGamesList(games);
      setDisplayedGames([
        games[(games.length - 2) % games.length],
        games[(games.length - 1) % games.length],
        games[0],
        games[1 % games.length],
        games[2 % games.length],
      ]);
      setCurrentIndex(0);
    }
  }, [games]);

  // Handle spinning - shuffle games when spin STARTS
  useEffect(() => {
    // Detect when spin just started
    if (isSpinning && !wasSpinningRef.current) {
      if (!games || games.length === 0) return;
      
      // SHUFFLE the games when spin starts
      const shuffled = shuffleArray(games);
      setCurrentGamesList(shuffled);
      
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
        setDisplayedGames([
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
          setDisplayedGames([
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
          setDisplayedGames([
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
  }, [isSpinning, games, onSpinComplete]);

  if (games.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Select a game list to start
      </div>
    );
  }

  return (
    <div className="relative h-72">
      {/* Gradient overlays */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
      
      {/* Games list */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        {displayedGames.map((game, index) => (
          <div
            key={`${game}-${index}`}
            className={`text-center px-4 py-1.5 rounded-md whitespace-nowrap transition-all duration-200 ${
              index === 2
                ? "bg-primary/20 border border-primary text-foreground font-bold text-xl min-w-[200px]"
                : "text-muted-foreground/40 text-sm"
            }`}
          >
            {game}
          </div>
        ))}
      </div>
    </div>
  );
};
