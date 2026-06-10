"use client";

import {
  CalendarDays,
  Minus,
  PackageSearch,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useShop } from "@/components/shop-state";

function currency(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

export default function CartPage() {
  const [today] = useState(
    () => new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10),
  );
  const [customerSource, setCustomerSource] = useState<"simulation" | "dataset">("simulation");
  const [customerQuery, setCustomerQuery] = useState("");
  const [selectedDatasetCustomer, setSelectedDatasetCustomer] = useState("");
  const {
    cart,
    datasetCustomers,
    total,
    busy,
    error,
    result,
    simulationMode,
    transactionType,
    transactionDate,
    setSimulationMode,
    setTransactionType,
    setTransactionDate,
    searchDatasetCustomers,
    activateExistingCustomer,
    updateQuantity,
    clearCart,
    checkout,
  } = useShop();
  const modeOptions = [
    { value: "first_time", label: "First-time buyer" },
    { value: "premium", label: "Premium history" },
    { value: "high_cancel", label: "High-cancel history" },
    { value: "planned", label: "Planned buyer history" },
    { value: "international", label: "International history" },
  ];
  const hasPurchaseHistory = Boolean(
    result && (result.summary.purchase_invoice_count ?? result.summary.invoice_count) > 0,
  );
  const activeDatasetCustomerId = selectedDatasetCustomer || datasetCustomers[0]?.dataset_customer_id || "";
  const selectedCustomer = useMemo(
    () => datasetCustomers.find((customer) => customer.dataset_customer_id === activeDatasetCustomerId),
    [activeDatasetCustomerId, datasetCustomers],
  );

  useEffect(() => {
    if (customerSource === "dataset" && datasetCustomers.length === 0) {
      void searchDatasetCustomers();
    }
  }, [customerSource, datasetCustomers.length, searchDatasetCustomers]);

  return (
    <>
      <header className="page-hero compact-hero">
        <div>
          <span className="eyebrow">Checkout</span>
          <h1>Review cart lalu jalankan segmentasi.</h1>
          <p>
            Setelah checkout, cart dikosongkan tetapi histori customer tetap dipakai untuk pembelian berikutnya.
          </p>
        </div>
        <Link className="btn secondary" href="/">
          Tambah Produk
        </Link>
      </header>

      {error ? <div className="notice error">{error}</div> : null}

      <section className="checkout-layout">
        <div className="panel soft-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Cart items</span>
              <h2>{cart.length ? `${cart.length} produk di cart` : "Cart kosong"}</h2>
            </div>
            <button className="icon-button" onClick={clearCart} disabled={!cart.length || busy} aria-label="Clear cart">
              <Trash2 size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="cart-lines">
            {cart.length === 0 ? (
              <div className="empty-state">
                <ShoppingBag size={32} aria-hidden="true" />
                <strong>Belum ada produk.</strong>
                <span>Pilih produk dari katalog untuk memulai simulasi pembelian.</span>
              </div>
            ) : (
              cart.map((item) => (
                <div className="cart-line" key={item.product_id}>
                  <div>
                    <span className="product-code">{item.stock_code}</span>
                    <h3>{item.description}</h3>
                    <p>{currency(item.unit_price)} per item</p>
                  </div>
                  <div className="quantity-stepper">
                    <button onClick={() => updateQuantity(item.product_id, -1)} aria-label="Kurangi quantity">
                      <Minus size={15} aria-hidden="true" />
                    </button>
                    <strong>{item.quantity}</strong>
                    <button onClick={() => updateQuantity(item.product_id, 1)} aria-label="Tambah quantity">
                      <Plus size={15} aria-hidden="true" />
                    </button>
                  </div>
                  <strong>{currency(item.unit_price * item.quantity)}</strong>
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="panel checkout-card">
          <span className="eyebrow">Order summary</span>
          {hasPurchaseHistory ? (
            <div className="mode-locked">
              <span>{result?.summary.source === "dataset" ? "Existing dataset customer" : "History mode locked"}</span>
              <strong>
                {result?.summary.source === "dataset"
                  ? `${result.customer_id} memakai histori Online Retail.`
                  : "Customer ini sudah punya histori pembelian."}
              </strong>
              <p>Pembelian berikutnya memakai histori yang sama. Klik Customer Baru untuk memilih skenario awal lagi.</p>
            </div>
          ) : (
            <>
              <div className="checkout-field">
                <span>Customer source</span>
                <div className="segmented-control" role="group" aria-label="Customer source">
                  <button
                    type="button"
                    className={customerSource === "simulation" ? "active" : ""}
                    onClick={() => setCustomerSource("simulation")}
                  >
                    <ShoppingBag size={15} aria-hidden="true" />
                    Simulation
                  </button>
                  <button
                    type="button"
                    className={customerSource === "dataset" ? "active" : ""}
                    onClick={() => setCustomerSource("dataset")}
                  >
                    <Users size={15} aria-hidden="true" />
                    Existing dataset
                  </button>
                </div>
              </div>

              {customerSource === "simulation" ? (
                <label className="mode-picker">
                  <span>Initial customer scenario</span>
                  <select value={simulationMode} onChange={(event) => setSimulationMode(event.target.value)}>
                    {modeOptions.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="dataset-customer-picker">
                  <label className="customer-search">
                    <Search size={15} aria-hidden="true" />
                    <input
                      value={customerQuery}
                      onChange={(event) => setCustomerQuery(event.target.value)}
                      placeholder="CustomerID, country, atau C1-C6"
                    />
                    <button type="button" onClick={() => searchDatasetCustomers(customerQuery)} disabled={busy}>
                      Cari
                    </button>
                  </label>
                  <label className="mode-picker">
                    <span>Dataset customer</span>
                    <select
                      value={activeDatasetCustomerId}
                      onChange={(event) => setSelectedDatasetCustomer(event.target.value)}
                    >
                      {datasetCustomers.map((customer) => (
                        <option value={customer.dataset_customer_id} key={customer.dataset_customer_id}>
                          {customer.display_customer_id} · {customer.country} · {customer.cluster_label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {selectedCustomer ? (
                    <div className="dataset-customer-summary">
                      <div>
                        <span>Purchases</span>
                        <strong>{selectedCustomer.purchase_invoices}</strong>
                      </div>
                      <div>
                        <span>Cancels</span>
                        <strong>{selectedCustomer.cancellation_invoices}</strong>
                      </div>
                      <div>
                        <span>Spend</span>
                        <strong>{currency(selectedCustomer.total_spend)}</strong>
                      </div>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="btn secondary wide"
                    onClick={() => activateExistingCustomer(activeDatasetCustomerId)}
                    disabled={!activeDatasetCustomerId || busy}
                  >
                    <Users size={16} aria-hidden="true" />
                    Gunakan Customer Dataset
                  </button>
                </div>
              )}
            </>
          )}
          <div className="checkout-field">
            <span>Transaction type</span>
            <div className="segmented-control" role="group" aria-label="Transaction type">
              <button
                type="button"
                className={transactionType === "purchase" ? "active" : ""}
                onClick={() => setTransactionType("purchase")}
              >
                <ShoppingBag size={15} aria-hidden="true" />
                Purchase
              </button>
              <button
                type="button"
                className={transactionType === "cancel" ? "active" : ""}
                onClick={() => setTransactionType("cancel")}
                disabled={!hasPurchaseHistory}
                title={!hasPurchaseHistory ? "Customer harus memiliki pembelian valid terlebih dahulu" : undefined}
              >
                <RotateCcw size={15} aria-hidden="true" />
                Cancel
              </button>
            </div>
            {!hasPurchaseHistory ? <small>Cancel tersedia setelah customer memiliki pembelian valid.</small> : null}
          </div>

          <label className="checkout-field">
            <span>Transaction date</span>
            <div className="date-input">
              <CalendarDays size={16} aria-hidden="true" />
              <input
                type="date"
                value={transactionDate}
                max={today}
                onChange={(event) => setTransactionDate(event.target.value)}
                required
              />
            </div>
          </label>

          {transactionType === "cancel" ? (
            <div className="notice">
              Produk di cart akan dicatat sebagai pembatalan. Quantity disimpan negatif dan menambah Cancel Frequency.
            </div>
          ) : null}
          <div className="summary-row">
            <span>{transactionType === "cancel" ? "Cancellation value" : "Total"}</span>
            <strong>{currency(total)}</strong>
          </div>
          <button className="btn wide" onClick={checkout} disabled={!cart.length || !transactionDate || busy}>
            <PackageSearch size={17} aria-hidden="true" />
            {busy
              ? "Memproses..."
              : transactionType === "cancel"
                ? "Simpan Cancel & Prediksi"
                : "Checkout & Prediksi"}
          </button>
          {result ? (
            <Link className="btn secondary wide" href="/segment">
              Lihat Segmentasi {result.segment.cluster_label}
            </Link>
          ) : null}
        </aside>
      </section>
    </>
  );
}
