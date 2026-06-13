"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ModelInfo, ValidationMetrics } from "@/lib/api";
import { fetchModelInfo, fetchValidation } from "@/lib/api";

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
    <div className="space-y-5">
      <PageHeader
        eyebrow="Methodology"
        title="Pipeline model dari transaksi ke segmentasi."
        description="Halaman ini menjelaskan alur ML yang dipakai aplikasi. Implementasi deployment mengikuti pipeline notebook, dengan catatan bahwa model saat ini memakai KMeans baseline, belum full K-means-QLDE."
      />

      {error ? (
        <Alert className="border-destructive/25 bg-destructive/10 text-destructive" variant="destructive">
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      ) : null}

      {info ? (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Dataset", info.dataset],
            ["Customers", info.customers.toLocaleString("id-ID")],
            ["Products", info.products.toLocaleString("id-ID")],
            ["PCA variance", `${Math.round(info.pca_variance * 10000) / 100}%`],
          ].map(([label, value]) => (
            <Card className="rounded-[var(--radius-card)] border-border shadow-none" key={label} size="sm">
              <CardContent>
                <span className="text-sm text-muted-foreground">{label}</span>
                <strong className="mt-2 block break-words text-2xl font-semibold text-primary">{value}</strong>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      <section className="grid gap-3">
        {steps.map(([title, body], index) => (
          <Card className="rounded-[var(--radius-card)] border-border shadow-none" key={title} size="sm">
            <CardContent className="grid gap-4 sm:grid-cols-[56px_minmax(0,1fr)] sm:items-start">
              <span className="grid size-12 place-items-center rounded-full bg-primary font-mono text-sm font-semibold text-white">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-xl font-semibold leading-tight text-primary">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="rounded-[var(--radius-card)] border-border shadow-none">
        <CardHeader className="border-b border-border pb-4">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Validation</span>
          <CardTitle className="text-2xl text-primary">Decision Tree sebagai validasi cluster.</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
            Decision Tree di sini bukan model segmentasi utama. Ia dilatih setelah clustering untuk melihat apakah label
            C1-C6 dari PCA + KMeans punya pola supervised yang konsisten dan bisa dipelajari dari komponen PCA.
          </p>

          {validationError ? (
            <Alert className="border-destructive/25 bg-destructive/10 text-destructive" variant="destructive">
              <AlertDescription className="text-destructive">{validationError}</AlertDescription>
            </Alert>
          ) : null}

          {validation ? (
            <>
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Train rows", validation.train_size.toLocaleString("id-ID")],
                  ["Test rows", validation.test_size.toLocaleString("id-ID")],
                  ["Best depth", validation.tuning.best_max_depth],
                  ["Final test accuracy", formatPct(validation.final.test_accuracy)],
                ].map(([label, value]) => (
                  <div className="rounded-[var(--radius-card)] border border-border bg-secondary/35 p-4" key={label}>
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <strong className="mt-2 block text-2xl font-semibold text-primary">{value}</strong>
                  </div>
                ))}
              </section>

              <section className="grid gap-3 lg:grid-cols-2">
                <article className="rounded-[var(--radius-card)] border border-border bg-card p-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Baseline
                  </span>
                  <h3 className="mt-2 text-xl font-semibold text-primary">{validation.baseline.model}</h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">Train accuracy</span>
                      <strong className="text-primary">{formatPct(validation.baseline.train_accuracy)}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">Test accuracy</span>
                      <strong className="text-primary">{formatPct(validation.baseline.test_accuracy)}</strong>
                    </div>
                  </div>
                </article>

                <article className="rounded-[var(--radius-card)] border border-border bg-card p-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Tuned model
                  </span>
                  <h3 className="mt-2 text-xl font-semibold text-primary">{validation.final.model}</h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">CV accuracy</span>
                      <strong className="text-primary">{formatPct(validation.tuning.best_cv_accuracy)}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">Train accuracy</span>
                      <strong className="text-primary">{formatPct(validation.final.train_accuracy)}</strong>
                    </div>
                  </div>
                </article>
              </section>

              <section className="grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <article className="rounded-[var(--radius-card)] border border-border bg-card p-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Feature importance
                  </span>
                  <h3 className="mt-2 text-xl font-semibold text-primary">PCA components used by Decision Tree</h3>
                  <div className="mt-5 grid gap-3">
                    {validation.final.feature_importance.map((item) => (
                      <div className="grid grid-cols-[44px_minmax(0,1fr)_64px] items-center gap-3" key={item.feature}>
                        <span className="text-sm text-primary">{item.feature}</span>
                        <div className="h-3 overflow-hidden rounded-full border border-border bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.max(2, (item.importance / maxImportance) * 100)}%` }}
                          />
                        </div>
                        <strong className="text-right text-sm text-primary">{formatPct(item.importance)}</strong>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-[var(--radius-card)] border border-border bg-card p-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Confusion matrix
                  </span>
                  <h3 className="mt-2 text-xl font-semibold text-primary">Predicted cluster vs actual cluster</h3>
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Actual</TableHead>
                          {validation.final.labels.map((label) => (
                            <TableHead className="text-right" key={label}>
                              {label}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validation.final.confusion_matrix.map((row, rowIndex) => (
                          <TableRow key={validation.final.labels[rowIndex]}>
                            <TableHead>{validation.final.labels[rowIndex]}</TableHead>
                            {row.map((value, colIndex) => (
                              <TableCell className="text-right" key={`${rowIndex}-${colIndex}`}>
                                {value}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </article>
              </section>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Alert className="border-accent/30 bg-secondary/60">
        <AlertDescription>
          Untuk klaim akademik, sebutkan bahwa aplikasi ini adalah deployment/inference praktis dari pipeline notebook.
          Full K-means-QLDE belum menjadi model inference utama; Decision Tree dipakai sebagai validasi supervised
          terhadap label cluster.
        </AlertDescription>
      </Alert>
    </div>
  );
}
