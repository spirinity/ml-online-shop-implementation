"use client";

import { BarChart3, BookOpen, GitBranch, RefreshCw, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useShop } from "@/components/shop-state";
import { CheckoutResponse } from "@/lib/api";

function currency(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function explainSegment(result: CheckoutResponse) {
  const entries = Object.entries(result.features)
    .map(([key, feature]) => ({ key, ...feature }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 4);
  return entries;
}

export default function SegmentPage() {
  const { result, busy, error, refreshSegment } = useShop();

  useEffect(() => {
    if (!result) void refreshSegment();
  }, [refreshSegment, result]);

  return (
    <>
      <header className="page-hero">
        <div>
          <span className="eyebrow">Customer Segment</span>
          <h1>Hasil segmentasi pelanggan aktif.</h1>
          <p>
            Halaman ini menampilkan segmentasi customer yang sudah pernah checkout. Jika customer belum membeli apa pun,
            lakukan checkout pertama dari halaman Cart.
          </p>
        </div>
        <button className="btn secondary" onClick={refreshSegment} disabled={busy}>
          <RefreshCw size={16} aria-hidden="true" />
          Refresh
        </button>
      </header>

      {error ? <div className="notice error">{error}</div> : null}

      {!result ? (
        <section className="empty-state tall">
          <ShoppingBag size={40} aria-hidden="true" />
          <strong>Belum ada segmentasi untuk customer ini.</strong>
          <span>Tambahkan produk dan checkout dulu. Setelah itu, hasil C1-C6 akan muncul di halaman ini.</span>
          <Link className="btn" href="/">
            Mulai Belanja
          </Link>
        </section>
      ) : (
        <section className="segment-layout">
          <div className="segment-hero-card">
            <div>
              <span className="eyebrow">{result.segment.profile}</span>
              <h2>{result.segment.cluster_label}</h2>
              <p>{result.segment.strategy}</p>
            </div>
            <BarChart3 size={56} aria-hidden="true" />
          </div>

          <div className="metric-strip">
            <div>
              <span>Purchases</span>
              <strong>{result.summary.purchase_invoice_count ?? result.summary.invoice_count}</strong>
            </div>
            <div>
              <span>Cancellations</span>
              <strong>{result.summary.cancellation_invoice_count ?? 0}</strong>
            </div>
            <div>
              <span>Total spend</span>
              <strong>{currency(result.summary.total_spend)}</strong>
            </div>
            <div>
              <span>Model proportion</span>
              <strong>{Math.round(result.segment.proportion * 100)}%</strong>
            </div>
          </div>

          <div className="panel soft-panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">Why this segment?</span>
                <h2>Fitur paling menonjol untuk customer ini</h2>
              </div>
            </div>
            <div className="reason-grid">
              {explainSegment(result).map((feature) => (
                <div className="reason-card" key={feature.key}>
                  <span>{feature.key}</span>
                  <strong>{feature.label}</strong>
                  <p>Nilai customer: {feature.value.toLocaleString("id-ID")}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel soft-panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">Var1-Var11</span>
                <h2>Feature snapshot</h2>
              </div>
            </div>
            <div className="feature-board">
              {Object.entries(result.features).map(([key, feature]) => (
                <div className="feature-cell" key={key}>
                  <span>{key}</span>
                  <strong>{feature.value.toLocaleString("id-ID")}</strong>
                  <small>{feature.label}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="panel soft-panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">Latest history</span>
                <h2>Histori pembelian customer</h2>
              </div>
            </div>
            <div className="history-table">
              {result.history.map((item, index) => (
                <div className="history-row" key={`${item.invoice_no}-${item.stock_code}-${index}`}>
                  <div className="history-meta">
                    <span className={`transaction-badge ${item.transaction_type}`}>
                      {item.transaction_type === "cancel" ? "Cancel" : "Purchase"}
                    </span>
                    <span>{item.invoice_date ? formatDate(item.invoice_date) : item.invoice_no}</span>
                  </div>
                  <div>
                    <strong>{item.description}</strong>
                    <span>{item.invoice_no}</span>
                  </div>
                  <span>
                    {Math.abs(item.quantity)} x {currency(item.unit_price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="notice">{result.note}</div>

          <div className="cta-row">
            <Link className="btn secondary" href="/clusters">
              <BookOpen size={16} aria-hidden="true" />
              Lihat semua cluster
            </Link>
            <Link className="btn secondary" href="/methodology">
              <GitBranch size={16} aria-hidden="true" />
              Lihat pipeline model
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
