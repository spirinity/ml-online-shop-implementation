"""FastAPI backend for the online shop customer segmentation demo.

Run:
    uvicorn api:app --port 8000
"""

from __future__ import annotations

import uuid
from datetime import date
from pathlib import Path
from typing import Any, Literal

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from segmentation import (
    FEATURE_COLUMNS,
    VAR_MEANINGS,
    clean_transactions,
    compute_customer_features,
    load_artifacts,
    load_validation_artifact,
    predict_customer_cluster,
)


BASE_DIR = Path(__file__).resolve().parent
ARTIFACT_DIR = BASE_DIR / "data" / "demo"

app = FastAPI(title="Online Shop Customer Segmentation API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1):\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions: dict[str, list[dict[str, Any]]] = {}
_bundle = None
_products: pd.DataFrame | None = None
_profiles: pd.DataFrame | None = None
_validation: dict[str, Any] | None = None
_load_error: str | None = None


class CheckoutItem(BaseModel):
    product_id: str = Field(min_length=1)
    quantity: int = Field(ge=1, le=999)


class CheckoutRequest(BaseModel):
    customer_id: str | None = None
    items: list[CheckoutItem] = Field(min_length=1)
    simulation_mode: str = "first_time"
    transaction_type: Literal["purchase", "cancel"] = "purchase"
    transaction_date: date | None = None


class ResetRequest(BaseModel):
    customer_id: str | None = None


def _new_customer_id() -> str:
    return f"SIM-{uuid.uuid4().hex[:8].upper()}"


def _load() -> None:
    global _bundle, _products, _profiles, _validation, _load_error
    if _bundle is not None:
        return
    try:
        _bundle, _products, _profiles = load_artifacts(ARTIFACT_DIR)
        _validation = load_validation_artifact(ARTIFACT_DIR)
        _load_error = None
    except Exception as exc:
        _load_error = str(exc)


def _require_ready() -> tuple[Any, pd.DataFrame, pd.DataFrame]:
    _load()
    if _bundle is None or _products is None or _profiles is None:
        raise HTTPException(
            status_code=503,
            detail="Artifacts are missing. Run `python build_artifacts.py` before starting the app.",
        )
    return _bundle, _products, _profiles


def _require_validation() -> dict[str, Any]:
    _require_ready()
    if _validation is None:
        raise HTTPException(
            status_code=404,
            detail="Decision Tree validation artifact is missing. Re-run `python build_artifacts.py`.",
        )
    return _validation


def _session_summary(customer_id: str) -> dict[str, Any]:
    rows = sessions.get(customer_id, [])
    total = sum(float(row["Quantity"]) * float(row["UnitPrice"]) for row in rows if int(row["Quantity"]) > 0)
    invoices = {row["InvoiceNo"] for row in rows}
    purchase_invoices = {row["InvoiceNo"] for row in rows if int(row["Quantity"]) > 0}
    cancellation_invoices = {row["InvoiceNo"] for row in rows if int(row["Quantity"]) < 0}
    return {
        "customer_id": customer_id,
        "transaction_rows": len(rows),
        "invoice_count": len(invoices),
        "purchase_invoice_count": len(purchase_invoices),
        "cancellation_invoice_count": len(cancellation_invoices),
        "total_spend": round(total, 2),
    }


def _product_row(product_df: pd.DataFrame, index: int) -> pd.Series:
    return product_df.iloc[index % len(product_df)]


def _seed_history(customer_id: str, product_df: pd.DataFrame, now: pd.Timestamp, mode: str) -> None:
    """Create visible prior transactions so demo customers can occupy different segments."""
    if sessions.get(customer_id) or mode == "first_time":
        return

    mode = mode.lower()
    rows: list[dict[str, Any]] = []

    def add_invoice(invoice_idx: int, days_ago: int, product_count: int, quantity: int, country: str = "United Kingdom") -> None:
        invoice_date = now - pd.Timedelta(days=days_ago)
        invoice_no = f"HIST-{customer_id[-4:]}-{invoice_idx:03d}"
        for offset in range(product_count):
            product = _product_row(product_df, invoice_idx * 7 + offset)
            rows.append(
                {
                    "InvoiceNo": invoice_no,
                    "StockCode": str(product["StockCode"]),
                    "Description": str(product["Description"]),
                    "Quantity": int(quantity + (offset % 3)),
                    "InvoiceDate": invoice_date,
                    "UnitPrice": float(product["UnitPrice"]),
                    "CustomerID": customer_id,
                    "Country": country,
                }
            )

    def add_cancel(cancel_idx: int, days_ago: int, country: str = "United Kingdom") -> None:
        product = _product_row(product_df, cancel_idx * 5)
        rows.append(
            {
                "InvoiceNo": f"CHIST-{customer_id[-4:]}-{cancel_idx:03d}",
                "StockCode": str(product["StockCode"]),
                "Description": str(product["Description"]),
                "Quantity": -1,
                "InvoiceDate": now - pd.Timedelta(days=days_ago),
                "UnitPrice": float(product["UnitPrice"]),
                "CustomerID": customer_id,
                "Country": country,
            }
        )

    if mode == "premium":
        for idx, days in enumerate([115, 100, 86, 72, 58, 44, 30, 18, 8]):
            add_invoice(idx, days, product_count=8, quantity=18)
        for idx, days in enumerate([70, 20]):
            add_cancel(idx, days)
    elif mode == "high_cancel":
        for idx, days in enumerate([96, 88, 80, 72, 64, 56, 48, 40, 32, 24, 16, 8]):
            add_invoice(idx, days, product_count=10, quantity=25)
        for idx, days in enumerate([94, 91, 87, 83, 79, 75, 71, 67, 63, 59, 55, 51, 47, 43, 39, 35, 31, 27, 23, 21, 19, 17, 15, 13, 11, 9, 7, 5, 3, 1]):
            add_cancel(idx, days)
    elif mode == "planned":
        for idx, days in enumerate([330, 220, 110]):
            add_invoice(idx, days, product_count=3, quantity=4)
    elif mode == "international":
        for idx, days in enumerate([130, 90, 45, 14]):
            add_invoice(idx, days, product_count=4, quantity=6, country="Germany")

    sessions[customer_id].extend(rows)


def _build_segment_response(customer_id: str, invoice_no: str | None = None, checkout_info: dict[str, Any] | None = None) -> dict[str, Any]:
    bundle, _, profiles = _require_ready()
    rows = sessions.get(customer_id, [])
    if not rows:
        raise HTTPException(status_code=404, detail="Customer belum memiliki histori transaksi.")

    session_df = pd.DataFrame(rows)
    valid, cancelled = clean_transactions(session_df)
    if valid.empty:
        raise HTTPException(status_code=404, detail="Customer belum memiliki transaksi valid.")

    snapshot_date = pd.Timestamp.utcnow().tz_localize(None) + pd.Timedelta(days=1)
    features = compute_customer_features(valid, cancelled, snapshot_date=snapshot_date)
    customer_features = features[features["CustomerID"] == customer_id].copy()
    prediction = predict_customer_cluster(bundle, customer_features)
    profile_row = profiles[profiles["cluster"] == prediction["cluster"]].iloc[0].to_dict()

    feature_values = {
        col: {
            "label": VAR_MEANINGS[col],
            "value": round(float(customer_features.iloc[0][col]), 4),
        }
        for col in FEATURE_COLUMNS
    }
    return {
        "customer_id": customer_id,
        "invoice_no": invoice_no,
        "summary": _session_summary(customer_id),
        "checkout": checkout_info or {
            "items": 0,
            "subtotal": 0,
            "transaction_type": None,
            "transaction_date": None,
        },
        "segment": {
            **prediction,
            "proportion": round(float(profile_row.get("proportion", 0)), 4),
            "dominant_features": str(profile_row.get("dominant_features", "")),
        },
        "features": feature_values,
        "history": [
            {
                "invoice_no": row["InvoiceNo"],
                "stock_code": row["StockCode"],
                "description": row["Description"],
                "quantity": int(row["Quantity"]),
                "unit_price": round(float(row["UnitPrice"]), 2),
                "invoice_date": pd.Timestamp(row["InvoiceDate"]).isoformat(),
                "transaction_type": "cancel" if int(row["Quantity"]) < 0 else "purchase",
            }
            for row in rows[-20:]
        ],
        "note": "Segmentasi pembelian pertama tetap dihitung, tetapi semakin kuat setelah customer memiliki beberapa transaksi.",
    }


@app.get("/api/health")
def health() -> dict[str, Any]:
    _load()
    files = [
        {"name": "model_bundle.joblib", "exists": (ARTIFACT_DIR / "model_bundle.joblib").exists()},
        {"name": "products.csv", "exists": (ARTIFACT_DIR / "products.csv").exists()},
        {"name": "cluster_profiles.csv", "exists": (ARTIFACT_DIR / "cluster_profiles.csv").exists()},
        {"name": "decision_tree_validation.json", "exists": (ARTIFACT_DIR / "decision_tree_validation.json").exists()},
    ]
    return {
        "ready": _bundle is not None,
        "load_error": _load_error,
        "artifact_dir": str(ARTIFACT_DIR),
        "files": files,
        "active_sessions": len(sessions),
    }


@app.get("/api/model-info")
def model_info() -> dict[str, Any]:
    bundle, product_df, profiles = _require_ready()
    validation = _validation or {}
    final_validation = validation.get("final", {}) if isinstance(validation, dict) else {}
    tuning_validation = validation.get("tuning", {}) if isinstance(validation, dict) else {}
    return {
        "dataset": "Online Retail.xlsx",
        "customers": int(bundle.metrics.get("customers", 0)),
        "products": int(len(product_df)),
        "pca_variance": round(float(bundle.metrics.get("explained_variance_6pc", 0)), 4),
        "inertia": round(float(bundle.metrics.get("inertia", 0)), 4),
        "clusters": int(len(profiles)),
        "method": "KMeans baseline with PCA 6 components",
        "validation_available": bool(validation),
        "decision_tree_best_depth": int(tuning_validation.get("best_max_depth", 0) or 0),
        "decision_tree_test_accuracy": round(float(final_validation.get("test_accuracy", 0)), 4),
        "note": "Deployment model follows the notebook pipeline with PCA+KMeans inference. Decision Tree is exposed as supervised validation, not as the deployed segmenter.",
    }


@app.get("/api/validation")
def validation() -> dict[str, Any]:
    return _require_validation()


@app.get("/api/clusters")
def clusters() -> dict[str, Any]:
    _, _, profiles = _require_ready()
    rows = []
    for _, row in profiles.sort_values("cluster").iterrows():
        rows.append(
            {
                "cluster": int(row["cluster"]),
                "cluster_label": f"C{int(row['cluster'])}",
                "profile": str(row["profile"]),
                "strategy": str(row["strategy"]),
                "proportion": round(float(row["proportion"]), 4),
                "dominant_features": str(row["dominant_features"]),
                "features": {
                    col: {
                        "label": VAR_MEANINGS[col],
                        "mean": round(float(row[col]), 4),
                    }
                    for col in FEATURE_COLUMNS
                    if col in row
                },
            }
        )
    return {"clusters": rows}


@app.get("/api/products")
def products(limit: int = 60, q: str = "") -> dict[str, Any]:
    _, product_df, _ = _require_ready()
    data = product_df.copy()
    if q:
        term = q.lower()
        data = data[data["Description"].str.lower().str.contains(term, na=False) | data["StockCode"].astype(str).str.lower().str.contains(term)]
    data = data.head(max(1, min(limit, 120)))
    rows = [
        {
            "product_id": str(row["ProductID"]),
            "stock_code": str(row["StockCode"]),
            "description": str(row["Description"]),
            "unit_price": round(float(row["UnitPrice"]), 2),
            "orders": int(row.get("Orders", 0)),
        }
        for _, row in data.iterrows()
    ]
    return {"products": rows}


@app.post("/api/session/new")
def new_session() -> dict[str, Any]:
    customer_id = _new_customer_id()
    sessions[customer_id] = []
    return {"customer_id": customer_id, "summary": _session_summary(customer_id)}


@app.post("/api/session/reset")
def reset_session(payload: ResetRequest) -> dict[str, Any]:
    if payload.customer_id and payload.customer_id in sessions:
        sessions.pop(payload.customer_id, None)
    customer_id = _new_customer_id()
    sessions[customer_id] = []
    return {"customer_id": customer_id, "summary": _session_summary(customer_id)}


@app.get("/api/session/{customer_id}/segment")
def current_segment(customer_id: str) -> dict[str, Any]:
    return _build_segment_response(customer_id)


@app.post("/api/checkout")
def checkout(payload: CheckoutRequest) -> dict[str, Any]:
    _, product_df, _ = _require_ready()
    customer_id = payload.customer_id or _new_customer_id()
    sessions.setdefault(customer_id, [])

    product_lookup = product_df.set_index("ProductID")
    missing = [item.product_id for item in payload.items if item.product_id not in product_lookup.index]
    if missing:
        raise HTTPException(status_code=400, detail=f"Unknown product_id: {', '.join(missing)}")

    now = pd.Timestamp.now().tz_localize(None)
    transaction_date = pd.Timestamp(payload.transaction_date or now.date())
    if transaction_date.normalize() > now.normalize():
        raise HTTPException(status_code=422, detail="Tanggal transaksi tidak boleh berada di masa depan.")

    _seed_history(customer_id, product_df, transaction_date, payload.simulation_mode)

    if payload.transaction_type == "cancel":
        existing = pd.DataFrame(sessions[customer_id])
        if existing.empty:
            raise HTTPException(status_code=422, detail="Cancel hanya dapat dibuat setelah customer memiliki pembelian valid.")
        existing_valid, _ = clean_transactions(existing)
        if existing_valid.empty:
            raise HTTPException(status_code=422, detail="Cancel hanya dapat dibuat setelah customer memiliki pembelian valid.")
        first_purchase_date = existing_valid["InvoiceDate"].min().normalize()
        if transaction_date.normalize() < first_purchase_date:
            raise HTTPException(
                status_code=422,
                detail=f"Tanggal cancel tidak boleh sebelum pembelian pertama ({first_purchase_date.date().isoformat()}).",
            )

    invoice_prefix = "C-SIM" if payload.transaction_type == "cancel" else "SIM"
    invoice_no = f"{invoice_prefix}-{transaction_date.strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
    quantity_sign = -1 if payload.transaction_type == "cancel" else 1
    new_rows = []
    for item in payload.items:
        product = product_lookup.loc[item.product_id]
        new_rows.append(
            {
                "InvoiceNo": invoice_no,
                "StockCode": str(product["StockCode"]),
                "Description": str(product["Description"]),
                "Quantity": int(item.quantity) * quantity_sign,
                "InvoiceDate": transaction_date,
                "UnitPrice": float(product["UnitPrice"]),
                "CustomerID": customer_id,
                "Country": "United Kingdom",
            }
        )
    sessions[customer_id].extend(new_rows)
    return _build_segment_response(
        customer_id,
        invoice_no=invoice_no,
        checkout_info={
            "items": len(payload.items),
            "subtotal": round(sum(abs(row["Quantity"]) * row["UnitPrice"] for row in new_rows), 2),
            "transaction_type": payload.transaction_type,
            "transaction_date": transaction_date.date().isoformat(),
        },
    )
