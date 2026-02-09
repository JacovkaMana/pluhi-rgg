import { cn } from "@/lib/utils";
import { Dices, Map } from "lucide-react";

interface TabNavigationProps {
  activeTab: "roulette" | "map";
  onTabChange: (tab: "roulette" | "map") => void;
}

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="flex gap-1 p-1 bg-secondary rounded-lg">
      <button
        onClick={() => onTabChange("roulette")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200",
          "text-sm font-medium",
          activeTab === "roulette"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary-foreground/10"
        )}
      >
        <Dices className="w-4 h-4" />
        Roulette
      </button>
      <button
        onClick={() => onTabChange("map")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200",
          "text-sm font-medium",
          activeTab === "map"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary-foreground/10"
        )}
      >
        <Map className="w-4 h-4" />
        Map
      </button>
    </div>
  );
};
