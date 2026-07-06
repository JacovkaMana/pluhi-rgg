import pandas as pd
import json
import re
import sys
import os
from datetime import datetime

VALID_CATEGORIES = [
    "Стрелялка", "RPG", "Cozy", "Головоломки", "Аниме", "Хоррор", 
    "Адвенчура", "Кино", "Рогалик", "Стратежка", "Старьё", 
    "Говно мамонта", "Платформер", "Джокерге", "Читать", "Драммер", 
    "Симулятор", "Поинт энд клик", "Настолка", "Кооп", "Экшн", "Гоночки"
]

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

CATEGORY_GROUPS = {
    "Читать": "Духота",
    "Аниме": "Духота",
    "Кино": "Духота",
    "Поинт энд клик": "Духота",

    "Головоломки": "Думать",
    "Стратежка": "Думать",
    "Симулятор": "Думать",
    "Гоночки": "Думать",

    "Адвенчура": "Экшн",
    "Экшн": "Экшн",

    "Старьё": "Джокерге",
    "Джокерге": "Джокерге",
    "Говно мамонта": "Джокерге",

    "Стрелялка": "Стрелялка",
    "RPG": "RPG",
    "Cozy": "Cozy",
    "Рогалик": "Инди",
    "Платформер": "Инди",
    
    "Драммер": "Драммер",
    "Настолка": "Настолка",
    "Кооп": "Кооп",
}

DEFAULT_AUTHOR = "admin"
DEFAULT_HOURS = 0

def generate_id():
    """Generates a unique ID like the JS version."""
    import random
    import string
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=24))

def slugify(text):
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
    if pd.isna(raw_value):
        return ""
    text = str(raw_value).split(',')[0].strip()
    return text

def resolve_category(raw_text):
    if not raw_text:
        raise ValueError(f"Empty category found.")
    if raw_text in VALID_CATEGORIES:
        return raw_text
    if raw_text in CATEGORY_ALIASES:
        mapped = CATEGORY_ALIASES[raw_text]
        if mapped in VALID_CATEGORIES:
            return mapped
        else:
            raise ValueError(f"Alias '{raw_text}' maps to '{mapped}', but '{mapped}' is not in VALID_CATEGORIES list!")
    print(f"Warning: Unknown category '{raw_text}'. Falling back to 'Indie'.")
    return "Инди"

def get_final_category(resolved_cat):
    if resolved_cat in CATEGORY_GROUPS:
        return CATEGORY_GROUPS[resolved_cat]
    return resolved_cat

def main():
    CSV_URL = 'games.csv'
    AUTHOR = os.environ.get('GAME_AUTHOR', DEFAULT_AUTHOR)
    hours_default = int(os.environ.get('DEFAULT_HOURS', '0'))
    
    try:
        print("Loading data...")
        df = pd.read_csv(CSV_URL)
        df.columns = df.columns.str.strip()

        game_col = None
        cat_col = None
        hours_col = None
        author_col = None

        for col in df.columns:
            col_clean = col.strip()
            if 'Категория' in col_clean:
                cat_col = col
            elif 'HLTB' in col_clean or 'часы' in col_clean:
                hours_col = col
            elif 'Кто добавил' in col_clean or 'добавил' in col_clean:
                author_col = col

        if cat_col is None:
            raise Exception(f"Missing category column. Found: {list(df.columns)}")

        first_col = df.columns[0]
        if first_col.strip() == '' or first_col == ',':
            game_col = first_col

        print("Processing rows...")
        df = df.dropna(subset=[game_col])

        games = []
        seen_games = set()

        for index, row in df.iterrows():
            game_name = str(row[game_col]).strip()
            raw_cat = row[cat_col]
            
            cleaned_cat = clean_category(raw_cat)
            
            try:
                valid_cat = resolve_category(cleaned_cat)
            except ValueError as e:
                raise ValueError(f"Error in row {index + 2} (Game: '{game_name}'): {e}")

            final_cat = get_final_category(valid_cat)

            if game_name in seen_games:
                for game in games:
                    if game['name'] == game_name and final_cat not in game['categories']:
                        game['categories'].append(final_cat)
                        break
                continue
            
            seen_games.add(game_name)
            
            hours = hours_default
            if hours_col and not pd.isna(row.get(hours_col)):
                try:
                    hours = float(row[hours_col])
                except (ValueError, TypeError):
                    pass

            author = AUTHOR
            if author_col and not pd.isna(row.get(author_col)):
                author = str(row[author_col]).strip()
                if not author:
                    author = AUTHOR

            game_entry = {
                "id": f"game_{generate_id()}",
                "name": game_name,
                "categories": [final_cat],
                "hours": hours,
                "author": author,
                "created_at": datetime.now().isoformat()
            }
            games.append(game_entry)

        output_file = 'games_db.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(games, f, ensure_ascii=False, indent=2)
        
        print(f"\nSuccess! Processed {len(games)} unique games.")
        print(f"Output saved to: {output_file}")
        print(f"\nTo import into the app, replace the seed data in src/lib/db.ts with the contents of {output_file}")

    except Exception as e:
        print(f"\n[CRITICAL ERROR] Script stopped: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()