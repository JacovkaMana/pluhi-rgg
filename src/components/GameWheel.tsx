import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface GameWheelProps {
  games: string[];
  isSpinning: boolean;
  onSpinComplete: (game: string) => void;
}

// Constant number of spins for consistent animation
const TOTAL_SPINS = 500;

export const GameWheel = ({ games, isSpinning, onSpinComplete }: GameWheelProps) => {
  const [displayedGames, setDisplayedGames] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track the current shuffled games - persists after spin completes
  const [currentGamesList, setCurrentGamesList] = useState<string[]>([]);
  // Track if spin just completed to preserve final result
  const [justCompletedSpin, setJustCompletedSpin] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const spinStartTime = useRef<number>(0);
  const wasSpinningRef = useRef(false);
  // Track if spin just completed to prevent re-triggering
  const spinCompleteRef = useRef(false);
  // Store the current spin's shuffled games in a ref to ensure consistency
  const spinGamesRef = useRef<string[]>([]);
  // Store the final game index for the current spin
  const spinFinalIndexRef = useRef<number>(0);

  // Seeded random number generator for better randomness
  // Uses a combination of Math.random and timestamp to ensure different results
  const seededRandom = (): number => {
    const now = Date.now();
    const randomPart = Math.random();
    // Mix in the current time to ensure different seeds
    const seed = (now * randomPart) % 1;
    return seed;
  };

  // Fisher-Yates shuffle function with improved randomness
  const shuffleArray = <T,>(array: T[]): T[] => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      // Use seeded random for better distribution
      const j = Math.floor(seededRandom() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  // Initialize with games in original order when wheel opens (games prop changes)
  // Only reset when games change, NOT when isSpinning changes
  // Don't re-initialize if we just completed a spin (keep final result displayed)
  useEffect(() => {
    // Skip re-initialization if we just completed a spin
    if (justCompletedSpin) {
      setJustCompletedSpin(false);
      return;
    }
    
    // Skip re-initialization if we have valid games from a previous session
    // This prevents the wheel from resetting after spin completes
    // Only skip if we're NOT spinning and we already have games displayed
    if (currentGamesList.length > 0 && !isSpinning) {
      const centerGame = displayedGames[2];
      if (centerGame && centerGame) {
        return; // Keep the current display (final result)
      }
    }
    
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
      spinCompleteRef.current = false;
      
      if (!games || games.length === 0) return;
      
      // SHUFFLE the games when spin starts
      const shuffled = shuffleArray(games);
      // Store in ref to ensure consistency throughout the spin
      spinGamesRef.current = shuffled;
      setCurrentGamesList(shuffled);
      
      // Pre-select the final result first - use seeded random for better randomness
      const finalIndex = Math.floor(seededRandom() * shuffled.length);
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
        const currentGames = spinGamesRef.current;
        const finalIdx = spinFinalIndexRef.current;
        const total = currentGames.length;
        
        // Check if we've completed all steps
        if (currentStep >= totalSteps) {
          // Ensure we're at the final position - THIS IS THE WINNING GAME
          setCurrentIndex(finalIdx);
          setDisplayedGames([
            currentGames[(finalIdx - 2 + total) % total],
            currentGames[(finalIdx - 1 + total) % total],
            currentGames[finalIdx],
            currentGames[(finalIdx + 1) % total],
            currentGames[(finalIdx + 2) % total],
          ]);
          
          // Only call onSpinComplete once - defer it to let the display settle first
          if (!spinCompleteRef.current) {
            spinCompleteRef.current = true;
            setJustCompletedSpin(true);
            // Use setTimeout to defer the callback so the visual display has time to settle
            // before the parent state updates cause a re-render
            setTimeout(() => {
              onSpinComplete(currentGames[finalIdx]);
            }, 100);
          }
          return;
        }
        
        // Update display with current position
        setCurrentIndex(currentIndex);
        setDisplayedGames([
          currentGames[(currentIndex - 2 + total) % total],
          currentGames[(currentIndex - 1 + total) % total],
          currentGames[currentIndex],
          currentGames[(currentIndex + 1) % total],
          currentGames[(currentIndex + 2) % total],
        ]);

        // Move to next position
        currentIndex = (currentIndex + 1) % total;
        currentStep++;

        // Gradually slow down - from very fast to very slow
        const progress = currentStep / totalSteps;
        
        if (progress < 0.5) {
          // Very fast spinning phase (0-50%): minimum delay
          speed = 10;
        } else if (progress < 0.7) {
          // Fast spinning (50-70%): start slowing down
          speed = 10 + ((progress - 0.5) / 0.2) * 10;
        } else if (progress < 0.85) {
          // Slowing down (70-85%): noticeably slower
          speed = 10 + ((progress - 0.7) / 0.15) * 10;
        } else if (progress < 0.92) {
          // Slow phase (85-92%): much slower
          speed = 100 + ((progress - 0.85) / 0.07) * 50;
        } else if (progress < 0.96) {
          // Final approach (92-96%): very slow
          speed = 150 + ((progress - 0.92) / 0.04) * 100;
        } else if (progress < 0.98) {
          // Turtle slow (96-98%): extremely slow
          speed = 200 + ((progress - 0.96) / 0.02) * 150;
        } else {
          // Crawling (98-100%): very slow, each step clearly visible
          speed = 1200 + ((progress - 0.99) / 0.02) * 900;
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
  }, [isSpinning, games, onSpinComplete]);

  // Determine if we should show the border (only after spin completes)
  const showBorder = !isSpinning && displayedGames[2] && justCompletedSpin;

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
            className={cn(
              "text-center px-4 py-1.5 rounded-md whitespace-nowrap transition-all duration-200",
              index === 2
                ? "bg-primary/20 border-2 border-primary text-foreground font-bold text-xl min-w-[200px] shadow-lg"
                : "text-muted-foreground/40 text-sm"
            )}
          >
            {game}
          </div>
        ))}
      </div>
    </div>
  );
};
