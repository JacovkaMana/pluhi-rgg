import { GameCategoryWithGames } from "@/hooks/useGameLists";
import { Game } from "@/lib/sheets";

// Category colors for the wheel - each category gets a distinct color
export const CATEGORY_COLORS: Record<string, string> = {
  cozy: "#8B5CF6",      // Purple
  rpg: "#EF4444",       // Red
  jokerge: "#F59E0B", // Amber
  puzzle: "#3B82F6",     // Blue
  reading: "#EC4899",    // Pink
  roguelike: "#10B981",      // Emerald
  coop: "#06B6D4",      // Cyan
  shooter: "#EF4444", // Red (shooter)
  action: "#F97316",     // Orange
};

// Default color for unknown categories
export const DEFAULT_CATEGORY_COLOR = "#6B7280";

// Get color for a category
export const getCategoryColor = (categoryId: string): string => {
  return CATEGORY_COLORS[categoryId] || DEFAULT_CATEGORY_COLOR;
};

// Calculate total weight from all categories
export const calculateTotalWeight = (categories: GameCategoryWithGames[]): number => {
  return categories.reduce((total, cat) => total + (cat.weight || 1), 0);
};

// Calculate drop chance percentage for a category
export const calculateDropChance = (
  category: GameCategoryWithGames,
  totalWeight: number
): number => {
  if (totalWeight === 0) return 0;
  return ((category.weight || 1) / totalWeight) * 100;
};

// Seeded random number generator for better randomness
// Uses a combination of Math.random and timestamp to ensure different results
const seededRandom = (): number => {
  const now = Date.now();
  const randomPart = Math.random();
  // Mix in the current time to ensure different seeds
  const seed = (now * randomPart) % 1;
  return seed;
};

// Game with all its categories info for display
export interface GameWithAllCategories {
  game: string;
  gameIndex: number;
  categories: {
    id: string;
    name: string;
    icon: string;
    color: string;
  }[];
}

// Create flat list of all unique games with their ALL categories for the wheel display
export const createGameListWithAllCategories = (
  games: Game[],
  categories: GameCategoryWithGames[]
): GameWithAllCategories[] => {
  const categoryMap = new Map<string, GameCategoryWithGames>();
  categories.forEach(cat => categoryMap.set(cat.id, cat));

  const result: GameWithAllCategories[] = [];

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    const gameCategories: GameWithAllCategories['categories'] = [];

    for (const catId of game.categories) {
      const category = categoryMap.get(catId);
      if (category) {
        gameCategories.push({
          id: category.id,
          name: category.name,
          icon: category.icon,
          color: getCategoryColor(category.id),
        });
      }
    }

    // Only include games that have at least one category
    if (gameCategories.length > 0) {
      result.push({
        game: game.name,
        gameIndex: i,
        categories: gameCategories,
      });
    }
  }

  return result;
};

// Weighted random selection - returns a random game from all categories
// based on game weights (sum of their category weights)
export const selectWeightedGame = (
  games: Game[],
  categories: GameCategoryWithGames[]
): { game: string; gameIndex: number; category: GameCategoryWithGames } | null => {
  if (games.length === 0 || categories.length === 0) return null;

  const categoryMap = new Map<string, GameCategoryWithGames>();
  categories.forEach(cat => categoryMap.set(cat.id, cat));

  // Calculate weight for each game (sum of its category weights)
  const gameWeights: { game: string; gameIndex: number; weight: number; category: GameCategoryWithGames }[] = [];

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    if (game.categories.length === 0) continue;

    let totalWeight = 0;
    let randomCategory: GameCategoryWithGames | null = null;

    for (const catId of game.categories) {
      const category = categoryMap.get(catId);
      if (category) {
        totalWeight += category.weight || 1;
        if (!randomCategory || Math.random() > 0.5) {
          randomCategory = category;
        }
      }
    }

    if (totalWeight > 0 && randomCategory) {
      gameWeights.push({
        game: game.name,
        gameIndex: i,
        weight: totalWeight,
        category: randomCategory,
      });
    }
  }

  if (gameWeights.length === 0) return null;

  // Weighted selection
  const totalWeight = gameWeights.reduce((sum, g) => sum + g.weight, 0);
  let random = seededRandom() * totalWeight;

  for (const gameWeight of gameWeights) {
    if (random < gameWeight.weight) {
      return {
        game: gameWeight.game,
        gameIndex: gameWeight.gameIndex,
        category: gameWeight.category,
      };
    }
    random -= gameWeight.weight;
  }

  // Fallback
  const fallback = gameWeights[0];
  return {
    game: fallback.game,
    gameIndex: fallback.gameIndex,
    category: fallback.category,
  };
};

// Create flat list of all games with their category info for the wheel display
export interface GameWithCategory {
  game: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
}

export const createGameListWithCategories = (
  categories: GameCategoryWithGames[]
): GameWithCategory[] => {
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
};