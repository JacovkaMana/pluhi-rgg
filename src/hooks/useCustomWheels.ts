import { useState, useEffect, useCallback } from "react";
import { fetchSpecialWheels, SpecialWheel } from "@/lib/sheets";

export const useCustomWheels = () => {
  const [wheels, setWheels] = useState<SpecialWheel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWheels = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchSpecialWheels();
      setWheels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setWheels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWheels();
  }, [fetchWheels]);

  return {
    wheels,
    loading,
    error,
    refetch: fetchWheels,
  };
};