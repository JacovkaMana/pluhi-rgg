import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchGames, fetchCategories, Game, Category } from "@/lib/sheets";
import { getCategoryColor } from "@/lib/wheelUtils";

export const isIconUrl = (icon: string): boolean => {
  return icon.startsWith("http://") || icon.startsWith("https://");
};

export interface GameCategoryWithGames extends Category {
  games: string[];
  weight: number;
  color: string;
}

export const useGameLists = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [gamesData, categoriesData] = await Promise.all([
        fetchGames(),
        fetchCategories(),
      ]);
      setGames(gamesData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const lists = useMemo((): GameCategoryWithGames[] => {
    const categoryMap = new Map<string, { games: string[]; name: string; icon: string; weight: number; color: string }>();
    
    categories.forEach((cat) => {
      categoryMap.set(cat.id, {
        games: [],
        name: cat.name,
        icon: cat.icon,
        weight: cat.weight,
        color: cat.color || getCategoryColor(cat.id),
      });
    });
    
    games.forEach((game) => {
      game.categories.forEach((catId) => {
        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, { games: [], name: catId, icon: '🎮', weight: 1, color: getCategoryColor(catId) });
        }
        categoryMap.get(catId)!.games.push(game.name);
      });
    });

    return Array.from(categoryMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      icon: data.icon,
      games: data.games,
      weight: data.weight,
      color: data.color,
    }));
  }, [games, categories]);

  const getCategoryById = useCallback(
    (id: string): GameCategoryWithGames | undefined => {
      return lists.find((list) => list.id === id);
    },
    [lists]
  );

  const getGameFromCategory = useCallback(
    (categoryId: string, gameIndex: number): string | undefined => {
      const category = getCategoryById(categoryId);
      if (!category || !category.games) return undefined;
      return category.games[gameIndex];
    },
    [getCategoryById]
  );

  const getAllGames = useCallback((): string[] => {
    return lists.flatMap((list) => list.games || []);
  }, [lists]);

  return {
    lists,
    games,
    categories,
    loading,
    error,
    refetch: fetchData,
    getCategoryById,
    getGameFromCategory,
    getAllGames,
  };
};