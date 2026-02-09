import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2, History } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RollEntry {
  id: string;
  timestamp: number;
  type: "category" | "game";
  category?: string;
  categoryIcon?: string;
  game?: string;
}

const STORAGE_KEY = "game-roulette-history";

interface RollHistoryProps {
  className?: string;
}

export const RollHistory = ({ className }: RollHistoryProps) => {
  const [history, setHistory] = useState<RollEntry[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history:", error);
    }
  }, [history]);

  const addEntry = (type: "category" | "game", category?: string, categoryIcon?: string, game?: string) => {
    const newEntry: RollEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type,
      category,
      categoryIcon,
      game,
    };
    setHistory((prev) => [newEntry, ...prev].slice(0, 50)); // Keep last 50 entries
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Expose addEntry and clearHistory for parent components
  useEffect(() => {
    (window as any).rollHistoryAPI = { addEntry, clearHistory };
    return () => {
      delete (window as any).rollHistoryAPI;
    };
  }, []);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Roll History</h3>
        </div>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-muted-foreground hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* History list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {history.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              No rolls yet
            </div>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg transition-colors",
                  entry.type === "category" 
                    ? "bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20" 
                    : "bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20"
                )}
              >
                <div className="flex-shrink-0 text-2xl">
                  {entry.categoryIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded",
                      entry.type === "category" 
                        ? "bg-purple-500/20 text-purple-300" 
                        : "bg-blue-500/20 text-blue-300"
                    )}>
                      {entry.type === "category" ? "Category" : "Game"}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      • {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  {entry.type === "category" ? (
                    <p className="text-sm font-medium text-foreground truncate">
                      {entry.category}
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground mb-1">
                        {entry.category}
                      </p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {entry.game}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {history.length > 0 && (
        <div className="p-3 border-t border-border text-center">
          <span className="text-xs text-muted-foreground">
            {history.length} roll{history.length !== 1 ? "s" : ""} saved
          </span>
        </div>
      )}
    </div>
  );
};

// Hook to access roll history API
export const useRollHistory = () => {
  return {
    addCategoryEntry: (category: string, categoryIcon: string) => {
      (window as any).rollHistoryAPI?.addEntry("category", category, categoryIcon);
    },
    addGameEntry: (category: string, categoryIcon: string, game: string) => {
      (window as any).rollHistoryAPI?.addEntry("game", category, categoryIcon, game);
    },
    clearHistory: () => {
      (window as any).rollHistoryAPI?.clearHistory();
    },
  };
};