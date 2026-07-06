const API_BASE = '/api/sheets';

export interface Game {
  id: string;
  name: string;
  categories: string[];
  hours: number;
  author: string;
  uploader: string;
  challenge: string;
  created_at: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  avatarEmoji: string;
  gold: number;
  score: number;
  items: string[];
  games: { name: string; result: number }[];
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  name: string;
  type: string;
  description: string;
  cost: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  weight: number;
  color: string;
}

export interface SpecialWheel {
  id: string;
  name: string;
  icon: string;
  options: WheelOption[];
}

export interface WheelOption {
  id: string;
  name: string;
  icon: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  effect: string;
}

export interface Rule {
  id: string;
  title: string;
  content: string;
}

interface SheetResponse {
  data: string[][];
  cols: string[];
}

async function fetchSheet(sheetName: string): Promise<SheetResponse> {
  const response = await fetch(`${API_BASE}/${sheetName}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${sheetName}: ${response.statusText}`);
  }
  return response.json();
}

function parseTable(rows: string[][], cols: string[]): Record<string, string>[] {
  if (rows.length === 0) return [];
  
  const data: Record<string, string>[] = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const obj: Record<string, string> = {};
    cols.forEach((header, j) => {
      obj[header] = (row[j] || '').trim();
    });
    data.push(obj);
  }
  
  return data;
}

export async function fetchGames(): Promise<Game[]> {
  const { data: rows, cols } = await fetchSheet('Игры');
  const tableData = parseTable(rows, cols);

  return tableData.map((row, index) => ({
    id: `game_${index}`,
    name: row['Игры'] || '',
    categories: (row['Категории'] || '').split(',').map(c => c.trim()).filter(Boolean),
    hours: parseFloat(row['HLTB'] || '0') || 0,
    author: row['Кто добавил'] || 'unknown',
    uploader: row['Кто добавил'] || 'unknown',
    challenge: row['Испытание'] || row['Challenge'] || '',
    created_at: new Date().toISOString(),
  }));
}

export async function fetchPlayers(): Promise<Player[]> {
  const { data: rows, cols } = await fetchSheet('Игроки');

  if (rows.length === 0 || cols.length < 2) return [];

  const playerCount = cols.length - 1;
  const players: Player[] = [];

  const getRowValue = (rowKey: string): string[] => {
    const row = rows.find(r => (r[0] || '').trim() === rowKey);
    if (!row) return [];
    return row.slice(1);
  };

  const names = cols.slice(1);
  const scores = getRowValue('Очки');
  const golds = getRowValue('Деньги');
  const avatars = getRowValue('Ава');
  const itemsList = getRowValue('Предметы');

  const gameRows = rows.filter(r => (r[0] || '').trim().startsWith('Игра'));
  const resultRows = rows.filter(r => (r[0] || '').trim().startsWith('Результат'));

  for (let i = 0; i < playerCount; i++) {
    const name = names[i] || `Player ${i + 1}`;
    const games: { name: string; result: number }[] = [];

    for (let j = 0; j < gameRows.length; j++) {
      const gameName = gameRows[j]?.[i + 1] || '';
      const resultStr = resultRows[j]?.[i + 1] || '';
      if (gameName.trim()) {
        const result = parseInt(resultStr, 10) || 0;
        games.push({ name: gameName.trim(), result });
      }
    }

    const avatarValue = avatars[i]?.trim() || '';
    const isEmojiAvatar = !avatarValue.startsWith('http') && !avatarValue.startsWith('/');

    players.push({
      id: `player_${i}`,
      name: name.trim(),
      avatar: isEmojiAvatar ? '' : avatarValue,
      avatarEmoji: isEmojiAvatar ? avatarValue : '👤',
      gold: parseInt(golds[i], 10) || 0,
      score: parseInt(scores[i], 10) || 0,
      items: itemsList[i]?.split(',').map(s => s.trim()).filter(Boolean) || [],
      games,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return players;
}

export async function fetchItems(): Promise<Item[]> {
  const { data: rows, cols } = await fetchSheet('Предметы');
  const tableData = parseTable(rows, cols);

  return tableData.map((row, index) => ({
    id: `item_${index}`,
    name: row['Имя'] || '',
    type: row['Тип'] || 'misc',
    description: row['Описание'] || '',
    cost: parseInt(row['Стоимость'] || '0', 10) || 0,
  }));
}

export async function fetchCategories(): Promise<Category[]> {
  const { data: rows, cols } = await fetchSheet('Категории');
  const tableData = parseTable(rows, cols);

  return tableData.map((row, index) => ({
    id: row['Категории'] || `cat_${index}`,
    name: row['Категории'] || '',
    icon: '🎮',
    weight: parseInt(row['Вес'] || '1', 10) || 1,
    color: '#888888',
  }));
}

export async function fetchSpecialWheels(): Promise<SpecialWheel[]> {
  const { data: rows, cols } = await fetchSheet('Спецколеса');

  if (rows.length === 0) return [];

  const wheelMap = new Map<string, SpecialWheel>();

  for (let colIdx = 1; colIdx < cols.length; colIdx++) {
    const wheelName = cols[colIdx];
    if (!wheelName) continue;

    const wheelId = `wheel_${colIdx}`;

    wheelMap.set(wheelId, {
      id: wheelId,
      name: wheelName,
      icon: '🎡',
      options: [],
    });

    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const optionName = rows[rowIdx][colIdx];
      if (!optionName) continue;

      wheelMap.get(wheelId)!.options.push({
        id: `opt_${rowIdx}_${colIdx}`,
        name: optionName,
        icon: '',
      });
    }
  }

  return Array.from(wheelMap.values());
}

export async function fetchEvents(): Promise<Event[]> {
  const { data: rows, cols } = await fetchSheet('Ивенты');
  const tableData = parseTable(rows, cols);
  
  return tableData.map((row, index) => ({
    id: row['id'] || `event_${index}`,
    name: row['Название'] || row['Name'] || '',
    description: row['Описание'] || row['Description'] || '',
    effect: row['Эффект'] || row['Effect'] || '',
  }));
}

export async function fetchRules(): Promise<Rule[]> {
  const { data: rows, cols } = await fetchSheet('Правила');
  const tableData = parseTable(rows, cols);
  
  return tableData.map((row, index) => ({
    id: row['id'] || `rule_${index}`,
    title: row['Заголовок'] || row['Title'] || '',
    content: row['Содержание'] || row['Content'] || '',
  }));
}