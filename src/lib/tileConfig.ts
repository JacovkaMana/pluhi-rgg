export type TileType = 'normal' | 'shiny' | 'red';

export interface TileConfig {
  type: TileType;
  label?: string;
  description?: string;
}

// Shiny tiles: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80
export const SHINY_TILES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];

// Red tiles: 81-100
export const RED_TILES_START = 81;
export const RED_TILES_END = 100;

export const TILE_CONFIGS: Record<TileType, TileConfig> = {
  normal: { type: 'normal' },
  shiny: { type: 'shiny', label: '★', description: 'Shiny tile - special bonus!' },
  red: { type: 'red', label: '⚠', description: 'Danger zone!' },
};

export const isShinyTile = (tileNumber: number): boolean => {
  return SHINY_TILES.includes(tileNumber);
};

export const isRedTile = (tileNumber: number): boolean => {
  return tileNumber >= RED_TILES_START && tileNumber <= RED_TILES_END;
};

export const getTileType = (tileNumber: number): TileType => {
  if (isRedTile(tileNumber)) return 'red';
  if (isShinyTile(tileNumber)) return 'shiny';
  return 'normal';
};

export const getTileConfig = (tileNumber: number): TileConfig => {
  const type = getTileType(tileNumber);
  return TILE_CONFIGS[type];
};