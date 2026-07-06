import { useState } from "react";
import { Game } from "@/lib/sheets";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, User, Gamepad2, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface AllGamesListProps {
  games: Game[];
  onSelectGame?: (game: Game) => void;
}

export const AllGamesList = ({ games, onSelectGame }: AllGamesListProps) => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
    onSelectGame?.(game);
  };

  const handleCloseInfo = () => {
    setSelectedGame(null);
  };

  if (games.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No games available
      </Card>
    );
  }

  return (
    <div className="flex gap-4 h-[500px]">
      <Card className="flex-1 border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            All Games
            <span className="text-sm text-muted-foreground">({games.length})</span>
          </h2>
        </div>
        <ScrollArea className="h-[calc(100%-60px)] p-4">
          <ul className="space-y-2">
            {games.map((game, index) => (
              <li
                key={game.id}
                onClick={() => handleGameClick(game)}
                className={cn(
                  "p-3 rounded-lg transition-colors duration-200 border border-border cursor-pointer",
                  selectedGame?.id === game.id
                    ? "bg-primary/20 border-primary"
                    : "bg-secondary/30 hover:bg-secondary/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground font-medium truncate">{game.name}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {game.categories.slice(0, 3).map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs px-1.5 py-0.5">
                          {cat}
                        </Badge>
                      ))}
                      {game.categories.length > 3 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          +{game.categories.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </Card>

      {selectedGame && (
        <Card className="w-80 border border-primary/50 bg-primary/5">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Game Info</h3>
            <button
              onClick={handleCloseInfo}
              className="p-1 rounded hover:bg-secondary/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ScrollArea className="h-[calc(100%-60px)] p-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-2xl font-bold text-foreground">{selectedGame.name}</h4>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="w-3 h-3" />
                    Categories
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedGame.categories.map((cat) => (
                    <Badge key={cat} className="bg-primary/20 text-primary border-primary/30">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedGame.uploader && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>Uploader</span>
                  </div>
                  <p className="text-foreground">{selectedGame.uploader}</p>
                </div>
              )}

              {selectedGame.challenge && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Challenge</span>
                  </div>
                  <p className="text-foreground">{selectedGame.challenge}</p>
                </div>
              )}

              {selectedGame.hours > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Time to Beat</span>
                  </div>
                  <p className="text-foreground">{selectedGame.hours} hours</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};