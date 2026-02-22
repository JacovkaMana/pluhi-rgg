import { useState, useEffect, useCallback } from "react";
import { supabase, Player, PlayerGame } from "@/lib/supabase";

export interface PlayerWithGames extends Player {
  gameHistory: PlayerGame[];
}

export const usePlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("players")
        .select("*")
        .order("name");

      if (fetchError) throw fetchError;
      setPlayers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // Update player score
  const updatePlayerScore = async (playerId: string, newScore: number) => {
    try {
      const { error: updateError } = await supabase
        .from("players")
        .update({ score: newScore, updated_at: new Date().toISOString() })
        .eq("id", playerId);

      if (updateError) throw updateError;

      // Update local state
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, score: newScore } : p))
      );
    } catch (err) {
      console.error("Failed to update player score:", err);
      throw err;
    }
  };

  // Update player's current game
  const setCurrentGame = async (
    playerId: string,
    gameId: string,
    categoryId: string
  ) => {
    try {
      const { error: updateError } = await supabase
        .from("players")
        .update({
          current_game_id: gameId,
          current_category_id: categoryId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", playerId);

      if (updateError) throw updateError;

      // Update local state
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === playerId
            ? { ...p, current_game_id: gameId, current_category_id: categoryId }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to set current game:", err);
      throw err;
    }
  };

  // Add game to player's history
  const addGameToHistory = async (
    playerId: string,
    gameName: string,
    categoryId: string,
    score: number
  ) => {
    try {
      const { data, error: insertError } = await supabase
        .from("player_games")
        .insert({
          player_id: playerId,
          game_name: gameName,
          category_id: categoryId,
          score: score,
          played_at: new Date().toISOString(),
        })
        .select();

      if (insertError) throw insertError;
      return data?.[0];
    } catch (err) {
      console.error("Failed to add game to history:", err);
      throw err;
    }
  };

  // Get player's game history
  const getPlayerGameHistory = async (playerId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("player_games")
        .select("*")
        .eq("player_id", playerId)
        .order("played_at", { ascending: false });

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      console.error("Failed to fetch game history:", err);
      return [];
    }
  };

  // Update player items
  const updatePlayerItems = async (playerId: string, items: string[]) => {
    try {
      const { error: updateError } = await supabase
        .from("players")
        .update({ items, updated_at: new Date().toISOString() })
        .eq("id", playerId);

      if (updateError) throw updateError;

      // Update local state
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, items } : p))
      );
    } catch (err) {
      console.error("Failed to update player items:", err);
      throw err;
    }
  };

  return {
    players,
    loading,
    error,
    refetch: fetchPlayers,
    updatePlayerScore,
    setCurrentGame,
    addGameToHistory,
    getPlayerGameHistory,
    updatePlayerItems,
  };
};
