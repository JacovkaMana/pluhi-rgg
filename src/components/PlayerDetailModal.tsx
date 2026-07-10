import { useState } from "react";
import { Player, Game, Item } from "@/lib/sheets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useGameLists } from "@/hooks/useGameLists";
import { useItems } from "@/hooks/useItems";
import { Badge } from "@/components/ui/badge";
import { GameDetailModal } from "./GameDetailModal";
import { ItemDetailModal } from "./ItemDetailModal";

interface PlayerDetailModalProps {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlayerDetailModal = ({
  player,
  open,
  onOpenChange,
}: PlayerDetailModalProps) => {
  const { games: allGames } = useGameLists();
  const { items: allItems } = useItems();

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);

  if (!player) return null;

  const getGameByName = (name: string): Game | undefined => {
    return allGames.find((g) => g.name === name);
  };

  const getItemByName = (name: string): Item | undefined => {
    return allItems.find((i) => i.name === name);
  };

  const handleGameClick = (gameName: string) => {
    const game = getGameByName(gameName);
    if (game) {
      setSelectedGame(game);
      setGameModalOpen(true);
    }
  };

  const handleItemClick = (itemName: string) => {
    const item = getItemByName(itemName);
    if (item) {
      setSelectedItem(item);
      setItemModalOpen(true);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle className="text-xl">{player.name}</DialogTitle>
            <DialogDescription>
              Player details and inventory
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {player.avatar ? (
              <img
                src={player.avatar}
                alt={player.name}
                className="w-24 h-24 rounded-full border-4 border-primary shadow-lg object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-primary shadow-lg bg-secondary flex items-center justify-center text-5xl">
                {player.avatarEmoji || "👤"}
              </div>
            )}

            <div className="flex gap-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Gold</p>
                <p className="text-2xl font-bold text-primary">{player.gold}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold text-amber-500">{player.score}</p>
              </div>
            </div>

            {player.items && player.items.length > 0 && (
              <div className="w-full">
                <p className="text-sm font-medium mb-2">Items</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {player.items.map((item, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleItemClick(item)}
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {player.games && player.games.length > 0 && (
              <div className="w-full">
                <p className="text-sm font-medium mb-2">Games Played</p>
                <div className="space-y-2 overflow-y-auto scrollbar-hide">
                  {player.games.map((game, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap justify-between items-start gap-2 p-2 bg-secondary/50 rounded-md hover:bg-secondary/70 transition-colors cursor-pointer"
                      onClick={() => handleGameClick(game.name)}
                    >
                      <span className="text-sm leading-tight">{game.name}</span>
                      <span className="text-sm text-muted-foreground shrink-0">
                        +{game.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <GameDetailModal
        game={selectedGame}
        open={gameModalOpen}
        onOpenChange={setGameModalOpen}
      />

      <ItemDetailModal
        item={selectedItem}
        open={itemModalOpen}
        onOpenChange={setItemModalOpen}
      />
    </>
  );
};
