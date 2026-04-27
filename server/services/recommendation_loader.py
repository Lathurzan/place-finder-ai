from pathlib import Path
import csv
from typing import Any, Dict, List

# Auto-detect project root (server/)
BASE_DIR = Path(__file__).resolve().parent.parent

CSV_PATH = BASE_DIR / "data" / "personalized_recommendations.csv"

# Optional pandas support
try:
    import pandas as pd  # type: ignore
except Exception:
    pd = None  # type: ignore


def _read_with_csv() -> List[Dict[str, Any]]:
    with CSV_PATH.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        rows = [dict(r) for r in reader]

    # normalize numeric-like fields
    for r in rows:
        if "similarity" in r:
            try:
                r["similarity"] = float(r["similarity"]) if r["similarity"] not in (None, "") else None
            except Exception:
                r["similarity"] = None
    return rows


def load_recommendations() -> Any:
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"CSV not found: {CSV_PATH}")

    if pd is not None:
        df = pd.read_csv(CSV_PATH)
        df.fillna("", inplace=True)
        return df

    return _read_with_csv()


if __name__ == "__main__":
    data = load_recommendations()
    print("✅ Recommendations loaded")
    if pd is not None and hasattr(data, "head"):
        print(data.head())
    else:
        print((data[:5]))
