import { GameCategoryWithGames } from "@/hooks/useGameLists";

// Category colors for the wheel - each category gets a distinct color
export const CATEGORY_COLORS: Record<string, string> = {
  cozy: "#8B5CF6",      // Purple
  rpg: "#EF4444",       // Red
  dzhokerge: "#F59E0B", // Amber
  dumat: "#3B82F6",     // Blue
  duhota: "#EC4899",    // Pink
  indi: "#10B981",      // Emerald
  koop: "#06B6D4",      // Cyan
  strelyalka: "#EF4444", // Red (shooter)
  ekshn: "#F97316",     // Orange
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

// Weighted random selection - returns a random game from all categories
// based on category weights
export const selectWeightedGame = (
  categories: GameCategoryWithGames[]
): { game: string; category: GameCategoryWithGames } | null => {
  if (categories.length === 0) return null;

  const totalWeight = calculateTotalWeight(categories);
  if (totalWeight === 0) return null;

  // Generate random number between 0 and totalWeight
  let random = Math.random() * totalWeight;

  // Find the category based on weight
  for (const category of categories) {
    const weight = category.weight || 1;
    if (random < weight) {
      // Select random game from this category
      const games = category.games || [];
      if (games.length === 0) return null;
      
      const gameIndex = Math.floor(Math.random() * games.length);
      return {
        game: games[gameIndex],
        category,
      };
    }
    random -= weight;
  }

  // Fallback to first category if something goes wrong
  const firstCategory = categories[0];
  const games = firstCategory.games || [];
  if (games.length === 0) return null;
  
  const gameIndex = Math.floor(Math.random() * games.length);
  return {
    game: games[gameIndex],
    category: firstCategory,
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