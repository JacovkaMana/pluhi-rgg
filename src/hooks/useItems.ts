import { useState, useEffect, useCallback } from "react";
import { fetchItems, Item } from "@/lib/sheets";

export const useItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getItemsByType = useCallback((type: string): Item[] => {
    return items.filter((item) => item.type === type);
  }, [items]);

  const getNormalItems = useCallback((): Item[] => {
    return getItemsByType("Обычный");
  }, [getItemsByType]);

  const getRandomNormalItem = useCallback((): Item | null => {
    const normalItems = getNormalItems();
    if (normalItems.length === 0) return null;
    return normalItems[Math.floor(Math.random() * normalItems.length)];
  }, [getNormalItems]);

  return {
    items,
    loading,
    error,
    refetch: fetchData,
    getItemsByType,
    getNormalItems,
    getRandomNormalItem,
  };
};