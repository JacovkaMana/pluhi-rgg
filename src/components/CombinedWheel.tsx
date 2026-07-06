import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { GameCategoryWithGames } from "@/hooks/useGameLists";
import { Game } from "@/lib/sheets";
import {
  calculateTotalWeight,
  calculateDropChance,
  selectWeightedGame,
  getCategoryColor,
  createGameListWithAllCategories,
  GameWithAllCategories,
} from "@/lib/wheelUtils";

interface CombinedWheelProps {
  categories: GameCategoryWithGames[];
  games: Game[];
  isSpinning: boolean;
  onSpinComplete: (game: string, category: GameCategoryWithGames) => void;
  disabledCategories?: string[];
  onCategoryDisable?: (category: GameCategoryWithGames, e: React.MouseEvent) => void;
}

// Constant number of spins for consistent animation
const TOTAL_SPINS = 500;

export const CombinedWheel = ({
  categories,
  games,
  isSpinning,
  onSpinComplete,
  disabledCategories = [],
  onCategoryDisable,
}: CombinedWheelProps) => {
  const [displayedGames, setDisplayedGames] = useState<GameWithAllCategories[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentGames, setCurrentGames] = useState<GameWithAllCategories[]>([]);
  const [hasRandomized, setHasRandomized] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const spinStartTime = useRef<number>(0);
  const finalResultRef = useRef<{ game: string; gameIndex: number; category: GameCategoryWithGames } | null>(null);
  const wasSpinningRef = useRef(false);
  const spinCompleteRef = useRef(false);
  const justCompletedSpinRef = useRef(false);
  const spinGamesRef = useRef<GameWithAllCategories[]>([]);
  const spinFinalIndexRef = useRef<number>(0);

  // Create flat list of all unique games with ALL their categories
  const createGamesList = useCallback(() => {
    const enabledCategories = categories.filter(cat => !disabledCategories.includes(cat.id));
    return createGameListWithAllCategories(games, enabledCategories);
  }, [games, categories, disabledCategories]);

  // Seeded random number generator for better randomness
  const seededRandom = (): number => {
    const now = Date.now();
    const randomPart = Math.random();
    const seed = (now * randomPart) % 1;
    return seed;
  };

  // Fisher-Yates shuffle function with improved randomness
  const shuffleArray = <T,>(array: T[]): T[] => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  // Initialize with SHUFFLED games when wheel opens (categories change)
  useEffect(() => {
    if (justCompletedSpinRef.current) {
      justCompletedSpinRef.current = false;
      return;
    }

    if (hasRandomized && currentGames.length > 0 && !isSpinning) {
      const centerGame = displayedGames[2];
      if (centerGame && centerGame.game) {
        return;
      }
    }

    const gamesList = createGamesList();
    if (gamesList.length > 0) {
      const shuffled = shuffleArray(gamesList);
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
  }, [categories, games, disabledCategories]);

  // Handle spinning
  useEffect(() => {
    if (isSpinning && !wasSpinningRef.current) {
      spinCompleteRef.current = false;

      const originalGames = createGamesList();
      if (originalGames.length > 0) {
        const shuffled = shuffleArray(originalGames);
        spinGamesRef.current = shuffled;
        setCurrentGames(shuffled);

        // Pre-calculate the final result using weighted selection
        const enabledCategories = categories.filter(cat => !disabledCategories.includes(cat.id));
        const weightedResult = selectWeightedGame(games, enabledCategories);
        if (!weightedResult) return;

        finalResultRef.current = weightedResult;

        // Find the index of the winning game in our SHUFFLED flat list
        let finalGameIndex = shuffled.findIndex(
          (g) => g.game === weightedResult.game && g.gameIndex === weightedResult.gameIndex
        );
        if (finalGameIndex === -1) finalGameIndex = 0;

        spinFinalIndexRef.current = finalGameIndex;

        const total = shuffled.length;
        const totalSteps = TOTAL_SPINS;
        const startIndex = ((finalGameIndex - totalSteps) % total + total) % total;

        spinStartTime.current = Date.now();
        let speed = 10;

        let currentStep = 0;
        let currentIndex = startIndex;

        const spin = () => {
          const games = spinGamesRef.current;
          const finalIdx = spinFinalIndexRef.current;
          const total = games.length;

          if (currentStep >= totalSteps) {
            setCurrentIndex(finalIdx);
            setDisplayedGames([
              games[(finalIdx - 2 + total) % total],
              games[(finalIdx - 1 + total) % total],
              games[finalIdx],
              games[(finalIdx + 1) % total],
              games[(finalIdx + 2) % total],
            ]);

            if (!spinCompleteRef.current && finalResultRef.current) {
              spinCompleteRef.current = true;
              justCompletedSpinRef.current = true;
              setTimeout(() => {
                onSpinComplete(finalResultRef.current!.game, finalResultRef.current!.category);
              }, 100);
            }
            return;
          }

          setCurrentIndex(currentIndex);
          setDisplayedGames([
            games[(currentIndex - 2 + total) % total],
            games[(currentIndex - 1 + total) % total],
            games[currentIndex],
            games[(currentIndex + 1) % total],
            games[(currentIndex + 2) % total],
          ]);

          currentIndex = (currentIndex + 1) % total;
          currentStep++;

          const progress = currentStep / totalSteps;

          if (progress < 0.5) {
            speed = 1;
          } else if (progress < 0.7) {
            speed = 5 + ((progress - 0.5) / 0.2) * 10;
          } else if (progress < 0.85) {
            speed = 10 + ((progress - 0.7) / 0.15) * 10;
          } else if (progress < 0.92) {
            speed = 50 + ((progress - 0.85) / 0.07) * 50;
          } else if (progress < 0.96) {
            speed = 100 + ((progress - 0.92) / 0.04) * 100;
          } else if (progress < 0.98) {
            speed = 200 + ((progress - 0.96) / 0.02) * 150;
          } else {
            speed = 1200 + ((progress - 0.998) / 0.02) * 900;
          }

          intervalRef.current = setTimeout(spin, speed);
        };

        spin();
      }
    }

    wasSpinningRef.current = isSpinning;

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isSpinning, categories, games, disabledCategories, onSpinComplete, createGamesList]);

  if (categories.length === 0 || currentGames.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No games available
      </div>
    );
  }

  // Get the primary color for a game (first category's color)
  const getPrimaryColor = (game: GameWithAllCategories): string => {
    return game.categories[0]?.color || getCategoryColor(game.categories[0]?.id || '');
  };

  return (
    <div className="relative h-72">
      {/* Gradient overlays */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />

      {/* Games display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        {displayedGames.map((gameWithCategories, index) => {
          const primaryColor = getPrimaryColor(gameWithCategories);
          const isCenter = index === 2;

          return (
            <div
              key={`${gameWithCategories.game}-${index}`}
              className={cn(
                "text-center px-4 py-1.5 rounded-md whitespace-nowrap transition-all duration-200",
                isCenter
                  ? "bg-primary/20 border-2 border-primary text-foreground font-bold text-xl min-w-[200px] shadow-lg"
                  : "text-muted-foreground/40 text-sm"
              )}
              style={{
                borderColor: isCenter ? primaryColor : 'transparent',
                boxShadow: isCenter ? `0 0 20px ${primaryColor}40` : 'none',
              }}
            >
              <div className="flex items-center justify-center gap-2">
                {isCenter && gameWithCategories.categories.length > 0 && (
                  <span className="text-lg">{gameWithCategories.categories[0].icon}</span>
                )}
                <span>{gameWithCategories.game}</span>
                {isCenter && gameWithCategories.categories.length > 0 && (
                  <span className="text-lg">{gameWithCategories.categories[0].icon}</span>
                )}
              </div>
              {isCenter && gameWithCategories.categories.length > 0 && (
                <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
                  {gameWithCategories.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="text-xs px-1.5 py-0.5 rounded bg-secondary/50"
                      style={{ color: cat.color }}
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Legend component showing categories and their drop chances
interface WheelLegendProps {
  categories: GameCategoryWithGames[];
  allCategories: GameCategoryWithGames[];
  totalGames: number;
  disabledCategories?: string[];
  onCategoryDisable?: (category: GameCategoryWithGames, e: React.MouseEvent) => void;
}

export const WheelLegend = ({
  categories,
  allCategories,
  totalGames,
  disabledCategories = [],
  onCategoryDisable,
}: WheelLegendProps) => {
  // Show only enabled categories for drop chance calculations
  const enabledCategories = categories;
  const totalWeight = calculateTotalWeight(enabledCategories);

  // Sort categories by weight (highest first)
  const sortedCategories = [...allCategories].sort((a, b) => (b.weight || 1) - (a.weight || 1));

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <span className="text-lg">🎯</span>
        Drop Chances
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
        {sortedCategories.map((category) => {
          const isDisabled = disabledCategories.includes(category.id);
          const chance = isDisabled ? 0 : calculateDropChance(category, totalWeight);
          const color = getCategoryColor(category.id);

          return (
            <div
              key={category.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <div
                onClick={(e) => onCategoryDisable?.(category, e)}
                className={cn(
                  "flex items-center gap-2 cursor-pointer transition-opacity flex-1",
                  isDisabled && "opacity-40"
                )}
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    isDisabled && "opacity-50"
                  )}
                  style={{ backgroundColor: color }}
                />
                <span className="text-muted-foreground">{category.icon}</span>
                <span className={cn("text-foreground", isDisabled && "line-through")}>
                  {category.name}
                </span>
                {isDisabled && (
                  <span className="text-xs text-muted-foreground">(off)</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isDisabled && "opacity-30"
                    )}
                    style={{
                      width: `${chance}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span className="text-muted-foreground text-xs w-12 text-right">
                  {isDisabled ? "0.0%" : `${chance.toFixed(1)}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground text-center">
        Total: {totalGames} games
      </div>
    </div>
  );
};