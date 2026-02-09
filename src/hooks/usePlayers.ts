import { useState, useEffect } from "react";

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  items: string[];
}

export const usePlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        // Fetch the index file
        const indexRes = await fetch("/players/_index.json");
        if (!indexRes.ok) throw new Error("Failed to load players index");
        const index = await indexRes.json();

        // Fetch all player files in parallel
        const playerPromises = index.files.map(async (file: string) => {
          console.log(file)
          const res = await fetch(`/players/${file}`);
          console.log(res)
          if (!res.ok) throw new Error(`Failed to load ${file}`);
          return res.json();
        });

        const loadedPlayers = await Promise.all(playerPromises);
        setPlayers(loadedPlayers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, []);

  return { players, loading, error };
};
