import pandas as pd
import json
import re
import sys

# --- CONFIGURATION ---

# 1. The Raw Allowed Categories List (from your sheet)
# ----------------------------------------------------
# These are the categories we expect to find in the raw data before grouping.
VALID_CATEGORIES = [
    "Стрелялка", "RPG", "Cozy", "Головоломки", "Аниме", "Хоррор", 
    "Адвенчура", "Кино", "Рогалик", "Стратежка", "Старьё", 
    "Говно мамонта", "Платформер", "Джокерге", "Читать", "Драммер", 
    "Симулятор", "Поинт энд клик", "Настолка", "Кооп", "Экшн", "Гоночки"
]

# 2. Category Aliases
# -------------------
# Map variations found in the table to the keys in VALID_CATEGORIES.
CATEGORY_ALIASES = {
    "Экшн-шутер": "Экшн",
    "Adventure": "Адвенчура",
    "cozy": "Cozy",
    "Стрелялки": "Стрелялка",
    "Roguelike": "Рогалик",
    "джакерке": "Джокерге",
    "Поинд энд Клик": "Поинт энд клик",
    "PnC": "Поинт энд клик",
    "Паззл": "Головоломки",
    "Стратегия": "Стратежка",
    "Симуляторы": "Симулятор",
    "Головоломка" : "Головоломки",
    "головоломка" : "Головоломки",
    "стрелялка" : "Стрелялка",
    "Экшен" : "Экшн",
    "джокерге" : "Джокерге",
    "Action" : "Экшн",
    "Экшоооон": "Экшн",
    "Читать(поинт эн клик)" : "Поинт энд клик",
    
}

# 3. Category Grouping (Mapping)
# ------------------------------
# Maps valid raw categories to the FINAL grouped categories.
CATEGORY_GROUPS = {
    # Group: Духота
    "Читать": "Духота",
    "Аниме": "Духота",
    "Кино": "Духота",
    "Поинт энд клик": "Духота",

    # Group: Думать
    "Головоломки": "Думать",
    "Стратежка": "Думать",
    "Симулятор": "Думать",
    "Гоночки": "Думать",

    # Group: Экшн
    "Адвенчура": "Экшн",
    "Экшн": "Экшн",

    # Group: Джокерге
    "Старьё": "Джокерге",
    "Джокерге": "Джокерге",
    "Говно мамонта": "Джокерге",

    # Single-item groups (Self-mapping)
    "Стрелялка": "Стрелялка",
    "RPG": "RPG",
    "Cozy": "Cozy",
    "Рогалик": "Инди",
    "Платформер": "Инди",
    
    # Leftovers (map to self to preserve them)
    "Драммер": "Драммер",
    "Настолка": "Настолка",
    "Кооп": "Кооп",
}

# 4. Icons Mapping (For Final Categories)
# ---------------------------------------
CATEGORY_ICONS = {
    "Стрелялка": "🔫",
    "RPG": "⚔️",
    "Cozy": "🍵",
    "Хоррор": "👻",
    "Рогалик": "🎲",
    "Платформер": "👟",
    "Драммер": "🥁",
    "Настолка": "♟️",
    "Кооп": "🤝",
    "Инди": "🎲",
    
    # New Grouped Icons
    "Духота": "🎭",      # Theater masks for culture/anime/movies
    "Думать": "🧠",      # Brain for puzzles/strategy
    "Экшн": "💥",       # Explosion for action
    "Джокерге": "🃏"    # Joker card
}

# --- HELPER FUNCTIONS ---

def slugify(text):
    """Converts Russian text to a latin slug for IDs."""
    trans_map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ь': '', 'ы': 'y', 'ъ': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    }
    text = str(text).lower().strip()
    slug = ""
    for char in text:
        if char in trans_map:
            slug += trans_map[char]
        elif char.isalnum():
            slug += char
        else:
            slug += '-'
    return re.sub(r'-+', '-', slug).strip('-')

def clean_category(raw_value):
    """
    1. Takes the string.
    2. Splits by comma and takes the first part.
    3. Strips whitespace.
    """
    if pd.isna(raw_value):
        return ""
    
    # Take text before the first comma
    text = str(raw_value).split(',')[0].strip()
    return text

def resolve_category(raw_text):
    """
    Resolves the raw text to a valid category using the Alias dictionary.
    Throws an error if the category is unknown.
    """
    if not raw_text:
        raise ValueError(f"Empty category found.")

    # 1. Check if it's already a valid category
    if raw_text in VALID_CATEGORIES:
        return raw_text
    
    # 2. Check if it's in aliases
    if raw_text in CATEGORY_ALIASES:
        mapped = CATEGORY_ALIASES[raw_text]
        if mapped in VALID_CATEGORIES:
            return mapped
        else:
            raise ValueError(f"Alias '{raw_text}' maps to '{mapped}', but '{mapped}' is not in VALID_CATEGORIES list!")

    # 3. If not found, throw error
    raise ValueError(f"Unknown category '{raw_text}'. It is not in the valid list and has no alias defined.")

def get_final_category(resolved_cat):
    """
    Maps the resolved valid category to the final grouped category.
    """
    if resolved_cat in CATEGORY_GROUPS:
        return CATEGORY_GROUPS[resolved_cat]
    else:
        # Fallback: if it was valid but not grouped, keep it as is
        return resolved_cat

# --- MAIN SCRIPT ---

def main():
    CSV_URL = 'games.csv' # Replace with your URL
    
    try:
        print("Loading data...")
        df = pd.read_csv(CSV_URL)
        df.columns = df.columns.str.strip()

        # Identify columns
        game_col = 'Игра'
        cat_col = 'Категория (такие же как во вкладке Категории)'

        if game_col not in df.columns or cat_col not in df.columns:
            raise Exception(f"Missing columns. Found: {list(df.columns)}")

        print("Processing rows...")
        
        # Clean data: remove rows with no game name
        df = df.dropna(subset=[game_col])

        processed_data = {}

        for index, row in df.iterrows():
            game_name = str(row[game_col]).strip()
            raw_cat = row[cat_col]
            
            # 1. Clean (split by comma)
            cleaned_cat = clean_category(raw_cat)
            
            # 2. Resolve (aliases + validation)
            try:
                valid_cat = resolve_category(cleaned_cat)
            except ValueError as e:
                raise ValueError(f"Error in row {index + 2} (Game: '{game_name}'): {e}")

            # 3. Group into final category
            final_cat = get_final_category(valid_cat)

            # 4. Aggregate
            if final_cat not in processed_data:
                processed_data[final_cat] = []
            
            processed_data[final_cat].append(game_name)

        # 4. Build Final JSON
        final_json = []

        # Sort keys to keep output consistent
        for cat_name in sorted(processed_data.keys()):
            games = processed_data[cat_name]
            
            # Get icon (default to '🎮' if missing)
            icon = CATEGORY_ICONS.get(cat_name, "🎮")
            
            entry = {
                "id": slugify(cat_name),
                "name": cat_name,
                "icon": icon,
                "games": games
            }
            final_json.append(entry)

        # Save
        output_file = 'games_categorized.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(final_json, f, ensure_ascii=False, indent=2)
        
        print(f"\nSuccess! Parsed {len(df)} games into {len(final_json)} categories.")
        print(f"Output saved to: {output_file}")

    except Exception as e:
        print(f"\n[CRITICAL ERROR] Script stopped: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()