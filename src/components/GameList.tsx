import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GameListProps {
  games: string[];
  categoryName: string;
  categoryIcon: string;
}

export const GameList = ({ games, categoryName, categoryIcon }: GameListProps) => {
  if (games.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No games available in this category
      </Card>
    );
  }

  return (
    <Card className="border border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span>{categoryIcon}</span>
          <span>{categoryName} Games</span>
          <span className="text-sm text-muted-foreground">({games.length})</span>
        </h2>
      </div>
      <ScrollArea className="h-[400px] p-4">
        <ul className="space-y-2">
          {games.map((game, index) => (
            <li 
              key={index} 
              className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors duration-200 border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {index + 1}
                </div>
                <span className="text-foreground">{game}</span>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </Card>
  );
};