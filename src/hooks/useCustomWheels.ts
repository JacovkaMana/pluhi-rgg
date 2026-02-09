import { useState, useEffect } from "react";
import { CustomWheel } from "@/components/CustomWheel";

const STORAGE_KEY = "game-roulette-custom-wheels";

// Default custom wheels
const defaultWheels: CustomWheel[] = [
  {
    id: "challenges",
    name: "Challenges",
    icon: "🎯",
    options: [
      { id: "c1", name: "No Power-ups", icon: "🚫" },
      { id: "c2", name: "Speedrun", icon: "⏱️" },
      { id: "c3", name: "100% Completion", icon: "💯" },
      { id: "c4", name: "Hard Mode", icon: "💀" },
      { id: "c5", name: "Blind Play", icon: "🙈" },
      { id: "c6", name: "Co-op Only", icon: "👥" },
    ],
  },
  {
    id: "modifiers",
    name: "Modifiers",
    icon: "🎲",
    options: [
      { id: "m1", name: "Double Points", icon: "✨" },
      { id: "m2", name: "Half Health", icon: "❤️" },
      { id: "m3", name: "Infinite Ammo", icon: "🔫" },
      { id: "m4", name: "No Saves", icon: "💾" },
      { id: "m5", name: "Time Limit", icon: "⏰" },
    ],
  },
  {
    id: "rewards",
    name: "Rewards",
    icon: "🏆",
    options: [
      { id: "r1", name: "Extra Life", icon: "❤️" },
      { id: "r2", name: "Power-up", icon: "⚡" },
      { id: "r3", name: "Bonus Points", icon: "🌟" },
      { id: "r4", name: "Skip Level", icon: "⏭️" },
      { id: "r5", name: "Mystery Box", icon: "🎁" },
    ],
  },
];

export const useCustomWheels = () => {
  const [wheels, setWheels] = useState<CustomWheel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWheels = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setWheels(parsed);
        } else {
          setWheels(defaultWheels);
        }
      } catch (error) {
        console.error("Failed to load custom wheels:", error);
        setWheels(defaultWheels);
      } finally {
        setLoading(false);
      }
    };

    loadWheels();
  }, []);

  const saveWheels = (newWheels: CustomWheel[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWheels));
      setWheels(newWheels);
    } catch (error) {
      console.error("Failed to save custom wheels:", error);
    }
  };

  const addWheel = (wheel: CustomWheel) => {
    const newWheels = [...wheels, wheel];
    saveWheels(newWheels);
  };

  const updateWheel = (id: string, updatedWheel: Partial<CustomWheel>) => {
    const newWheels = wheels.map((w) =>
      w.id === id ? { ...w, ...updatedWheel } : w
    );
    saveWheels(newWheels);
  };

  const deleteWheel = (id: string) => {
    const newWheels = wheels.filter((w) => w.id !== id);
    saveWheels(newWheels);
  };

  const resetToDefaults = () => {
    saveWheels(defaultWheels);
  };

  return {
    wheels,
    loading,
    addWheel,
    updateWheel,
    deleteWheel,
    resetToDefaults,
  };
};