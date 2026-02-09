import { cn } from "@/lib/utils";

interface GameList {
  id: string;
  name: string;
  icon: string;
  games: string[];
}

interface GameListSelectorProps {
  lists: GameList[];
  selectedId: string | null;
  onSelect: (list: GameList) => void;
}

export const GameListSelector = ({ lists, selectedId, onSelect }: GameListSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {lists.map((list) => (
        <button
          key={list.id}
          onClick={() => onSelect(list)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
            "border border-border hover:border-primary/50",
            "bg-card hover:bg-secondary",
            selectedId === list.id && "border-primary bg-secondary glow-primary"
          )}
        >
          <span className="text-xl">{list.icon}</span>
          <span className="text-sm font-medium text-foreground">{list.name}</span>
          <span className="text-xs text-muted-foreground">({list.games.length})</span>
        </button>
      ))}
    </div>
  );
};
