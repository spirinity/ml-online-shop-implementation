"use client";

import { Minus, PackageSearch, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useShop } from "@/components/shop-state";

function currency(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

export default function CartPage() {
  const {
    cart,
    total,
    busy,
    error,
    result,
    simulationMode,
    setSimulationMode,
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
  const hasPurchaseHistory = Boolean(result && result.summary.transaction_rows > 0);

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
              <span>History mode locked</span>
              <strong>Customer ini sudah punya histori pembelian.</strong>
              <p>Pembelian berikutnya memakai histori yang sama. Klik Customer Baru untuk memilih skenario awal lagi.</p>
            </div>
          ) : (
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
          )}
          <div className="summary-row">
            <span>Total</span>
            <strong>{currency(total)}</strong>
          </div>
          <button className="btn wide" onClick={checkout} disabled={!cart.length || busy}>
            <PackageSearch size={17} aria-hidden="true" />
            {busy ? "Memproses..." : "Checkout & Prediksi"}
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
