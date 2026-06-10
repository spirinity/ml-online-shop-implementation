"""Customer segmentation utilities for the online shop demo."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import json
import joblib
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier


RANDOM_SEED = 42
K_OPTIMAL = 6
N_PCA_COMPONENTS = 6
FEATURE_COLUMNS = [f"Var{i}" for i in range(1, 12)]
BINARY_COLUMNS = ["Var9"]
CLIP_COLUMNS = [col for col in FEATURE_COLUMNS if col not in BINARY_COLUMNS]

PROFILE_DESCRIPTIONS: dict[int, dict[str, str]] = {
    1: {
        "profile": "Premium / High-Value Customers",
        "strategy": "Pengeluaran total/bulanan tinggi; cocok untuk loyalty program, VIP offer, dan retensi pelanggan bernilai tinggi.",
    },
    2: {
        "profile": "Price-Sensitive / Mass Customers",
        "strategy": "Volume pembelian tinggi tetapi lebih sensitif harga; cocok untuk diskon, bundling, dan promo kuantitas.",
    },
    3: {
        "profile": "High-Expectation Customers (High Cancel)",
        "strategy": "Frekuensi pembatalan tinggi; perlu detail produk lebih jelas, review, estimasi pengiriman, dan checkout yang minim risiko.",
    },
    4: {
        "profile": "UK-Loyal Customers",
        "strategy": "Dominan/kuat dari UK; cocok untuk personalisasi regional, rekomendasi produk lokal, dan strategi retensi.",
    },
    5: {
        "profile": "Cautious / Planned Buyers",
        "strategy": "Interval pembelian relatif panjang/terencana; cocok untuk reminder, seasonal campaign, dan promo akhir pekan.",
    },
    6: {
        "profile": "Balanced / Moderate Customers",
        "strategy": "Tidak ekstrem pada satu indikator; cocok untuk campaign umum, cross-selling ringan, dan diversifikasi promosi.",
    },
}

VAR_MEANINGS = {
    "Var1": "Recency",
    "Var2": "Frequency",
    "Var3": "Total Produk",
    "Var4": "Total Pengeluaran",
    "Var5": "Avg Biaya/Transaksi",
    "Var6": "Jumlah Tipe Produk",
    "Var7": "Avg Jarak Pembelian",
    "Var8": "Estimasi Beli Berikutnya",
    "Var9": "UK Flag",
    "Var10": "Cancel Frequency",
    "Var11": "Avg Spend/Bulan",
}


@dataclass
class ModelBundle:
    scaler: StandardScaler
    pca: PCA
    kmeans: KMeans
    raw_to_semantic: dict[int, int]
    clip_bounds: dict[str, tuple[float, float]]
    snapshot_date: pd.Timestamp
    metrics: dict[str, Any]


def clean_transactions(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Normalize Online Retail columns and split valid/cancelled rows."""
    required = {
        "InvoiceNo",
        "StockCode",
        "Description",
        "Quantity",
        "InvoiceDate",
        "UnitPrice",
        "CustomerID",
        "Country",
    }
    missing = sorted(required.difference(df.columns))
    if missing:
        raise ValueError(f"Missing columns: {', '.join(missing)}")

    data = df.copy()
    data = data.dropna(subset=["CustomerID", "Description", "InvoiceDate"])
    data["InvoiceNo"] = data["InvoiceNo"].astype(str)
    data["StockCode"] = data["StockCode"].astype(str)
    data["Description"] = data["Description"].astype(str).str.strip()
    data["InvoiceDate"] = pd.to_datetime(data["InvoiceDate"])
    data["Quantity"] = pd.to_numeric(data["Quantity"], errors="coerce")
    data["UnitPrice"] = pd.to_numeric(data["UnitPrice"], errors="coerce")
    data["CustomerID"] = data["CustomerID"].astype(str)
    data = data.dropna(subset=["Quantity", "UnitPrice"])
    data = data[data["UnitPrice"] > 0]
    data["TotalPrice"] = data["Quantity"] * data["UnitPrice"]

    cancelled_mask = data["InvoiceNo"].str.startswith("C") | (data["Quantity"] < 0)
    cancelled = data[cancelled_mask].copy()
    valid = data[~cancelled_mask & (data["Quantity"] > 0)].copy()
    return valid, cancelled


def build_product_catalog(valid: pd.DataFrame, limit: int = 120) -> pd.DataFrame:
    """Create a compact product catalog from historical transactions."""
    grouped = (
        valid.groupby(["StockCode", "Description"], as_index=False)
        .agg(UnitPrice=("UnitPrice", "median"), Orders=("InvoiceNo", "nunique"), QuantitySold=("Quantity", "sum"))
        .sort_values(["Orders", "QuantitySold"], ascending=False)
    )
    grouped = grouped[grouped["UnitPrice"] > 0].head(limit).copy()
    grouped["ProductID"] = grouped["StockCode"]
    return grouped[["ProductID", "StockCode", "Description", "UnitPrice", "Orders", "QuantitySold"]].reset_index(drop=True)


def compute_customer_features(
    valid: pd.DataFrame,
    cancelled: pd.DataFrame | None = None,
    snapshot_date: pd.Timestamp | None = None,
) -> pd.DataFrame:
    """Compute the notebook's Var1-Var11 feature table per customer."""
    if valid.empty:
        raise ValueError("Cannot compute features from empty transaction history.")

    valid = valid.copy()
    cancelled = cancelled.copy() if cancelled is not None else valid.iloc[0:0].copy()
    if snapshot_date is None:
        snapshot_date = valid["InvoiceDate"].max() + pd.Timedelta(days=1)
    snapshot_date = pd.Timestamp(snapshot_date)

    last_purchase = valid.groupby("CustomerID")["InvoiceDate"].max().reset_index().rename(columns={"InvoiceDate": "LastPurchase"})
    last_purchase["Var1"] = (snapshot_date - last_purchase["LastPurchase"]).dt.days.clip(lower=0)

    var2 = valid.groupby("CustomerID")["InvoiceNo"].nunique().reset_index().rename(columns={"InvoiceNo": "Var2"})
    var3 = valid.groupby("CustomerID")["Quantity"].sum().reset_index().rename(columns={"Quantity": "Var3"})
    var4 = valid.groupby("CustomerID")["TotalPrice"].sum().reset_index().rename(columns={"TotalPrice": "Var4"})

    invoice_total = valid.groupby(["CustomerID", "InvoiceNo"])["TotalPrice"].sum().reset_index()
    var5 = invoice_total.groupby("CustomerID")["TotalPrice"].mean().reset_index().rename(columns={"TotalPrice": "Var5"})
    var6 = valid.groupby("CustomerID")["StockCode"].nunique().reset_index().rename(columns={"StockCode": "Var6"})

    invoice_dates = (
        valid.groupby(["CustomerID", "InvoiceNo"])["InvoiceDate"]
        .min()
        .reset_index()
        .sort_values(["CustomerID", "InvoiceDate"])
    )
    invoice_dates["days_diff"] = invoice_dates.groupby("CustomerID")["InvoiceDate"].diff().dt.days
    var7 = invoice_dates.groupby("CustomerID")["days_diff"].mean().reset_index().rename(columns={"days_diff": "Var7"})
    var7["Var7"] = var7["Var7"].fillna(0)

    var8 = last_purchase[["CustomerID", "Var1"]].merge(var7, on="CustomerID", how="left")
    var8["Var7"] = var8["Var7"].fillna(0)
    var8["Var8"] = var8["Var1"] + var8["Var7"]
    var8 = var8[["CustomerID", "Var8"]]

    country_mode = valid.groupby("CustomerID")["Country"].agg(lambda value: value.mode().iloc[0]).reset_index()
    country_mode["Var9"] = (country_mode["Country"] == "United Kingdom").astype(int)
    var9 = country_mode[["CustomerID", "Var9"]]

    if cancelled.empty:
        var10 = pd.DataFrame(columns=["CustomerID", "Var10"])
    else:
        var10 = cancelled.groupby("CustomerID")["InvoiceNo"].count().reset_index().rename(columns={"InvoiceNo": "Var10"})

    valid["YearMonth"] = valid["InvoiceDate"].dt.to_period("M")
    monthly_spend = valid.groupby(["CustomerID", "YearMonth"])["TotalPrice"].sum().reset_index()
    var11 = monthly_spend.groupby("CustomerID")["TotalPrice"].mean().reset_index().rename(columns={"TotalPrice": "Var11"})

    feature_frames = [last_purchase[["CustomerID", "Var1"]], var2, var3, var4, var5, var6, var7, var8, var9, var10, var11]
    features = feature_frames[0]
    for frame in feature_frames[1:]:
        features = features.merge(frame, on="CustomerID", how="left")

    features["Var10"] = features["Var10"].fillna(0)
    for col in FEATURE_COLUMNS:
        features[col] = features[col].fillna(0)
    return features[["CustomerID", *FEATURE_COLUMNS]]


def fit_clip_bounds(features: pd.DataFrame) -> dict[str, tuple[float, float]]:
    bounds = {}
    for col in CLIP_COLUMNS:
        bounds[col] = (float(features[col].quantile(0.01)), float(features[col].quantile(0.99)))
    return bounds


def apply_clip_bounds(features: pd.DataFrame, bounds: dict[str, tuple[float, float]]) -> pd.DataFrame:
    clipped = features.copy()
    for col, (lower, upper) in bounds.items():
        clipped[col] = clipped[col].clip(lower=lower, upper=upper)
    return clipped


def _minmax_profile(profile: pd.DataFrame) -> pd.DataFrame:
    result = profile.copy().astype(float)
    for col in result.columns:
        low = result[col].min()
        high = result[col].max()
        if pd.isna(low) or pd.isna(high) or high == low:
            result[col] = 0.5
        else:
            result[col] = (result[col] - low) / (high - low)
    return result


def assign_business_labels(features: pd.DataFrame, raw_labels: np.ndarray) -> dict[int, int]:
    raw_ids = range(1, K_OPTIMAL + 1)
    raw_counts = pd.Series(np.bincount(raw_labels, minlength=K_OPTIMAL), index=raw_ids)
    raw_pct = raw_counts / raw_counts.sum() * 100
    raw_profile = features.assign(RawCluster=raw_labels + 1).groupby("RawCluster")[FEATURE_COLUMNS].mean().reindex(raw_ids)
    profile_norm = _minmax_profile(raw_profile).fillna(0.5)
    available = set(profile_norm.index.tolist())
    mapping: dict[int, int] = {}

    def assign(raw_id: int | None, semantic_id: int) -> None:
        if raw_id is None or raw_id not in available:
            return
        mapping[int(raw_id)] = int(semantic_id)
        available.remove(int(raw_id))

    def best(score: pd.Series, allowed: set[int] | None = None, highest: bool = True) -> int | None:
        pool = available if allowed is None else available.intersection(allowed)
        if not pool:
            return None
        ranked = score.loc[list(pool)].sort_values(ascending=not highest)
        return int(ranked.index[0])

    assign(int(raw_pct.idxmax()), 2)
    if available:
        assign(int(raw_pct.loc[list(available)].idxmax()), 5)

    high_cancel = profile_norm["Var10"] + 0.10 * profile_norm["Var9"]
    assign(best(high_cancel, highest=True), 3)

    uk_candidates = {cid for cid in available if raw_pct.loc[cid] <= 20}
    uk_score = profile_norm["Var9"] + raw_profile["Var9"].rank(pct=True).fillna(0)
    assign(best(uk_score, allowed=uk_candidates or None, highest=True), 4)

    premium = (
        0.35 * profile_norm["Var4"]
        + 0.35 * profile_norm["Var11"]
        + 0.20 * profile_norm["Var5"]
        + 0.10 * profile_norm["Var2"]
        - 0.15 * profile_norm["Var10"]
    )
    assign(best(premium, highest=True), 1)

    balanced = -np.abs(profile_norm - 0.5).sum(axis=1)
    assign(best(balanced, highest=True), 6)

    remaining_semantic = [cid for cid in raw_ids if cid not in mapping.values()]
    for raw_id, semantic_id in zip(sorted(available), remaining_semantic):
        mapping[int(raw_id)] = int(semantic_id)
    return mapping


def train_decision_tree_validation(x_pca: np.ndarray, semantic_labels: np.ndarray) -> dict[str, Any]:
    """Train a supervised Decision Tree validator against the KMeans cluster labels."""
    feature_names = [f"PC{i + 1}" for i in range(x_pca.shape[1])]
    x_train, x_test, y_train, y_test = train_test_split(
        x_pca,
        semantic_labels,
        test_size=0.2,
        random_state=RANDOM_SEED,
        stratify=semantic_labels,
    )

    baseline = DecisionTreeClassifier(max_depth=2, random_state=RANDOM_SEED)
    baseline.fit(x_train, y_train)
    baseline_train_accuracy = accuracy_score(y_train, baseline.predict(x_train))
    baseline_test_accuracy = accuracy_score(y_test, baseline.predict(x_test))

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)
    depth_scores = []
    for depth in range(2, 21):
        model = DecisionTreeClassifier(max_depth=depth, random_state=RANDOM_SEED)
        scores = cross_val_score(model, x_train, y_train, cv=cv, scoring="accuracy")
        depth_scores.append(
            {
                "max_depth": depth,
                "mean_accuracy": float(scores.mean()),
                "std_accuracy": float(scores.std()),
            }
        )

    best_depth_row = max(depth_scores, key=lambda row: row["mean_accuracy"])
    final_model = DecisionTreeClassifier(max_depth=int(best_depth_row["max_depth"]), random_state=RANDOM_SEED)
    final_model.fit(x_train, y_train)
    y_train_pred = final_model.predict(x_train)
    y_test_pred = final_model.predict(x_test)

    labels = list(range(1, K_OPTIMAL + 1))
    report = classification_report(
        y_test,
        y_test_pred,
        labels=labels,
        target_names=[f"C{label}" for label in labels],
        output_dict=True,
        zero_division=0,
    )
    matrix = confusion_matrix(y_test, y_test_pred, labels=labels)

    return {
        "purpose": "Supervised validation/surrogate classifier for KMeans cluster labels; not the deployment clustering model.",
        "target": "Semantic cluster labels C1-C6 generated by PCA + KMeans + business mapping.",
        "features": feature_names,
        "train_size": int(len(x_train)),
        "test_size": int(len(x_test)),
        "baseline": {
            "model": "DecisionTreeClassifier(max_depth=2)",
            "train_accuracy": float(baseline_train_accuracy),
            "test_accuracy": float(baseline_test_accuracy),
        },
        "tuning": {
            "cv": "StratifiedKFold(n_splits=5, shuffle=True, random_state=42)",
            "max_depth_range": "2-20",
            "best_max_depth": int(best_depth_row["max_depth"]),
            "best_cv_accuracy": float(best_depth_row["mean_accuracy"]),
            "depth_scores": depth_scores,
        },
        "final": {
            "model": f"DecisionTreeClassifier(max_depth={int(best_depth_row['max_depth'])})",
            "train_accuracy": float(accuracy_score(y_train, y_train_pred)),
            "test_accuracy": float(accuracy_score(y_test, y_test_pred)),
            "feature_importance": [
                {"feature": name, "importance": float(importance)}
                for name, importance in zip(feature_names, final_model.feature_importances_)
            ],
            "labels": [f"C{label}" for label in labels],
            "confusion_matrix": matrix.astype(int).tolist(),
            "classification_report": report,
        },
    }


def train_model_bundle(valid: pd.DataFrame, cancelled: pd.DataFrame) -> tuple[ModelBundle, pd.DataFrame, pd.DataFrame]:
    snapshot_date = valid["InvoiceDate"].max() + pd.Timedelta(days=1)
    features = compute_customer_features(valid, cancelled, snapshot_date)
    clip_bounds = fit_clip_bounds(features)
    clipped = apply_clip_bounds(features, clip_bounds)

    scaler = StandardScaler()
    x_scaled = scaler.fit_transform(clipped[FEATURE_COLUMNS].values)

    pca = PCA(n_components=N_PCA_COMPONENTS, random_state=RANDOM_SEED)
    x_pca = pca.fit_transform(x_scaled)

    kmeans = KMeans(n_clusters=K_OPTIMAL, init="k-means++", n_init=50, max_iter=500, random_state=69)
    raw_labels = kmeans.fit_predict(x_pca)
    raw_to_semantic = assign_business_labels(features, raw_labels)
    semantic_labels = np.array([raw_to_semantic[int(label) + 1] for label in raw_labels])
    validation = train_decision_tree_validation(x_pca, semantic_labels)

    clustered_features = features.copy()
    clustered_features["Cluster"] = semantic_labels
    profile_rows = []
    counts = clustered_features["Cluster"].value_counts().reindex(range(1, K_OPTIMAL + 1), fill_value=0)
    for cluster_id in range(1, K_OPTIMAL + 1):
        desc = PROFILE_DESCRIPTIONS[cluster_id]
        subset = clustered_features[clustered_features["Cluster"] == cluster_id]
        means = subset[FEATURE_COLUMNS].mean().fillna(0)
        dominant = means.sort_values(ascending=False).head(3).index.tolist()
        profile_rows.append(
            {
                "cluster": cluster_id,
                "profile": desc["profile"],
                "strategy": desc["strategy"],
                "proportion": round(float(counts.loc[cluster_id] / len(clustered_features)), 4),
                "dominant_features": ", ".join(f"{col} ({VAR_MEANINGS[col]})" for col in dominant),
                **{col: float(means[col]) for col in FEATURE_COLUMNS},
            }
        )
    cluster_profiles = pd.DataFrame(profile_rows)

    metrics = {
        "customers": float(len(features)),
        "explained_variance_6pc": float(pca.explained_variance_ratio_.sum()),
        "inertia": float(kmeans.inertia_),
        "decision_tree_test_accuracy": float(validation["final"]["test_accuracy"]),
        "decision_tree_best_depth": float(validation["tuning"]["best_max_depth"]),
        "decision_tree_validation": validation,
    }
    bundle = ModelBundle(
        scaler=scaler,
        pca=pca,
        kmeans=kmeans,
        raw_to_semantic=raw_to_semantic,
        clip_bounds=clip_bounds,
        snapshot_date=snapshot_date,
        metrics=metrics,
    )
    return bundle, build_product_catalog(valid), cluster_profiles


def predict_customer_cluster(bundle: ModelBundle, customer_features: pd.DataFrame) -> dict[str, Any]:
    clipped = apply_clip_bounds(customer_features, bundle.clip_bounds)
    x_scaled = bundle.scaler.transform(clipped[FEATURE_COLUMNS].values)
    x_pca = bundle.pca.transform(x_scaled)
    raw_label = int(bundle.kmeans.predict(x_pca)[0]) + 1
    cluster_id = int(bundle.raw_to_semantic.get(raw_label, raw_label))
    desc = PROFILE_DESCRIPTIONS[cluster_id]
    return {
        "cluster": cluster_id,
        "cluster_label": f"C{cluster_id}",
        "profile": desc["profile"],
        "strategy": desc["strategy"],
        "pca": {f"PC{i + 1}": float(value) for i, value in enumerate(x_pca[0])},
    }


def save_artifacts(bundle: ModelBundle, products: pd.DataFrame, profiles: pd.DataFrame, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, output_dir / "model_bundle.joblib")
    products.to_csv(output_dir / "products.csv", index=False)
    profiles.to_csv(output_dir / "cluster_profiles.csv", index=False)
    validation = bundle.metrics.get("decision_tree_validation")
    if validation:
        (output_dir / "decision_tree_validation.json").write_text(json.dumps(validation, indent=2), encoding="utf-8")


def load_artifacts(output_dir: Path) -> tuple[ModelBundle, pd.DataFrame, pd.DataFrame]:
    bundle = joblib.load(output_dir / "model_bundle.joblib")
    products = pd.read_csv(output_dir / "products.csv")
    profiles = pd.read_csv(output_dir / "cluster_profiles.csv")
    return bundle, products, profiles


def load_validation_artifact(output_dir: Path) -> dict[str, Any] | None:
    path = output_dir / "decision_tree_validation.json"
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    try:
        bundle = joblib.load(output_dir / "model_bundle.joblib")
    except Exception:
        return None
    validation = bundle.metrics.get("decision_tree_validation")
    return validation if isinstance(validation, dict) else None


def save_customer_dataset_artifacts(
    valid: pd.DataFrame,
    cancelled: pd.DataFrame,
    bundle: ModelBundle,
    output_dir: Path,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Persist searchable customer summaries and source transaction histories."""
    feature_table = compute_customer_features(valid, cancelled, bundle.snapshot_date)
    clipped = apply_clip_bounds(feature_table, bundle.clip_bounds)
    x_scaled = bundle.scaler.transform(clipped[FEATURE_COLUMNS].values)
    x_pca = bundle.pca.transform(x_scaled)
    raw_labels = bundle.kmeans.predict(x_pca) + 1
    semantic_labels = [bundle.raw_to_semantic.get(int(label), int(label)) for label in raw_labels]

    valid_summary = (
        valid.groupby("CustomerID", as_index=False)
        .agg(
            purchase_invoices=("InvoiceNo", "nunique"),
            total_spend=("TotalPrice", "sum"),
            last_purchase=("InvoiceDate", "max"),
            country=("Country", lambda values: values.mode().iloc[0]),
        )
    )
    if cancelled.empty:
        cancel_summary = pd.DataFrame(columns=["CustomerID", "cancellation_invoices"])
    else:
        cancel_summary = (
            cancelled.groupby("CustomerID", as_index=False)
            .agg(cancellation_invoices=("InvoiceNo", "nunique"))
        )

    customer_index = (
        feature_table[["CustomerID"]]
        .assign(cluster=semantic_labels)
        .merge(valid_summary, on="CustomerID", how="left")
        .merge(cancel_summary, on="CustomerID", how="left")
    )
    customer_index["cancellation_invoices"] = customer_index["cancellation_invoices"].fillna(0).astype(int)
    customer_index["purchase_invoices"] = customer_index["purchase_invoices"].fillna(0).astype(int)
    customer_index["total_spend"] = customer_index["total_spend"].fillna(0).round(2)
    customer_index["display_customer_id"] = customer_index["CustomerID"].str.replace(r"\.0$", "", regex=True)
    customer_index = customer_index.rename(columns={"CustomerID": "dataset_customer_id"})
    customer_index = customer_index.sort_values(
        ["purchase_invoices", "total_spend"],
        ascending=[False, False],
    ).reset_index(drop=True)

    columns = [
        "InvoiceNo",
        "StockCode",
        "Description",
        "Quantity",
        "InvoiceDate",
        "UnitPrice",
        "CustomerID",
        "Country",
    ]
    customer_transactions = pd.concat(
        [valid[columns], cancelled[columns]],
        ignore_index=True,
    ).sort_values(["CustomerID", "InvoiceDate", "InvoiceNo"])

    output_dir.mkdir(parents=True, exist_ok=True)
    customer_index.to_csv(output_dir / "customer_index.csv", index=False)
    joblib.dump(customer_transactions, output_dir / "customer_transactions.joblib", compress=3)
    return customer_index, customer_transactions


def load_customer_dataset_artifacts(output_dir: Path) -> tuple[pd.DataFrame, pd.DataFrame]:
    customer_index = pd.read_csv(output_dir / "customer_index.csv", dtype={"dataset_customer_id": str})
    customer_transactions = joblib.load(output_dir / "customer_transactions.joblib")
    customer_transactions["CustomerID"] = customer_transactions["CustomerID"].astype(str)
    return customer_index, customer_transactions


def make_synthetic_transactions(seed: int = RANDOM_SEED) -> pd.DataFrame:
    """Generate fallback transactions when UCI download is unavailable."""
    rng = np.random.default_rng(seed)
    products = [
        ("85123A", "WHITE HANGING HEART T-LIGHT HOLDER", 2.55),
        ("71053", "WHITE METAL LANTERN", 3.39),
        ("84406B", "CREAM CUPID HEARTS COAT HANGER", 2.75),
        ("84029G", "KNITTED UNION FLAG HOT WATER BOTTLE", 3.39),
        ("84029E", "RED WOOLLY HOTTIE WHITE HEART", 3.39),
        ("22752", "SET 7 BABUSHKA NESTING BOXES", 7.65),
        ("21730", "GLASS STAR FROSTED T-LIGHT HOLDER", 4.25),
        ("22633", "HAND WARMER UNION JACK", 2.10),
        ("22632", "HAND WARMER RED POLKA DOT", 2.10),
        ("84879", "ASSORTED COLOUR BIRD ORNAMENT", 1.69),
        ("22745", "POPPY'S PLAYHOUSE BEDROOM", 2.10),
        ("22748", "POPPY'S PLAYHOUSE KITCHEN", 2.10),
    ]
    countries = ["United Kingdom", "Germany", "France", "Netherlands", "Spain"]
    rows: list[dict[str, Any]] = []
    start = pd.Timestamp("2011-01-01")
    customer_count = 180
    for customer_idx in range(customer_count):
        customer_id = f"9{customer_idx:05d}"
        segment = customer_idx % K_OPTIMAL
        invoice_count = int(rng.integers(1 + segment, 5 + segment * 2))
        country = countries[0] if rng.random() < 0.78 else str(rng.choice(countries[1:]))
        for invoice_idx in range(invoice_count):
            invoice_date = start + pd.Timedelta(days=int(rng.integers(0, 330)))
            invoice_no = f"S{customer_idx:04d}{invoice_idx:03d}"
            basket_size = int(rng.integers(1, min(5 + segment, len(products))))
            chosen = rng.choice(len(products), size=basket_size, replace=False)
            for product_idx in chosen:
                stock, desc, price = products[int(product_idx)]
                qty_base = [1, 2, 5, 8, 2, 3][segment]
                quantity = max(1, int(rng.poisson(qty_base)))
                rows.append(
                    {
                        "InvoiceNo": invoice_no,
                        "StockCode": stock,
                        "Description": desc,
                        "Quantity": quantity,
                        "InvoiceDate": invoice_date,
                        "UnitPrice": round(float(price * rng.uniform(0.9, 1.15)), 2),
                        "CustomerID": customer_id,
                        "Country": country,
                    }
                )
            if segment == 2 and rng.random() < 0.35:
                stock, desc, price = products[int(rng.integers(0, len(products)))]
                rows.append(
                    {
                        "InvoiceNo": f"C{invoice_no}",
                        "StockCode": stock,
                        "Description": desc,
                        "Quantity": -1,
                        "InvoiceDate": invoice_date + pd.Timedelta(days=1),
                        "UnitPrice": price,
                        "CustomerID": customer_id,
                        "Country": country,
                    }
                )
    return pd.DataFrame(rows)
