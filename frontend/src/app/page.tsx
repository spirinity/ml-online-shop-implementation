"use client";

import { ArrowRight, Package, Plus, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { useShop } from "@/components/shop-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function currency(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

// Dataset descriptions are stored in all-caps; render them in title case instead.
function titleCase(value: string) {
  return value.toLowerCase().replace(/\b\p{L}/gu, (char) => char.toUpperCase());
}

// Deterministic soft gradient per product so the media tiles feel varied but on-brand.
const TILE_GRADIENTS = [
  "from-[#e5f5fc] to-[#c7ecf8]",
  "from-[#eef6fb] to-[#bfe0f3]",
  "from-[#e8f3f9] to-[#a9d7ee]",
  "from-[#eaf6fc] to-[#cfeafb]",
  "from-[#e3f1f9] to-[#b6dcf0]",
  "from-[#f0f7fb] to-[#d4ecfa]",
];

function tileGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return TILE_GRADIENTS[hash % TILE_GRADIENTS.length];
}

export default function CatalogPage() {
  const { products, loading, error, cart, addToCart, searchProducts, clearError } = useShop();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void searchProducts(query);
    }, 220);
    return () => window.clearTimeout(handle);
  }, [query, searchProducts]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const showSkeletons = loading && products.length === 0;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Product Catalog"
        title="Pilih produk, bangun histori pelanggan."
        description="CustomerID dibuat otomatis. Setiap checkout menambah histori yang dipakai untuk menghitung Var1-Var11 dan memprediksi segmentasi C1-C6."
        action={
          <Link className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-full px-5")} href="/cart">
            <ShoppingCart size={17} aria-hidden="true" />
            Lihat Cart
            {cartCount > 0 ? (
              <Badge className="ml-1 h-5 min-w-5 rounded-full bg-background px-1.5 text-primary">
                {cartCount}
              </Badge>
            ) : null}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        }
      />

      <ErrorAlert message={error} onDismiss={clearError} />

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-xl">
          <Search
            className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            className="h-12 rounded-full border-border bg-card pl-12 pr-4 text-base shadow-xs transition-shadow focus-visible:shadow-md"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari stock code atau nama produk"
            aria-label="Cari produk"
          />
        </label>
        <span className="inline-flex items-center gap-2 self-start rounded-full bg-secondary/60 px-3 py-1.5 text-sm font-medium text-muted-foreground sm:self-auto">
          <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
          {loading ? "Memuat katalog..." : `${products.length} produk tersedia`}
        </span>
      </section>

      <section className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-3 2xl:grid-cols-4 motion-stagger">
        {showSkeletons
          ? Array.from({ length: 8 }).map((_, index) => (
              <div className="flex flex-col gap-3" key={index}>
                <Skeleton className="aspect-square w-full rounded-[var(--radius-container)]" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))
          : products.map((product) => (
              <article className="group flex flex-col" key={product.product_id}>
                <div
                  className={cn(
                    "relative flex aspect-square items-center justify-center overflow-hidden rounded-[var(--radius-container)] bg-gradient-to-br transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1",
                    tileGradient(product.product_id),
                  )}
                >
                  <Package
                    className="size-16 text-primary/30 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                    aria-hidden="true"
                  />
                  <Badge className="absolute left-3 top-3 rounded-full bg-background/85 font-mono text-[0.68rem] text-primary backdrop-blur-sm">
                    {product.stock_code}
                  </Badge>
                  <Button
                    size="icon-lg"
                    className="absolute bottom-3 right-3 size-11 rounded-full opacity-0 shadow-md transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={() => addToCart(product)}
                    aria-label={`Tambah ${product.description} ke cart`}
                  >
                    <Plus size={18} aria-hidden="true" />
                  </Button>
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-sm font-medium leading-snug text-primary">
                      {titleCase(product.description)}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">{product.orders} historical orders</p>
                  </div>
                  <strong className="shrink-0 text-sm font-semibold text-primary">
                    {currency(product.unit_price)}
                  </strong>
                </div>
              </article>
            ))}
      </section>
    </div>
  );
}
