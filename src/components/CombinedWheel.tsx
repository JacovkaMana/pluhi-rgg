import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { GameCategoryWithGames } from "@/hooks/useGameLists";
import {
  calculateTotalWeight,
  calculateDropChance,
  selectWeightedGame,
  getCategoryColor,
  GameWithCategory,
} from "@/lib/wheelUtils";

interface CombinedWheelProps {
  categories: GameCategoryWithGames[];
  isSpinning: boolean;
  onSpinComplete: (game: string, category: GameCategoryWithGames) => void;
}

// Constant number of spins for consistent animation
const TOTAL_SPINS = 500;

export const CombinedWheel = ({
  categories,
  isSpinning,
  onSpinComplete,
}: CombinedWheelProps) => {
  const [displayedGames, setDisplayedGames] = useState<GameWithCategory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track the current shuffled games - persists after spin completes
  const [currentGames, setCurrentGames] = useState<GameWithCategory[]>([]);
  // Track if we've already randomized this session (per categories list)
  const [hasRandomized, setHasRandomized] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const spinStartTime = useRef<number>(0);
  const finalResultRef = useRef<{ game: string; category: GameCategoryWithGames } | null>(null);
  const wasSpinningRef = useRef(false);
  // Track if spin just completed to prevent re-triggering
  const spinCompleteRef = useRef(false);
  // Track if spin just completed to preserve final result
  const justCompletedSpinRef = useRef(false);
  // Store the current spin's shuffled games in a ref to ensure consistency
  const spinGamesRef = useRef<GameWithCategory[]>([]);
  // Store the final game index for the current spin
  const spinFinalIndexRef = useRef<number>(0);

  // Create flat list of all games with category info
  const createGamesList = useCallback(() => {
    const result: GameWithCategory[] = [];
    for (const category of categories) {
      const color = getCategoryColor(category.id);
      for (const game of category.games || []) {
        result.push({
          game,
          categoryId: category.id,
          categoryName: category.name,
          categoryIcon: category.icon,
          categoryColor: color,
        });
      }
    }
    return result;
  }, [categories]);

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

  // Initialize with SHUFFLED games when wheel opens (categories change)
  // Only reset when categories change, NOT when isSpinning changes
  // Don't re-initialize if we just completed a spin (keep final result displayed)
  useEffect(() => {
    // Skip re-initialization if we just completed a spin
    // This prevents the wheel from resetting after spin completes
    if (justCompletedSpinRef.current) {
      // Clear the flag after we've preserved the result
      justCompletedSpinRef.current = false;
      return;
    }
    
    // Skip re-initialization if we have valid games from a previous session
    // This prevents the wheel from resetting after spin completes
    // Only skip if we're NOT spinning and we already have games displayed
    if (hasRandomized && currentGames.length > 0 && !isSpinning) {
      // Check if we're showing a valid game (not empty)
      const centerGame = displayedGames[2];
      if (centerGame && centerGame.game) {
        return; // Keep the current display (final result)
      }
    }
    
    const games = createGamesList();
    if (games.length > 0) {
      // Shuffle the games for display when wheel opens
      const shuffled = shuffleArray(games);
      setCurrentGames(shuffled);
      setDisplayedGames([
        shuffled[(shuffled.length - 2) % shuffled.length],
        shuffled[(shuffled.length - 1) % shuffled.length],
        shuffled[0],
        shuffled[1 % shuffled.length],
        shuffled[2 % shuffled.length],
      ]);
      setCurrentIndex(0);
      setHasRandomized(true);
    }
  }, [categories]);

  // Handle spinning
  useEffect(() => {
    // Detect when spin just started
    if (isSpinning && !wasSpinningRef.current) {
      spinCompleteRef.current = false;
      
      // User pressed roll button - shuffle the games for the spin
      const originalGames = createGamesList();
      if (originalGames.length > 0) {
        // Shuffle the games
        const shuffled = shuffleArray(originalGames);
        // Store in ref to ensure consistency throughout the spin
        spinGamesRef.current = shuffled;
        setCurrentGames(shuffled);
        
        // Pre-calculate the final result using weighted selection FIRST
        // This uses the ORIGINAL categories to pick based on weights
        const weightedResult = selectWeightedGame(categories);
        if (!weightedResult) return;
        
        finalResultRef.current = weightedResult;
        
        // Find the index of the winning game in our SHUFFLED flat list
        // This ensures the visual wheel lands on the weighted result
        let finalGameIndex = shuffled.findIndex(
          (g) => g.game === weightedResult.game && g.categoryId === weightedResult.category.id
        );
        if (finalGameIndex === -1) finalGameIndex = 0;
        
        // Store in ref
        spinFinalIndexRef.current = finalGameIndex;

        // Calculate starting position: start from a position that will land on finalGameIndex
        // after exactly TOTAL_SPINS steps
        // If finalGameIndex = 5 and TOTAL_SPINS = 500, we start at position (5 - 500) = -495
        // Which wraps to: (total + finalGameIndex - TOTAL_SPINS) % total
        const total = shuffled.length;
        const totalSteps = TOTAL_SPINS;
        
        // Starting index (will increment each step and land on finalGameIndex after totalSteps)
        // startIndex + totalSteps ≡ finalGameIndex (mod total)
        // startIndex ≡ finalGameIndex - totalSteps (mod total)
        const startIndex = ((finalGameIndex - totalSteps) % total + total) % total;
        
        spinStartTime.current = Date.now();
        let speed = 10; // Start fast
        
        // Total spin duration: 20 seconds (enough for slow-down effect)
        const spinDuration = 20000;
        
        let currentStep = 0;
        let currentIndex = startIndex;

        const spin = () => {
          const elapsed = Date.now() - spinStartTime.current;
          
          // Use refs for consistency
          const games = spinGamesRef.current;
          const finalIdx = spinFinalIndexRef.current;
          const total = games.length;
          
          // Check if we've completed all steps
          if (currentStep >= totalSteps) {
            // Ensure we're at the final position - THIS IS THE WINNING GAME
            setCurrentIndex(finalIdx);
            setDisplayedGames([
              games[(finalIdx - 2 + total) % total],
              games[(finalIdx - 1 + total) % total],
              games[finalIdx],
              games[(finalIdx + 1) % total],
              games[(finalIdx + 2) % total],
            ]);
            
            // Only call onSpinComplete once - defer it to let the display settle first
            if (!spinCompleteRef.current && finalResultRef.current) {
              spinCompleteRef.current = true;
              justCompletedSpinRef.current = true;
              // Use setTimeout to defer the callback so the visual display has time to settle
              // before the parent state updates cause a re-render
              setTimeout(() => {
                onSpinComplete(finalResultRef.current!.game, finalResultRef.current!.category);
              }, 100);
            }
            return;
          }
          
          // Update display with current position
          setCurrentIndex(currentIndex);
          setDisplayedGames([
            games[(currentIndex - 2 + total) % total],
            games[(currentIndex - 1 + total) % total],
            games[currentIndex],
            games[(currentIndex + 1) % total],
            games[(currentIndex + 2) % total],
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
    }
    
    // Update the ref
    wasSpinningRef.current = isSpinning;

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isSpinning, categories, onSpinComplete, createGamesList]);

  if (categories.length === 0 || currentGames.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No games available
      </div>
    );
  }

  return (
    <div className="relative h-72">
      {/* Gradient overlays */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
      
      {/* Games display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        {displayedGames.map((gameWithCategory, index) => (
          <div
            key={`${gameWithCategory.game}-${index}`}
            className={cn(
              "text-center px-4 py-1.5 rounded-md whitespace-nowrap transition-all duration-200",
              index === 2
                ? "bg-primary/20 border-2 border-primary text-foreground font-bold text-xl min-w-[200px] shadow-lg"
                : "text-muted-foreground/40 text-sm"
            )}
            style={{
              borderColor: index === 2 ? gameWithCategory.categoryColor : 'transparent',
              boxShadow: index === 2
                ? `0 0 20px ${gameWithCategory.categoryColor}40`
                : 'none',
            }}
          >
            <div className="flex items-center justify-center gap-2">
              {index === 2 && (
                <span className="text-lg">{gameWithCategory.categoryIcon}</span>
              )}
              <span>{gameWithCategory.game}</span>
              {index === 2 && (
                <span className="text-lg">{gameWithCategory.categoryIcon}</span>
              )}
            </div>
            {index === 2 && (
              <div
                className="text-xs mt-1 opacity-80"
                style={{ color: gameWithCategory.categoryColor }}
              >
                {gameWithCategory.categoryName}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Legend component showing categories and their drop chances
interface WheelLegendProps {
  categories: GameCategoryWithGames[];
}

export const WheelLegend = ({ categories }: WheelLegendProps) => {
  const totalWeight = calculateTotalWeight(categories);

  // Sort categories by weight (highest first)
  const sortedCategories = [...categories].sort((a, b) => (b.weight || 1) - (a.weight || 1));

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <span className="text-lg">🎯</span>
        Drop Chances
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {sortedCategories.map((category) => {
          const chance = calculateDropChance(category, totalWeight);
          const color = getCategoryColor(category.id);
          
          return (
            <div
              key={category.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-muted-foreground">{category.icon}</span>
                <span className="text-foreground">{category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${chance}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span className="text-muted-foreground text-xs w-12 text-right">
                  {chance.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground text-center">
        Total: {categories.reduce((sum, c) => sum + (c.games?.length || 0), 0)} games
      </div>
    </div>
  );
};