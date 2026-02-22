/**
 * Migration Script: Export local data to Supabase
 *
 * Usage:
 * 1. Configure your Supabase credentials in .env:
 *    SUPABASE_URL=your_supabase_project_url
 *    SUPABASE_ANON_KEY=your_supabase_anon_key
 *
 * 2. Run the Supabase schema first (supabase/schema.sql) in your Supabase SQL Editor
 *
 * 3. Run this script: npx tsx scripts/migrate-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Types
interface GameCategory {
  id: string;
  name: string;
  icon: string;
  games: string[];
}

interface Game {
  id: string;
  name: string;
  category_id: string;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  items: string[];
}

interface CustomWheel {
  id: string;
  name: string;
  icon: string;
  options: { id: string; name: string; icon: string }[];
}

interface WheelOption {
  id: string;
  wheel_id: string;
  name: string;
  icon: string;
  display_order: number;
}

// Get Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env');
  console.log('\nPlease add these to your .env file:');
  console.log('SUPABASE_URL=https://your-project.supabase.co');
  console.log('SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to load JSON file
function loadJson<T>(filePath: string): T {
  const fullPath = path.join(process.cwd(), filePath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(content);
}

// Migrate game categories
async function migrateGameCategories() {
  console.log('\n📁 Migrating game categories...');
   
  // Load all list files from public/lists
  const listsIndex = loadJson<{ files: string[] }>('public/lists/_index.json');
  
  const categories: GameCategory[] = [];
  
  for (const file of listsIndex.files) {
    const category = loadJson<GameCategory>(`public/lists/${file}`);
    categories.push(category);
  }
  
  console.log(`  Found ${categories.length} categories`);
  
  // Insert into Supabase
  for (const category of categories) {
    const { error } = await supabase
      .from('game_categories')
      .upsert({
        id: category.id,
        name: category.name,
        icon: category.icon,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ❌ Error inserting ${category.id}:`, error.message);
    } else {
      console.log(`  ✅ Inserted: ${category.name}`);
    }
  }
  
  return categories;
}

// Migrate games to separate table
async function migrateGames() {
  console.log('\n🎮 Migrating games...');
   
  // Load all list files from public/lists
  const listsIndex = loadJson<{ files: string[] }>('public/lists/_index.json');
  
  const games: Game[] = [];
  
  for (const file of listsIndex.files) {
    const category = loadJson<GameCategory>(`public/lists/${file}`);
    
    // Create individual game entries
    for (const gameName of category.games) {
      games.push({
        id: `${category.id}-${gameName.toLowerCase().replace(/\s+/g, '-')}`,
        name: gameName,
        category_id: category.id
      });
    }
  }
  
  console.log(`  Found ${games.length} games`);
  
  // Insert into Supabase
  let insertedCount = 0;
  for (const game of games) {
    const { error } = await supabase
      .from('games')
      .upsert({
        id: game.id,
        name: game.name,
        category_id: game.category_id
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ❌ Error inserting ${game.id}:`, error.message);
    } else {
      insertedCount++;
    }
  }
  
  console.log(`  ✅ Inserted ${insertedCount} games`);
}

// Migrate players
async function migratePlayers() {
  console.log('\n👥 Migrating players...');
  
  const playersIndex = loadJson<{ files: string[] }>('public/players/_index.json');
  
  const players: Player[] = [];
  
  for (const file of playersIndex.files) {
    const player = loadJson<Player>(`public/players/${file}`);
    players.push(player);
  }
  
  console.log(`  Found ${players.length} players`);
  
  // Insert into Supabase
  for (const player of players) {
    const { error } = await supabase
      .from('players')
      .upsert({
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        score: player.score,
        items: player.items,
        current_game_id: null,
        current_category_id: null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ❌ Error inserting ${player.id}:`, error.message);
    } else {
      console.log(`  ✅ Inserted: ${player.name} (score: ${player.score})`);
    }
  }
}

// Migrate custom wheels
async function migrateCustomWheels() {
  console.log('\n🎡 Migrating custom wheels...');
   
  // Extract default wheels from the source file
  const sourceContent = fs.readFileSync(path.join(process.cwd(), 'src/hooks/useCustomWheels.ts'), 'utf-8');
  
  // Parse defaultWheels from the source
  const defaultWheelsMatch = sourceContent.match(/const defaultWheels: ComponentWheel\[\] = (\[[\s\S]*?\]);/);
  
  if (!defaultWheelsMatch) {
    console.log('  ⚠️ Could not find defaultWheels in source, using empty array');
    return;
  }
  
  // Create a safe eval context to parse the wheels
  const wheelsJson = defaultWheelsMatch[1]
    .replace(/,\s*\]/g, ']')  // Fix trailing commas
    .replace(/'/g, '"');  // Replace single quotes with double quotes
  
  let wheels: CustomWheel[];
  try {
    // Use Function constructor to safely evaluate the array
    wheels = new Function(`return ${wheelsJson}`)();
  } catch (e) {
    console.error('  ❌ Error parsing wheels:', e);
    return;
  }
  
  console.log(`  Found ${wheels.length} custom wheels`);
  
  // Insert wheels into Supabase
  for (const wheel of wheels) {
    const { error: wheelError } = await supabase
      .from('custom_wheels')
      .upsert({
        id: wheel.id,
        name: wheel.name,
        icon: wheel.icon,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    
    if (wheelError) {
      console.error(`  ❌ Error inserting wheel ${wheel.id}:`, wheelError.message);
      continue;
    }
    
    console.log(`  ✅ Inserted wheel: ${wheel.name}`);
    
    // Insert wheel options
    for (let i = 0; i < wheel.options.length; i++) {
      const option = wheel.options[i];
      const { error: optionError } = await supabase
        .from('wheel_options')
        .upsert({
          id: option.id,
          wheel_id: wheel.id,
          name: option.name,
          icon: option.icon,
          display_order: i
        }, { onConflict: 'id' });
      
      if (optionError) {
        console.error(`    ❌ Error inserting option ${option.id}:`, optionError.message);
      }
    }
    
    console.log(`    ✅ Inserted ${wheel.options.length} options for ${wheel.name}`);
  }
}

// Main migration function
async function migrate() {
  console.log('🚀 Starting migration to Supabase...\n');
  console.log(`📡 Supabase URL: ${supabaseUrl}`);
   
  try {
    // Test connection - just check if we can reach Supabase
    const { error: testError } = await supabase.from('game_categories').select('id').limit(1);
    if (testError && !testError.message.includes('does not exist')) {
      console.error('❌ Failed to connect to Supabase:', testError.message);
      process.exit(1);
    }
    console.log('✅ Connected to Supabase');
    
    // Run migrations
    await migrateGameCategories();
    await migrateGames();
    await migratePlayers();
    await migrateCustomWheels();
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
