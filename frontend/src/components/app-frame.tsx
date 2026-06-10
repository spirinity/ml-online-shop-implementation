"use client";

import { BarChart3, BookOpen, GitBranch, Home, RefreshCcw, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShopProvider, useShop } from "@/components/shop-state";

const nav = [
  { href: "/", label: "Catalog", icon: Home },
  { href: "/cart", label: "Cart", icon: ShoppingBag },
  { href: "/segment", label: "Segment", icon: BarChart3 },
  { href: "/clusters", label: "Clusters", icon: BookOpen },
  { href: "/methodology", label: "Method", icon: GitBranch },
];

function FrameContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cart, customerId, result, startNewCustomer, busy } = useShop();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="app-frame">
      <header className="top-nav">
        <div className="brand">
          <div className="brand-mark">
            <ShoppingBag size={20} aria-hidden="true" />
          </div>
          <span>Segment Shop</span>
        </div>

        <nav className="nav-list" aria-label="Primary">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link className={active ? "nav-link active" : "nav-link"} href={item.href} key={item.href}>
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
                {item.href === "/cart" && cartCount > 0 ? <strong>{cartCount}</strong> : null}
              </Link>
            );
          })}
        </nav>

        <div className="session-strip">
          <div>
            <span className="meta-label">Customer</span>
            <strong className="customer-code">{customerId ?? "Menyiapkan..."}</strong>
          </div>
          <div>
            <span className="meta-label">Segment</span>
            <strong>{result ? result.segment.cluster_label : "Belum ada"}</strong>
          </div>
        </div>

        <button className="btn secondary" onClick={startNewCustomer} disabled={busy}>
          <RefreshCcw size={16} aria-hidden="true" />
          Customer Baru
        </button>
      </header>

      <section className="page-shell">{children}</section>
    </main>
  );
}

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <ShopProvider>
      <FrameContent>{children}</FrameContent>
    </ShopProvider>
  );
}
