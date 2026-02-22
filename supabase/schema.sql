-- Supabase Schema for Game Roulette Studio
-- Run this SQL in your Supabase SQL Editor to create the database tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Game Categories (lists of games)
CREATE TABLE game_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games table (individual games)
CREATE TABLE games (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES game_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
-- Now includes current_game reference and game history is in player_games
CREATE TABLE players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    items TEXT[] NOT NULL DEFAULT '{}',
    current_game_id TEXT, -- Reference to a game in a category
    current_category_id TEXT, -- Reference to the category the current game belongs to
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player Game History (new table for game history with scores)
CREATE TABLE player_games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    game_name TEXT NOT NULL,
    category_id TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    played_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Wheels table
CREATE TABLE custom_wheels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wheel Options table
CREATE TABLE wheel_options (
    id TEXT PRIMARY KEY,
    wheel_id TEXT NOT NULL REFERENCES custom_wheels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_games_category_id ON games(category_id);
CREATE INDEX idx_player_games_player_id ON player_games(player_id);
CREATE INDEX idx_player_games_played_at ON player_games(played_at DESC);
CREATE INDEX idx_wheel_options_wheel_id ON wheel_options(wheel_id);

-- Enable Row Level Security (RLS)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_wheels ENABLE ROW LEVEL SECURITY;
ALTER TABLE wheel_options ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed for your auth setup)
CREATE POLICY "Public read access for games" ON games FOR SELECT USING (true);
CREATE POLICY "Public read access for game_categories" ON game_categories FOR SELECT USING (true);
CREATE POLICY "Public read access for players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read access for player_games" ON player_games FOR SELECT USING (true);
CREATE POLICY "Public read access for custom_wheels" ON custom_wheels FOR SELECT USING (true);
CREATE POLICY "Public read access for wheel_options" ON wheel_options FOR SELECT USING (true);

-- Create policies for authenticated users to insert/update/delete
-- Uncomment these if you want to restrict write access to authenticated users
-- CREATE POLICY "Authenticated can insert game_categories" ON game_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated can update game_categories" ON game_categories FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated can insert players" ON players FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated can update players" ON players FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated can insert player_games" ON player_games FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated can insert custom_wheels" ON custom_wheels FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated can update custom_wheels" ON custom_wheels FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated can insert wheel_options" ON wheel_options FOR INSERT WITH CHECK (auth.role() = 'authenticated');
