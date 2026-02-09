import { useState, useEffect } from "react";

export interface GameList {
  id: string;
  name: string;
  icon: string;
  games: string[];
}

export const useGameLists = () => {
  const [lists, setLists] = useState<GameList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLists = async () => {
      try {
        // Fetch the index file
        const indexRes = await fetch("/lists/_index.json");
        if (!indexRes.ok) throw new Error("Failed to load lists index");
        const index = await indexRes.json();

        // Fetch all list files in parallel
        const listPromises = index.files.map(async (file: string) => {
          console.log(file)
          const res = await fetch(`/lists/${file}`);
          console.log(res)
          if (!res.ok) throw new Error(`Failed to load ${file}`);
          return res.json();
        });

        const loadedLists = await Promise.all(listPromises);
        setLists(loadedLists);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadLists();
  }, []);

  return { lists, loading, error };
};
