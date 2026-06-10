# Online Shop Customer Segmentation

Web app simulasi online shop untuk customer segmentation berbasis pipeline notebook
`3_Preliminary_Result_Kelompok5.ipynb`.

Stack mengikuti pola project pembanding:

```text
Next.js frontend (:3000) -> FastAPI backend (:8000) -> Python ML artifacts
```

## Setup Backend

```bash
pip install -r requirements_api.txt
python build_artifacts.py
uvicorn api:app --port 8000
```

`build_artifacts.py` mencoba memakai UCI Online Retail. Jika download gagal, script
membuat synthetic retail dataset deterministik agar demo lokal tetap bisa jalan.

## Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:3000`.

## API

- `GET /api/health`
- `GET /api/products`
- `POST /api/session/new`
- `POST /api/session/reset`
- `POST /api/checkout`

`POST /api/checkout` menerima `transaction_date` (`YYYY-MM-DD`) dan
`transaction_type` (`purchase` atau `cancel`). Cancel hanya bisa dicatat setelah
customer memiliki minimal satu pembelian valid dan akan menambah fitur
`Var10`/Cancel Frequency.

Histori customer disimpan in-memory di backend, jadi akan hilang saat server
FastAPI restart.
