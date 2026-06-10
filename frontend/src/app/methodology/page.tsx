"use client";

import { useEffect, useState } from "react";
import { ModelInfo, ValidationMetrics, fetchModelInfo, fetchValidation } from "@/lib/api";

const steps = [
  ["Raw transaction data", "Online Retail.xlsx dengan invoice, product, quantity, price, customer, country."],
  ["Cleaning", "Pisahkan transaksi valid dan cancelled, hapus data yang tidak bisa dihitung."],
  ["Feature engineering", "Hitung Var1-Var11 per customer: recency, frequency, spend, cancel, dan fitur RFM-like lain."],
  ["Clipping p1-p99", "Batasi outlier ekstrem sebelum scaling agar clustering tidak didominasi customer anomali."],
  ["StandardScaler", "Normalisasi Z-score supaya fitur dengan skala besar tidak mendominasi jarak KMeans."],
  ["PCA 6 components", "Reduksi 11 fitur ke 6 principal components mengikuti pipeline notebook/paper."],
  ["KMeans K=6", "Model deployment memakai KMeans baseline untuk inference C1-C6."],
  ["Business mapping", "Cluster mentah dipetakan menjadi profil bisnis dan strategi marketing."],
  ["Decision Tree validation", "Classifier supervised dilatih untuk memvalidasi label cluster C1-C6 hasil pipeline PCA + KMeans."],
];

export default function MethodologyPage() {
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [validation, setValidation] = useState<ValidationMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const modelInfo = await fetchModelInfo();
        setInfo(modelInfo);
        try {
          setValidation(await fetchValidation());
        } catch (err) {
          setValidationError(err instanceof Error ? err.message : "Gagal memuat validasi Decision Tree.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat model info.");
      }
    }
    void load();
  }, []);

  const formatPct = (value: number) => `${Math.round(value * 10000) / 100}%`;
  const maxImportance = validation
    ? Math.max(...validation.final.feature_importance.map((item) => item.importance), 0.0001)
    : 1;

  return (
    <>
      <header className="page-hero">
        <div>
          <span className="eyebrow">Methodology</span>
          <h1>Pipeline model dari transaksi ke segmentasi.</h1>
          <p>
            Halaman ini menjelaskan alur ML yang dipakai aplikasi. Implementasi deployment mengikuti pipeline notebook,
            dengan catatan bahwa model saat ini memakai KMeans baseline, belum full K-means-QLDE.
          </p>
        </div>
      </header>

      {error ? <div className="notice error">{error}</div> : null}

      {info ? (
        <section className="metric-strip">
          <div>
            <span>Dataset</span>
            <strong>{info.dataset}</strong>
          </div>
          <div>
            <span>Customers</span>
            <strong>{info.customers.toLocaleString("id-ID")}</strong>
          </div>
          <div>
            <span>Products</span>
            <strong>{info.products.toLocaleString("id-ID")}</strong>
          </div>
          <div>
            <span>PCA variance</span>
            <strong>{Math.round(info.pca_variance * 10000) / 100}%</strong>
          </div>
        </section>
      ) : null}

      <section className="method-flow">
        {steps.map(([title, body], index) => (
          <article className="method-step" key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="validation-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Validation</span>
            <h2>Decision Tree sebagai validasi cluster.</h2>
          </div>
        </div>

        <div className="validation-body">
          <p>
            Decision Tree di sini bukan model segmentasi utama. Ia dilatih setelah clustering untuk melihat apakah label
            C1-C6 dari PCA + KMeans punya pola supervised yang konsisten dan bisa dipelajari dari komponen PCA.
          </p>

          {validationError ? <div className="notice error">{validationError}</div> : null}

          {validation ? (
            <>
              <div className="metric-strip">
                <div>
                  <span>Train rows</span>
                  <strong>{validation.train_size.toLocaleString("id-ID")}</strong>
                </div>
                <div>
                  <span>Test rows</span>
                  <strong>{validation.test_size.toLocaleString("id-ID")}</strong>
                </div>
                <div>
                  <span>Best depth</span>
                  <strong>{validation.tuning.best_max_depth}</strong>
                </div>
                <div>
                  <span>Final test accuracy</span>
                  <strong>{formatPct(validation.final.test_accuracy)}</strong>
                </div>
              </div>

              <div className="validation-grid">
                <article className="validation-card">
                  <span className="eyebrow">Baseline</span>
                  <h3>{validation.baseline.model}</h3>
                  <div className="summary-row">
                    <span>Train accuracy</span>
                    <strong>{formatPct(validation.baseline.train_accuracy)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Test accuracy</span>
                    <strong>{formatPct(validation.baseline.test_accuracy)}</strong>
                  </div>
                </article>

                <article className="validation-card">
                  <span className="eyebrow">Tuned model</span>
                  <h3>{validation.final.model}</h3>
                  <div className="summary-row">
                    <span>CV accuracy</span>
                    <strong>{formatPct(validation.tuning.best_cv_accuracy)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Train accuracy</span>
                    <strong>{formatPct(validation.final.train_accuracy)}</strong>
                  </div>
                </article>
              </div>

              <div className="validation-grid">
                <article className="validation-card">
                  <span className="eyebrow">Feature importance</span>
                  <h3>PCA components used by Decision Tree</h3>
                  <div className="importance-list">
                    {validation.final.feature_importance.map((item) => (
                      <div className="importance-row" key={item.feature}>
                        <span>{item.feature}</span>
                        <div className="bar-track">
                          <div
                            className="bar-fill charcoal"
                            style={{ width: `${Math.max(2, (item.importance / maxImportance) * 100)}%` }}
                          />
                        </div>
                        <strong>{formatPct(item.importance)}</strong>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="validation-card">
                  <span className="eyebrow">Confusion matrix</span>
                  <h3>Predicted cluster vs actual cluster</h3>
                  <div className="matrix-wrap">
                    <table className="matrix-table">
                      <thead>
                        <tr>
                          <th>Actual</th>
                          {validation.final.labels.map((label) => (
                            <th key={label}>{label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {validation.final.confusion_matrix.map((row, rowIndex) => (
                          <tr key={validation.final.labels[rowIndex]}>
                            <th>{validation.final.labels[rowIndex]}</th>
                            {row.map((value, colIndex) => (
                              <td key={`${rowIndex}-${colIndex}`}>{value}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              </div>
            </>
          ) : null}
        </div>
      </section>

      <div className="notice">
        Untuk klaim akademik, sebutkan bahwa aplikasi ini adalah deployment/inference praktis dari pipeline notebook.
        Full K-means-QLDE belum menjadi model inference utama; Decision Tree dipakai sebagai validasi supervised terhadap
        label cluster.
      </div>
    </>
  );
}
