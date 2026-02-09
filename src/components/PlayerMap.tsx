import { usePlayers, Player } from "@/hooks/usePlayers";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getTileConfig, getTileType, TileType } from "@/lib/tileConfig";

const TOTAL_CELLS = 100;
const CELLS_PER_ROW = 10;

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
}

const Cell = ({ number, players }: CellProps) => {
  const hasPlayers = players.length > 0;
  const tileConfig = getTileConfig(number);
  const tileType = getTileType(number);

  const getTileStyles = (type: TileType) => {
    switch (type) {
      case 'shiny':
        return 'bg-gradient-to-br from-yellow-400/20 to-amber-500/20 border-yellow-500/50 hover:from-yellow-400/30 hover:to-amber-500/30';
      case 'red':
        return 'bg-gradient-to-br from-red-500/20 to-rose-600/20 border-red-500/50 hover:from-red-500/30 hover:to-rose-600/30';
      default:
        return 'bg-secondary/30 hover:bg-secondary/50';
    }
  };

  return (
    <div
      className={cn(
        "relative aspect-square border border-border/50 rounded-md",
        "flex flex-col items-center justify-center gap-1",
        getTileStyles(tileType),
        hasPlayers && "ring-2 ring-primary/50 ring-offset-2 ring-offset-secondary/50"
      )}
    >
      <span className="absolute top-1 left-1 text-[10px] text-muted-foreground font-mono">
        {number}
      </span>
      
      {tileConfig.label && (
        <span className="absolute top-1 right-1 text-xs">
          {tileConfig.label}
        </span>
      )}
      
      {players.length > 0 && (
        <div className="flex flex-wrap justify-center gap-0.5 p-1">
          {players.map((player) => (
            <Tooltip key={player.id}>
              <TooltipTrigger asChild>
                <div className="relative cursor-pointer group hover:scale-105 transition-transform duration-200">
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-3 border-white shadow-lg object-cover"
                  />
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
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-20 h-20 rounded-full border-3 border-primary shadow-lg"
                  />
                  <div>
                    <h4 className="font-bold text-foreground">{player.name}</h4>
                    <p className="text-sm text-primary">Score: {player.score}</p>
                    {player.items.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Items:</p>
                        <div className="flex flex-wrap gap-1">
                          {player.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground"
                            >
                              {item}
                            </span>
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

  // Group players by their score (position on board)
  const playersByPosition = players.reduce((acc, player) => {
    const pos = Math.min(Math.max(player.score, 1), TOTAL_CELLS);
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(player);
    return acc;
  }, {} as Record<number, Player[]>);

  // Build grid rows (from top to bottom, but cells numbered from bottom)
  const rows: number[][] = [];
  for (let row = 0; row < TOTAL_CELLS / CELLS_PER_ROW; row++) {
    const startCell = TOTAL_CELLS - row * CELLS_PER_ROW;
    const rowCells: number[] = [];
    for (let col = 0; col < CELLS_PER_ROW; col++) {
      // Snake pattern
      const cell = row % 2 === 0 
        ? startCell - col 
        : startCell - (CELLS_PER_ROW - 1 - col);
      rowCells.push(cell);
    }
    rows.push(rowCells);
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-10 gap-1 p-4 bg-card border border-border rounded-xl">
        {rows.map((rowCells, rowIdx) => (
          rowCells.map((cellNum) => (
            <Cell
              key={cellNum}
              number={cellNum}
              players={playersByPosition[cellNum] || []}
            />
          ))
        ))}
      </div>
      
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="text-sm text-muted-foreground">
          Hover over players to see their items
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-400/20 to-amber-500/20 border border-yellow-500/50" />
            <span className="text-muted-foreground">★ Shiny (5, 10, 15...80)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-red-500/20 to-rose-600/20 border border-red-500/50" />
            <span className="text-muted-foreground">⚠ Danger (81-100)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
