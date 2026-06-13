"use client";

import { ArrowRight, GraduationCap, Package, Plus, Search, SlidersHorizontal, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { ProductVisual } from "@/components/product-visual";
import { useShop } from "@/components/shop-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { COURSE, PAPER } from "@/lib/project-info";
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

type SortKey = "relevance" | "price-asc" | "price-desc" | "popular";
type PriceTier = "all" | "under-2" | "2-5" | "over-5";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Paling relevan" },
  { value: "price-asc", label: "Harga: rendah ke tinggi" },
  { value: "price-desc", label: "Harga: tinggi ke rendah" },
  { value: "popular", label: "Paling laris" },
];

const PRICE_TIERS: { value: PriceTier; label: string }[] = [
  { value: "all", label: "Semua harga" },
  { value: "under-2", label: "< £2" },
  { value: "2-5", label: "£2 – £5" },
  { value: "over-5", label: "> £5" },
];

export default function CatalogPage() {
  const { products, loading, error, cart, addToCart, searchProducts, clearError } = useShop();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [priceTier, setPriceTier] = useState<PriceTier>("all");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void searchProducts(query);
    }, 220);
    return () => window.clearTimeout(handle);
  }, [query, searchProducts]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const visibleProducts = useMemo(() => {
    const inTier = (price: number) => {
      switch (priceTier) {
        case "under-2":
          return price < 2;
        case "2-5":
          return price >= 2 && price <= 5;
        case "over-5":
          return price > 5;
        default:
          return true;
      }
    };
    const filtered = products.filter((product) => inTier(product.unit_price));
    const sorted = [...filtered];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.unit_price - b.unit_price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.unit_price - a.unit_price);
        break;
      case "popular":
        sorted.sort((a, b) => b.orders - a.orders);
        break;
      default:
        break;
    }
    return sorted;
  }, [products, priceTier, sort]);

  const filtersActive = sort !== "relevance" || priceTier !== "all";
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

      <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-accent/25 bg-accent/5 px-4 py-3">
        <GraduationCap className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
        <p className="text-sm leading-6 text-muted-foreground">
          Demo interaktif untuk tugas mata kuliah <strong className="font-semibold text-primary">{COURSE.name}</strong>{" "}
          ({COURSE.group}) — reimplementasi paper{" "}
          <a
            href={PAPER.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Wang ({PAPER.year})
          </a>{" "}
          tentang segmentasi pelanggan dengan K-Means + PCA. Klik ikon info di header untuk detail & anggota kelompok.
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={clearError} />

      <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-md">
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:inline-flex">
            <SlidersHorizontal size={15} aria-hidden="true" />
            Filter
          </span>
          <Select items={PRICE_TIERS} value={priceTier} onValueChange={(value) => value && setPriceTier(value as PriceTier)}>
            <SelectTrigger className="!h-11 rounded-full bg-card px-4" aria-label="Filter harga">
              <SelectValue placeholder="Harga" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_TIERS.map((tier) => (
                <SelectItem value={tier.value} key={tier.value}>
                  {tier.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select items={SORT_OPTIONS} value={sort} onValueChange={(value) => value && setSort(value as SortKey)}>
            <SelectTrigger className="!h-11 rounded-full bg-card px-4" aria-label="Urutkan produk">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem value={option.value} key={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filtersActive ? (
            <Button
              variant="ghost"
              className="h-11 rounded-full px-3 text-sm text-muted-foreground"
              onClick={() => {
                setSort("relevance");
                setPriceTier("all");
              }}
            >
              Reset
            </Button>
          ) : null}
        </div>
      </section>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
        {loading ? "Memuat katalog..." : `${visibleProducts.length} dari ${products.length} produk`}
      </div>

      <section className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-3 2xl:grid-cols-4 motion-stagger">
        {showSkeletons
          ? Array.from({ length: 8 }).map((_, index) => (
              <div className="flex flex-col gap-3" key={index}>
                <Skeleton className="aspect-square w-full rounded-[var(--radius-container)]" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))
          : visibleProducts.map((product) => (
              <article className="group flex flex-col" key={product.product_id}>
                <div
                  className={cn(
                    "relative flex aspect-square items-center justify-center overflow-hidden rounded-[var(--radius-container)] bg-gradient-to-br transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1",
                    tileGradient(product.product_id),
                  )}
                >
                  <ProductVisual
                    stockCode={product.stock_code}
                    description={product.description}
                    className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-80" />
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
        {!showSkeletons && visibleProducts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-[var(--radius-container)] border border-dashed border-border py-16 text-center">
            <Package className="size-10 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Tidak ada produk yang cocok dengan filter ini.</p>
            <Button
              variant="outline"
              className="h-10 rounded-full px-4"
              onClick={() => {
                setSort("relevance");
                setPriceTier("all");
              }}
            >
              Reset filter
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
