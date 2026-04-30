from fastapi import APIRouter, Query, HTTPException
from typing import Optional
import services.recommendation_loader as recommendation_loader
import math
from fastapi.encoders import jsonable_encoder
from typing import Any, Dict, List

router = APIRouter()


@router.get("/recommendations-csv")
async def get_csv_recommendations(
    user_id: Optional[int] = Query(None),
    top_n: int = Query(5, gt=0, le=100),
):
    try:
        df = recommendation_loader.load_recommendations()
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Catch unexpected loader errors and return a readable 500
        raise HTTPException(status_code=500, detail=f"Loader error: {e}")

    results = []

    # If loader returned a pandas DataFrame
    if hasattr(df, "to_dict") and hasattr(df, "columns"):
        pandas_df = df
        if user_id is not None and "user_id" in pandas_df.columns:
            pandas_df = pandas_df[pandas_df["user_id"] == user_id]
        if "score" in pandas_df.columns:
            pandas_df = pandas_df.sort_values("score", ascending=False)
        elif "similarity" in pandas_df.columns:
            pandas_df = pandas_df.sort_values("similarity", ascending=False)
        results = pandas_df.head(top_n).to_dict(orient="records")
    else:
        # Expect a list of dicts
        items = df if isinstance(df, list) else list(df)
        if user_id is not None:
            items = [it for it in items if it.get("user_id") is not None and str(it.get("user_id")) == str(user_id)]
        # sort by similarity if present
        if any(it.get("similarity") not in (None, "") for it in items):
            items = sorted(items, key=lambda x: float(x.get("similarity") or 0), reverse=True)
        results = items[:top_n]

    # Sanitize records so they are JSON serializable (no inf/NaN/numpy types)
    def _sanitize_value(v: Any) -> Any:
        # Handle numeric non-finite values
        try:
            # numpy types may not be available; math.isfinite handles Python floats
            if isinstance(v, float):
                return v if math.isfinite(v) else None
        except Exception:
            pass
        # Convert numpy types and pandas types via jsonable_encoder, then re-check
        try:
            enc = jsonable_encoder(v)
        except Exception:
            enc = v
        # After encoding, ensure floats are finite
        try:
            if isinstance(enc, float):
                return enc if math.isfinite(enc) else None
        except Exception:
            pass
        return enc

    def _sanitize_record(rec: Dict[str, Any]) -> Dict[str, Any]:
        out: Dict[str, Any] = {}
        for k, vv in rec.items():
            out[k] = _sanitize_value(vv)
        return out

    results = [_sanitize_record(r) for r in results]

    return {"source": "CSV Model Output", "count": len(results), "recommendations": results}
