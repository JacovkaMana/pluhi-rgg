import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase, GameCategory, Game } from "@/lib/supabase";
import { getCategoryColor } from "@/lib/wheelUtils";

// Helper function to check if icon is a URL
export const isIconUrl = (icon: string): boolean => {
  return icon.startsWith("http://") || icon.startsWith("https://");
};

// Extended GameCategory with games array (computed from separate games table)
export interface GameCategoryWithGames extends GameCategory {
  games: string[];
  weight: number;
  color: string;
}

export const useGameLists = () => {
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGameLists = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch both categories and games in parallel
      const [categoriesRes, gamesRes] = await Promise.all([
        supabase.from("game_categories").select("*").order("name"),
        supabase.from("games").select("*").order("name")
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (gamesRes.error) throw gamesRes.error;

      setCategories(categoriesRes.data || []);
      setGames(gamesRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGameLists();
  }, [fetchGameLists]);

  // Compute categories with their games
  const lists = useMemo((): GameCategoryWithGames[] => {
    return categories.map((category) => ({
      ...category,
      games: games
        .filter((game) => game.category_id === category.id)
        .map((game) => game.name),
      // Use weight from database or default to 1
      weight: (category as any).weight || 1,
      // Use color from database or get from wheelUtils
      color: (category as any).color || getCategoryColor(category.id),
    }));
  }, [categories, games]);

  // Get a specific category by ID
  const getCategoryById = useCallback(
    (id: string): GameCategoryWithGames | undefined => {
      return lists.find((list) => list.id === id);
    },
    [lists]
  );

  // Get a specific game from a category
  const getGameFromCategory = useCallback(
    (categoryId: string, gameIndex: number): string | undefined => {
      const category = getCategoryById(categoryId);
      if (!category || !category.games) return undefined;
      return category.games[gameIndex];
    },
    [getCategoryById]
  );

  // Get all games across all categories
  const getAllGames = useCallback((): string[] => {
    return lists.flatMap((list) => list.games || []);
  }, [lists]);

  return {
    lists,
    loading,
    error,
    refetch: fetchGameLists,
    getCategoryById,
    getGameFromCategory,
    getAllGames,
  };
};
