"""Build model and product artifacts for the online shop demo.

Run:
    python build_artifacts.py
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from segmentation import clean_transactions, make_synthetic_transactions, save_artifacts, train_model_bundle


BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "data" / "demo"
LOCAL_DATASET_CANDIDATES = [
    BASE_DIR / "data" / "input" / "Online Retail.xlsx",
    BASE_DIR / "data" / "demo" / "Online Retail.xlsx",
]


def load_local_online_retail() -> tuple[pd.DataFrame, Path] | None:
    for path in LOCAL_DATASET_CANDIDATES:
        if path.exists():
            return pd.read_excel(path), path
    return None


def load_uci_online_retail() -> pd.DataFrame:
    from ucimlrepo import fetch_ucirepo

    retail_repo = fetch_ucirepo(id=352)
    return retail_repo.data.original.copy()


def main() -> None:
    local = load_local_online_retail()
    if local is not None:
        raw, local_path = local
        source = f"local:{local_path.relative_to(BASE_DIR)}"
    else:
        source = "uci"
        try:
            raw = load_uci_online_retail()
        except Exception as exc:
            source = "synthetic"
            print(f"[WARN] UCI dataset unavailable: {exc}")
            print("[INFO] Falling back to deterministic synthetic transactions.")
            raw = make_synthetic_transactions()

    valid, cancelled = clean_transactions(raw)
    bundle, products, profiles = train_model_bundle(valid, cancelled)
    save_artifacts(bundle, products, profiles, OUTPUT_DIR)

    print("[OK] Artifacts generated.")
    print(f"  source             : {source}")
    print(f"  valid rows         : {len(valid):,}")
    print(f"  cancelled rows     : {len(cancelled):,}")
    print(f"  products           : {len(products):,}")
    print(f"  customers          : {int(bundle.metrics['customers']):,}")
    print(f"  pca variance       : {bundle.metrics['explained_variance_6pc'] * 100:.2f}%")
    print(f"  dt best depth      : {int(bundle.metrics['decision_tree_best_depth'])}")
    print(f"  dt test accuracy   : {bundle.metrics['decision_tree_test_accuracy'] * 100:.2f}%")
    print(f"  output directory   : {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
