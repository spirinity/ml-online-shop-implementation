"use client";

import { Boxes, ChartPie, RefreshCcw, ShoppingCart, Store, Workflow } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ShopProvider, useShop } from "@/components/shop-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ToastProvider } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Catalog", icon: Store },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/segment", label: "Segment", icon: ChartPie },
  { href: "/clusters", label: "Clusters", icon: Boxes },
  { href: "/methodology", label: "Method", icon: Workflow },
];

function FrameContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);
  const { cart, customerId, result, startNewCustomer, busy } = useShop();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [confirmReset, setConfirmReset] = useState(false);
  const [island, setIsland] = useState<{ left: number; top: number; width: number; height: number; ready: boolean }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false,
  });

  useEffect(() => {
    const navElement = navRef.current;
    if (!navElement) return;

    const measure = () => {
      const activeElement = navElement.querySelector<HTMLElement>('[data-nav-item][aria-current="page"]');
      if (!activeElement) {
        setIsland((prev) => ({ ...prev, ready: false }));
        return;
      }
      setIsland((prev) => ({
        left: activeElement.offsetLeft,
        top: activeElement.offsetTop,
        width: activeElement.offsetWidth,
        height: activeElement.offsetHeight,
        // Skip the entrance slide on the very first measurement.
        ready: prev.width !== 0 || prev.ready,
      }));
    };

    const scrollIntoView = () => {
      const activeElement = navElement.querySelector<HTMLElement>('[aria-current="page"]');
      if (!activeElement) return;
      navElement.scrollLeft = Math.max(
        0,
        activeElement.offsetLeft - navElement.clientWidth / 2 + activeElement.clientWidth / 2,
      );
    };

    measure();
    const timeout = window.setTimeout(() => {
      scrollIntoView();
      measure();
      setIsland((prev) => ({ ...prev, ready: true }));
    }, 50);

    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("resize", measure);
    };
  }, [pathname, cartCount]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/92 backdrop-blur-xl supports-[backdrop-filter]:bg-background/86">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 px-4 py-2 sm:px-6 sm:py-3 lg:min-h-20 lg:flex-row lg:items-center lg:gap-5 lg:px-8">
          <Link className="flex min-h-11 min-w-0 items-center gap-3 text-primary" href="/">
            <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-primary bg-background sm:size-10">
              <Store size={18} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Customer Segmentation
              </span>
              <span className="block truncate text-base font-semibold leading-tight sm:text-[1.05rem]">Segment Shop</span>
            </span>
          </Link>

          <nav
            className="relative flex min-w-0 gap-1 overflow-x-auto rounded-full border border-border bg-secondary/55 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-auto"
            aria-label="Primary"
            ref={navRef}
          >
            {island.width > 0 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute left-0 top-0 z-0 rounded-full bg-primary shadow-sm",
                  island.ready
                    ? "transition-[transform,width,height] duration-[450ms] ease-[cubic-bezier(0.34,1.4,0.5,1)]"
                    : "",
                )}
                style={{
                  width: `${island.width}px`,
                  height: `${island.height}px`,
                  transform: `translate(${island.left}px, ${island.top}px)`,
                }}
              />
            ) : null}
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  data-nav-item
                  className={cn(
                    "relative z-10 inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors duration-300",
                    active
                      ? "[color:var(--primary-foreground)] hover:[color:var(--primary-foreground)]"
                      : "text-primary/70 hover:text-primary",
                  )}
                  href={item.href}
                  key={item.href}
                  aria-current={active ? "page" : undefined}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.href === "/cart" && cartCount > 0 ? (
                    <Badge
                      className={cn(
                        "h-5 min-w-5 rounded-full px-1.5 text-[0.68rem] transition-colors duration-300",
                        active ? "bg-background text-primary" : "bg-primary [color:var(--primary-foreground)]",
                      )}
                    >
                      {cartCount}
                    </Badge>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-stretch gap-2 lg:w-[420px] lg:gap-3">
            <div className="grid min-w-0 grid-cols-2 overflow-hidden rounded-[var(--radius-card)] border border-border bg-background">
              <div className="flex min-w-0 flex-col justify-center border-r border-border px-3 py-1.5 sm:py-2">
                <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Customer
                </span>
                <strong className="block truncate font-mono text-[0.78rem] font-semibold text-primary">
                  {customerId ?? "Menyiapkan..."}
                </strong>
              </div>
              <div className="flex min-w-0 flex-col justify-center px-3 py-1.5 sm:py-2">
                <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Segment
                </span>
                <strong className="block truncate text-[0.82rem] font-semibold text-primary">
                  {result ? result.segment.cluster_label : "Belum ada"}
                </strong>
              </div>
            </div>

            <Button
              className="h-full min-h-11 w-11 rounded-full px-0 sm:w-auto sm:px-4"
              variant="outline"
              onClick={() => setConfirmReset(true)}
              disabled={busy}
            >
              <RefreshCcw size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Customer Baru</span>
            </Button>
          </div>
        </div>
      </header>

      <section
        key={pathname}
        className="mx-auto w-full max-w-[1440px] animate-fade-in px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
      >
        {children}
      </section>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Mulai dengan customer baru?"
        description="Cart, histori, dan hasil segmentasi customer saat ini akan dihapus dan diganti CustomerID baru. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Ya, buat customer baru"
        cancelLabel="Batal"
        destructive
        onConfirm={startNewCustomer}
      />
    </main>
  );
}

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ShopProvider>
        <FrameContent>{children}</FrameContent>
      </ShopProvider>
    </ToastProvider>
  );
}
