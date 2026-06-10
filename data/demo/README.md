# Demo Artifacts

Generated files are written here by:

```bash
python build_artifacts.py
```

Expected generated files:

- `model_bundle.joblib`
- `products.csv`
- `cluster_profiles.csv`
- `customer_index.csv`
- `customer_transactions.joblib`
- `decision_tree_validation.json`

The builder tries to use the UCI Online Retail dataset first. If the dataset
cannot be downloaded, it creates a deterministic synthetic retail dataset so the
local demo can still run.
