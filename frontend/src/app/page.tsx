"use client";

import { PackagePlus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useShop } from "@/components/shop-state";

function currency(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

export default function CatalogPage() {
  const { products, loading, error, cart, addToCart, searchProducts } = useShop();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void searchProducts(query);
    }, 220);
    return () => window.clearTimeout(handle);
  }, [query, searchProducts]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="page-hero compact-hero">
        <div>
          <span className="eyebrow">Product Catalog</span>
          <h1>Pilih produk, bangun histori pelanggan.</h1>
          <p>
            CustomerID dibuat otomatis. Setiap checkout menambah histori yang dipakai untuk menghitung Var1-Var11 dan
            memprediksi segmentasi C1-C6.
          </p>
        </div>
        <Link className="btn" href="/cart">
          Lihat Cart
          {cartCount > 0 ? <strong className="count-badge">{cartCount}</strong> : null}
        </Link>
      </header>

      {error ? <div className="notice error">{error}</div> : null}

      <section className="toolbar">
        <div className="searchbox">
          <Search size={18} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari stock code atau nama produk"
            aria-label="Cari produk"
          />
        </div>
        <span>{loading ? "Memuat katalog..." : `${products.length} produk tersedia`}</span>
      </section>

      <section className="catalog-grid">
        {products.map((product) => (
          <article className="product-card" key={product.product_id}>
            <div className="product-code">{product.stock_code}</div>
            <h2>{product.description}</h2>
            <div className="product-row">
              <span>{product.orders} historical orders</span>
              <strong>{currency(product.unit_price)}</strong>
            </div>
            <button className="btn wide" onClick={() => addToCart(product)}>
              <PackagePlus size={17} aria-hidden="true" />
              Add to cart
            </button>
          </article>
        ))}
      </section>
    </>
  );
}
