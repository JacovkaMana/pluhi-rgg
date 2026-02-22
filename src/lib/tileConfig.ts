export type TileType = 'normal' | 'shiny' | 'red' | 'minus';

export interface TileConfig {
  type: TileType;
  label?: string;
  description?: string;
  value?: number;
}

// Shiny tiles: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80
export const SHINY_TILES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];

// Red tiles: 81-100
export const RED_TILES_START = 81;
export const RED_TILES_END = 100;

// Minus tiles: -1 to -40
export const MINUS_TILES_START = -40;
export const MINUS_TILES_END = -1;

// Zero tile
export const ZERO_TILE = 0;

export const TILE_CONFIGS: Record<TileType, TileConfig> = {
  normal: { type: 'normal' },
  shiny: { type: 'shiny', label: '★', description: 'Shiny tile - special bonus!' },
  red: { type: 'red', label: '⚠', description: 'Danger zone!' },
  minus: { type: 'minus', label: '−', description: 'Minus tile!' },
};

export const isShinyTile = (tileNumber: number): boolean => {
  return SHINY_TILES.includes(tileNumber);
};

export const isRedTile = (tileNumber: number): boolean => {
  return tileNumber >= RED_TILES_START && tileNumber <= RED_TILES_END;
};

export const isMinusTile = (tileNumber: number): boolean => {
  return tileNumber >= MINUS_TILES_START && tileNumber <= MINUS_TILES_END;
};

export const getTileType = (tileNumber: number): TileType => {
  if (isMinusTile(tileNumber)) return 'minus';
  if (isRedTile(tileNumber)) return 'red';
  if (isShinyTile(tileNumber)) return 'shiny';
  return 'normal';
};

export const getTileConfig = (tileNumber: number): TileConfig => {
  const type = getTileType(tileNumber);
  if (type === 'minus') {
    return { ...TILE_CONFIGS[type], value: tileNumber, description: `Minus ${Math.abs(tileNumber)} points!` };
  }
  return TILE_CONFIGS[type];
};