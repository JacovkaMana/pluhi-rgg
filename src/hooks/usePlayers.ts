import { useState, useEffect, useCallback } from "react";
import { fetchPlayers, Player } from "@/lib/sheets";

export const usePlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const playersData = await fetchPlayers();
      setPlayers(playersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    players,
    loading,
    error,
    refetch: fetchData,
  };
};