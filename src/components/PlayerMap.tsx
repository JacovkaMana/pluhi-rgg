import { useState } from "react";
import { usePlayers } from "@/hooks/usePlayers";
import { useGameLists } from "@/hooks/useGameLists";
import { useItems } from "@/hooks/useItems";
import { Player, Game, Item } from "@/lib/sheets";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PlayerDetailModal } from "@/components/PlayerDetailModal";
import { GameDetailModal } from "@/components/GameDetailModal";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { cn } from "@/lib/utils";
import { getTileConfig, getTileType, TileType, MINUS_TILES_START, MINUS_TILES_END, ZERO_TILE } from "@/lib/tileConfig";
import { TOTAL_CELLS, MINUS_CELLS, CELLS_PER_ROW } from "@/config/mapConfig";
import zonesConfig from "@/config/zones.json";
import { Badge } from "@/components/ui/badge";

interface Zone {
  id: string;
  name: string;
  ranges: number[][];
  color: string;
}

const zones: Zone[] = zonesConfig.zones;

const getCellZone = (cellNumber: number): Zone | undefined => {
  return zones.find((zone) =>
    zone.ranges.some(([start, end]) => cellNumber >= start && cellNumber <= end)
  );
};

// Calculate cell position accounting for snake pattern (like board games)
const getCellPosition = (cellNumber: number): { row: number; col: number } => {
  const row = Math.floor((cellNumber - 1) / CELLS_PER_ROW);
  const colInRow = (cellNumber - 1) % CELLS_PER_ROW;
  // Alternate direction each row (snake pattern)
  const col = row % 2 === 0 ? colInRow : CELLS_PER_ROW - 1 - colInRow;
  return { row: Math.floor((TOTAL_CELLS - 1) / CELLS_PER_ROW) - row, col };
};

interface CellProps {
  number: number;
  players: Player[];
  onPlayerClick: (player: Player) => void;
  onGameClick: (gameName: string) => void;
  onItemClick: (itemName: string) => void;
}

const Cell = ({ number, players, onPlayerClick, onGameClick, onItemClick }: CellProps) => {
  const hasPlayers = players.length > 0;
  const tileConfig = getTileConfig(number);
  const tileType = getTileType(number);
  const cellZone = getCellZone(number);

  const getTileStyles = (type: TileType) => {
    switch (type) {
      case 'shiny':
      case 'red':
      case 'minus':
        return 'bg-secondary/30 hover:bg-secondary/50';
      default:
        return 'bg-secondary/30 hover:bg-secondary/50';
    }
  };

  const zoneBorderStyle = cellZone ? {
    borderColor: cellZone.color,
    borderWidth: '2px',
  } : {};

  // Display number: show negative sign for minus tiles
  const displayNumber = number < 0 ? `${number}` : number;
  
  return (
    <div
      className={cn(
        "relative aspect-square border border-border/50 rounded-md",
        "flex flex-col items-center justify-center gap-1",
        getTileStyles(tileType),
        hasPlayers && "ring-2 ring-primary/50 ring-offset-2 ring-offset-secondary/50"
      )}
      style={zoneBorderStyle}
    >
      <span className={cn(
        "absolute top-1 left-1 text-[10px] text-muted-foreground font-mono",
        tileType === 'minus' && "text-violet-500 font-bold"
      )}>
        {displayNumber}
      </span>
      
      {tileConfig.label && (
        <span className={cn(
          "absolute top-1 right-1 text-sm font-bold",
          tileType === 'shiny' && "text-yellow-500",
          tileType === 'red' && "text-red-500",
          tileType === 'minus' && "text-violet-500"
        )}>
          {tileConfig.label}
        </span>
      )}
      
      {tileType === 'minus' && tileConfig.value && (
        <span className="text-xs text-violet-500 font-bold">
          −{Math.abs(tileConfig.value)}
        </span>
      )}
      
      {players.length > 0 && (
        <div className="flex flex-wrap justify-center gap-0.5 p-1">
          {players.map((player) => (
            <Tooltip key={player.id}>
              <TooltipTrigger asChild>
                <div
                  className="relative cursor-pointer group hover:scale-105 transition-transform duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayerClick(player);
                  }}
                >
                  {player.avatar ? (
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-3 border-white shadow-lg object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-3 border-white shadow-lg bg-secondary flex items-center justify-center text-2xl">
                      {player.avatarEmoji || '👤'}
                    </div>
                  )}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-background text-[12px] px-2 rounded text-foreground font-medium truncate max-w-[70px]">
                    {player.name}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-card border-border p-3 max-w-xs"
              >
                <div className="flex items-start gap-3">
                  {player.avatar ? (
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-20 h-20 rounded-full border-3 border-primary shadow-lg object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full border-3 border-primary shadow-lg bg-secondary flex items-center justify-center text-4xl">
                      {player.avatarEmoji || '👤'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground">{player.name}</h4>
                    <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                      <span>Gold: <span className="text-primary font-medium">{player.gold}</span></span>
                      <span>Score: <span className="text-amber-500 font-medium">{player.score}</span></span>
                    </div>
                    {player.items && player.items.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Items:</p>
                        <div className="flex flex-wrap gap-1">
                          {player.items.map((item, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                              onClick={() => onItemClick(item)}
                            >
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {player.games && player.games.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Games:</p>
                        <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-hide">
                          {player.games.map((game, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between gap-2 text-xs cursor-pointer hover:bg-secondary/50 p-1 rounded transition-colors"
                              onClick={() => onGameClick(game.name)}
                            >
                              <span className="text-foreground truncate">{game.name}</span>
                              <span className="text-muted-foreground shrink-0">+{game.result}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  );
};

export const PlayerMap = () => {
  const { players, loading, error } = usePlayers();
  const { games: allGames } = useGameLists();
  const { items: allItems } = useItems();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);

  const getGameByName = (name: string): Game | undefined => {
    return allGames.find((g) => g.name === name);
  };

  const getItemByName = (name: string): Item | undefined => {
    return allItems.find((i) => i.name === name);
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setPlayerModalOpen(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-center p-4">
        Error loading players: {error}
      </div>
    );
  }

  const playersByPosition = players.reduce((acc, player) => {
    let pos: number;
    if (player.score < 0) {
      pos = Math.max(player.score, MINUS_TILES_START);
    } else if (player.score === 0) {
      pos = ZERO_TILE;
    } else {
      pos = Math.min(Math.max(player.score, 1), TOTAL_CELLS);
    }
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(player);
    return acc;
  }, {} as Record<number, Player[]>);

  const rows: number[][] = [];
  for (let row = 0; row < TOTAL_CELLS / CELLS_PER_ROW; row++) {
    const startCell = TOTAL_CELLS - row * CELLS_PER_ROW;
    const rowCells: number[] = [];
    for (let col = 0; col < CELLS_PER_ROW; col++) {
      const cell = row % 2 === 0
        ? startCell - col
        : startCell - (CELLS_PER_ROW - 1 - col);
      rowCells.push(cell);
    }
    rows.push(rowCells);
  }

  const minusRow: number[] = [];
  for (let i = MINUS_TILES_END; i >= MINUS_TILES_START; i--) {
    minusRow.push(i);
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main board: tiles 1-100 */}
      <div className="grid grid-cols-10 gap-1 p-4 bg-card border border-border rounded-xl">
        {rows.map((rowCells, rowIdx) => (
          rowCells.map((cellNum) => (
            <Cell
              key={cellNum}
              number={cellNum}
              players={playersByPosition[cellNum] || []}
              onPlayerClick={handlePlayerClick}
              onGameClick={handleGameClick}
              onItemClick={handleItemClick}
            />
          ))
        ))}
      </div>

      {/* Zero tile */}
      <div className="mt-2 flex justify-center">
        <div className="w-16">
          <Cell
            key={ZERO_TILE}
            number={ZERO_TILE}
            players={playersByPosition[ZERO_TILE] || []}
            onPlayerClick={handlePlayerClick}
            onGameClick={handleGameClick}
            onItemClick={handleItemClick}
          />
        </div>
      </div>

      {/* Minus tiles row: -20 to -1 */}
      <div className="mt-2 grid grid-cols-10 gap-1 p-4 bg-card border border-border rounded-xl">
        {minusRow.map((cellNum) => (
          <Cell
            key={cellNum}
            number={cellNum}
            players={playersByPosition[cellNum] || []}
            onPlayerClick={handlePlayerClick}
            onGameClick={handleGameClick}
            onItemClick={handleItemClick}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="text-sm text-muted-foreground">
          Click on players to see details
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500 font-bold">★</span>
            <span>Shiny (5, 10, 15...80)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-red-500 font-bold">⚠</span>
            <span>Danger (81-100)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-violet-500 font-bold">−</span>
            <span>Minus (−20 to −1)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">0</span>
            <span>Zero</span>
          </div>
        </div>
      </div>

      <PlayerDetailModal
        player={selectedPlayer}
        open={playerModalOpen}
        onOpenChange={setPlayerModalOpen}
      />

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
    </div>
  );
};
