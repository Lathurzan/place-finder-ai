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
        # Graceful fallback: if no CSV is present return empty list so
        # the API can respond with zero recommendations instead of 500.
        return []

    if pd is not None:
        df = pd.read_csv(CSV_PATH)

        # For object/string columns fill missing values with empty string so
        # the API returns consistent string fields. Don't fill numeric
        # columns with empty strings (that causes dtype coercion errors).
        obj_cols = df.select_dtypes(include=["object"]).columns.tolist()
        if obj_cols:
            df[obj_cols] = df[obj_cols].fillna("")

        # Coerce known numeric-ish columns to numeric types where possible.
        for col in ("similarity", "score"):
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

        # Replace +/-inf with NaN and then convert pandas NaN -> Python None
        # so FastAPI/Starlette can JSON-serialize the results safely.
        try:
            import numpy as _np  # local import to keep dependency optional
            df = df.replace([_np.inf, -_np.inf], _np.nan)
        except Exception:
            # If numpy isn't available, attempt a safer replace using pandas
            df = df.replace([float("inf"), float("-inf")], pd.NA)

        # Convert pandas NA/NaN to None for JSON serialization
        df = df.where(pd.notnull(df), None)

        return df

    return _read_with_csv()


if __name__ == "__main__":
    data = load_recommendations()
    print("✅ Recommendations loaded")
    if pd is not None and hasattr(data, "head"):
        print(data.head())
    else:
        print((data[:5]))
