import pandas as pd

EXCLUDE_GENRES = [
'360 Video',
'Accounting',
#'Action',
#'Adventure',
'Animation & Modeling',
'Audio Production',
#'Casual',
'Design & Illustration',
'Documentary',
'Early Access',
'Education',
#'Episodic',
#'Free To Play',
'Game Development',
#'Gore',
#'Indie',
'Massively Multiplayer',
'Movie',
#'Nudity',
'Photo Editing',
#'RPG',
#'Racing',
'Sexual Content',
'Sport',
'Sports',
# 'Short',
'Simulation',
'Software Training',
#'Sports',
'Strategy',
'Tutorial',
'Utilities',
'Video Production',
#'Violent',
'Web Publishing',
]
EXCLUDE_TAGS = ['Fighting', 'Hentai', 'Sexual Content']
EXCLUDE_CATEGORIES = [
    'VR Only',
    
]
TAGS_TO_GENRES = [
    'Horror',
    'Adventure',
    'Puzzle',
    'Online Co-Op',
    'Platformer',
    'Rogue-like',
    'Roguelike',
    'Visual Novel',
    'Action',
    'Cozy',
    'RPG',
    'Shooter',
    'Difficult',
]


def load_data():
    return pd.read_csv("steamgames.csv", low_memory=False)


def filter_by_name(data: pd.DataFrame, name: str) -> pd.DataFrame:
    return data[data["Name"].str.contains(name, case=False, na=False)]


def get_games_with_reviews_threshold(data: pd.DataFrame, threshold: int = 500) -> pd.DataFrame:
    result = data.copy()
    result["TotalReviews"] = result["Positive"] + result["Negative"]
    return result[result["TotalReviews"] > threshold]


def exclude_by_genres(data: pd.DataFrame, exclude_list: list[str]) -> pd.DataFrame:
    mask = pd.Series([True] * len(data), index=data.index)
    for idx, row in data.iterrows():
        genres = [g.strip() for g in str(row.get("Genres", "")).split(",") if g.strip()]
        for ex in exclude_list:
            if ex.strip() in genres:
                mask[idx] = False
                break
    return data[mask]


def exclude_by_tags(data: pd.DataFrame, exclude_list: list[str]) -> pd.DataFrame:
    mask = pd.Series([True] * len(data), index=data.index)
    for idx, row in data.iterrows():
        tags = [t.strip() for t in str(row.get("Tags", "")).split(",") if t.strip()]
        for ex in exclude_list:
            if ex.strip() in tags:
                mask[idx] = False
                break
    return data[mask]


def exclude_by_genres_and_tags(data: pd.DataFrame, exclude_genres: list[str], exclude_tags: list[str]) -> pd.DataFrame:
    result = exclude_by_genres(data, exclude_genres)
    return exclude_by_tags(result, exclude_tags)


def exclude_by_categories(data: pd.DataFrame, exclude_list: list[str]) -> pd.DataFrame:
    mask = pd.Series([True] * len(data), index=data.index)
    for idx, row in data.iterrows():
        cats = [c.strip() for c in str(row.get("Categories", "")).split(",") if c.strip()]
        for ex in exclude_list:
            if ex.strip() in cats:
                mask[idx] = False
                break
    return data[mask]


def filter_english_or_russian(data: pd.DataFrame) -> pd.DataFrame:
    return data[data["Supported languages"].str.contains("English|Russian", case=False, na=False)]


def filter_positive_gte_negative(data: pd.DataFrame) -> pd.DataFrame:
    return data[data["Positive"] >= data["Negative"]]


def filter_windows_true(data: pd.DataFrame) -> pd.DataFrame:
    return data[data["Windows"] == True]


def filter_single_player(data: pd.DataFrame) -> pd.DataFrame:
    return data[data["Categories"].str.contains("Single-Player", case=False, na=False)]


def move_tags_to_genres(data: pd.DataFrame, tags_to_add: list[str]) -> pd.DataFrame:
    result = data.copy()
    for tag in tags_to_add:
        for idx, row in result.iterrows():
            genres = [g.strip() for g in str(row.get("Genres", "")).split(",") if g.strip()]
            tags = [t.strip() for t in str(row.get("Tags", "")).split(",") if t.strip()]
            if tag in tags and tag not in genres:
                genres.append(tag)
                result.at[idx, "Genres"] = ",".join(genres)
    return result


def print_all_genres_and_tags(data: pd.DataFrame):
    print("=== ALL GENRES ===")
    all_genres = set()
    for g in data["Genres"].dropna():
        all_genres.update([x.strip() for x in g.split(",") if x.strip()])
    # for g in sorted(all_genres):
        # print(g)

    print("\n=== ALL TAGS ===")
    all_tags = set()
    for t in data["Tags"].dropna():
        all_tags.update([x.strip() for x in t.split(",") if x.strip()])
    # for t in sorted(all_tags):
        # print(t)

    print("\n=== ALL CATEGORIES ===")
    all_cats = set()
    for c in data["Categories"].dropna():
        all_cats.update([x.strip() for x in c.split(",") if x.strip()])
    # for c in sorted(all_cats):
        # print(c)


if __name__ == "__main__":
    df = load_data()
    print_all_genres_and_tags(df)

    filtered = get_games_with_reviews_threshold(df, 2000)
    print(f"\nGames with >2000 reviews (after exclusions): {len(filtered)}")
    filtered = move_tags_to_genres(filtered, TAGS_TO_GENRES)
    print(f"After moving tags to genres: {len(filtered)}")
    filtered = exclude_by_genres_and_tags(filtered, EXCLUDE_GENRES, EXCLUDE_TAGS)
    print(f"After genre/tag exclusions: {len(filtered)}")
    filtered = exclude_by_categories(filtered, EXCLUDE_CATEGORIES)
    print(f"After category exclusions: {len(filtered)}")
    filtered = filter_english_or_russian(filtered)
    print(f"English/Russian games: {len(filtered)}")
    filtered = filter_positive_gte_negative(filtered)
    print(f"Positive >= Negative: {len(filtered)}")
    filtered = filter_windows_true(filtered)
    print(f"Windows == True: {len(filtered)}")
    filtered = filter_single_player(filtered)
    print(f"Single-Player: {len(filtered)}")
    filtered.to_csv("filtered_games.csv", index=False)
    print(f"\nSaved to filtered_games.csv")