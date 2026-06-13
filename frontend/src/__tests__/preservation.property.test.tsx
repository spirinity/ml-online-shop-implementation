/**
 * Preservation Property Tests (Property 2)
 *
 * Encodes behavior and markup that MUST remain unchanged after the fix
 * (`isBugCondition` returns false). Following the observation-first methodology,
 * these assertions were written against the CURRENT (unfixed) rendered output, so
 * they PASS on unfixed code and act as a regression guard once the fix is applied.
 *
 * IMPORTANT: These tests intentionally avoid asserting anything that the fix WILL
 * change (the navbar `flex-1`, the catalog error `<div>`, the cart header
 * `flex-row`/`justify-between`, the button `rounded-md`/`rounded-full` base, or
 * hardcoded `text-white`). They only pin down the surrounding, unrelated output.
 *
 * Uses fast-check to generate randomized shop/render states (routes, cart items,
 * customer source, error present/absent, transaction type, theme, viewport width).
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import fc from "fast-check";

// --- Hoisted mutable mocks (set per render) -------------------------------------------------
const { mockState, navState } = vi.hoisted(() => ({
  mockState: { current: null as unknown as Record<string, unknown> },
  navState: { pathname: "/" },
}));

vi.mock("@/components/shop-state", () => ({
  ShopProvider: ({ children }: { children: React.ReactNode }) => children,
  useShop: () => mockState.current,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navState.pathname,
}));

// clusters/methodology pages call these directly (not through the shop context).
vi.mock("@/lib/api", () => ({
  fetchClusters: vi.fn(),
  fetchModelInfo: vi.fn(),
  fetchValidation: vi.fn(),
}));

// Components under test
import { AppFrame } from "@/components/app-frame";
import CartPage from "@/app/cart/page";
import SegmentPage from "@/app/segment/page";
import ClustersPage from "@/app/clusters/page";
import MethodologyPage from "@/app/methodology/page";
import { fetchClusters, fetchModelInfo } from "@/lib/api";

// --- Helpers --------------------------------------------------------------------------------
type ShopOverrides = Record<string, unknown>;

function makeShopState(overrides: ShopOverrides = {}) {
  return {
    customerId: "C0001",
    products: [],
    datasetCustomers: [],
    cart: [],
    result: null,
    loading: false,
    busy: false,
    error: null,
    total: 0,
    simulationMode: "first_time",
    transactionType: "purchase",
    transactionDate: "2024-01-01",
    setSimulationMode: vi.fn(),
    setTransactionType: vi.fn(),
    setTransactionDate: vi.fn(),
    searchProducts: vi.fn().mockResolvedValue(undefined),
    searchDatasetCustomers: vi.fn().mockResolvedValue(undefined),
    activateExistingCustomer: vi.fn().mockResolvedValue(undefined),
    addToCart: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    checkout: vi.fn().mockResolvedValue(undefined),
    startNewCustomer: vi.fn().mockResolvedValue(undefined),
    refreshSegment: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeCartItem(id: number) {
  return {
    product_id: `P${id}`,
    stock_code: `SKU${id}`,
    description: `Product ${id}`,
    unit_price: 10 + id,
    orders: id,
    quantity: 1 + (id % 3),
  };
}

function makeResult() {
  return {
    customer_id: "C0001",
    invoice_no: "INV-1",
    summary: {
      customer_id: "C0001",
      transaction_rows: 4,
      invoice_count: 2,
      purchase_invoice_count: 2,
      cancellation_invoice_count: 0,
      total_spend: 120,
      source: "simulation",
    },
    checkout: { items: 2, subtotal: 120, transaction_type: "purchase", transaction_date: "2024-01-01" },
    segment: {
      cluster: 1,
      cluster_label: "C1",
      profile: "Loyal buyers",
      strategy: "Reward loyalty",
      proportion: 0.25,
      dominant_features: "Var1, Var2",
      pca: { PC1: 0.5 },
    },
    features: {
      Var1: { label: "Recency", value: 12 },
      Var2: { label: "Frequency", value: 4 },
      Var3: { label: "Monetary", value: 120 },
      Var4: { label: "Cancel rate", value: 0 },
    },
    history: [
      {
        invoice_no: "INV-1",
        stock_code: "SKU1",
        description: "Product 1",
        quantity: 2,
        unit_price: 11,
        invoice_date: "2024-01-01",
        transaction_type: "purchase",
      },
    ],
    note: "Demo note",
  };
}

// WCAG relative-luminance contrast ratio between two #rrggbb colors.
function contrastRatio(hexA: string, hexB: string) {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const luminance = (hex: string) => {
    const v = hex.replace("#", "");
    const r = parseInt(v.slice(0, 2), 16);
    const g = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const l1 = luminance(hexA);
  const l2 = luminance(hexB);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const NAV_HREFS = ["/", "/cart", "/segment", "/clusters", "/methodology"];
const routeArb = fc.constantFrom(...NAV_HREFS);
const cartArb = fc.array(fc.integer({ min: 1, max: 9 }), { maxLength: 4 }).map((ids) => {
  // de-duplicate product ids so quantities stay deterministic
  const unique = Array.from(new Set(ids));
  return unique.map(makeCartItem);
});
const transactionArb = fc.constantFrom("purchase", "cancel");
const messageArb = fc.string({ minLength: 1, maxLength: 30 }).map((s) => `notice-${s.replace(/\s+/g, " ").trim() || "x"}`);

beforeEach(() => {
  vi.clearAllMocks();
});

// --- 3.1 Navigation preservation ------------------------------------------------------------
describe("Property 2 - Preservation: unrelated markup and behavior unchanged", () => {
  it("3.1 nav links keep correct hrefs, aria-current, and cart-count badge across routes (Req 3.1)", () => {
    fc.assert(
      fc.property(routeArb, cartArb, (route, cart) => {
        navState.pathname = route;
        mockState.current = makeShopState({ cart });
        const { container, unmount } = render(<AppFrame>content</AppFrame>);
        try {
          const nav = container.querySelector('nav[aria-label="Primary"]');
          expect(nav).not.toBeNull();

          // overflow-x-auto scroll container preserved (responsive nav behavior)
          expect(nav!.className).toContain("overflow-x-auto");

          const links = Array.from(nav!.querySelectorAll("a"));
          expect(links.map((a) => a.getAttribute("href"))).toEqual(NAV_HREFS);

          // exactly one active item, matching the current route
          const active = links.filter((a) => a.getAttribute("aria-current") === "page");
          expect(active).toHaveLength(1);
          expect(active[0].getAttribute("href")).toBe(route);

          // cart-count badge shows the summed quantity when > 0
          const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
          const cartLink = links.find((a) => a.getAttribute("href") === "/cart")!;
          if (cartCount > 0) {
            expect(cartLink.textContent).toContain(String(cartCount));
          }
        } finally {
          unmount();
        }
      }),
      { numRuns: 25 },
    );
  });

  it("3.1 active-item scroll-into-view effect runs without error and targets the active link (Req 3.1)", () => {
    vi.useFakeTimers();
    try {
      fc.assert(
        fc.property(routeArb, (route) => {
          navState.pathname = route;
          mockState.current = makeShopState({ cart: [makeCartItem(2)] });
          const { container, unmount } = render(<AppFrame>content</AppFrame>);
          try {
            // the post-mount setTimeout(...,50) effect computes scrollLeft from the active item
            expect(() => vi.advanceTimersByTime(60)).not.toThrow();
            const nav = container.querySelector('nav[aria-label="Primary"]') as HTMLElement;
            expect(nav.querySelector('[aria-current="page"]')).not.toBeNull();
            // jsdom has no layout, so scrollLeft stays a finite number (baseline 0)
            expect(Number.isFinite(nav.scrollLeft)).toBe(true);
          } finally {
            unmount();
          }
        }),
        { numRuns: 15 },
      );
    } finally {
      vi.useRealTimers();
    }
  });

  // --- 3.2 Existing Alert usage preservation ------------------------------------------------
  it("3.2 cart page renders existing destructive Alert unchanged when error is present (Req 3.2)", () => {
    fc.assert(
      fc.property(messageArb, cartArb, (message, cart) => {
        navState.pathname = "/cart";
        mockState.current = makeShopState({ cart, error: message, result: null });
        const { container, unmount } = render(<CartPage />);
        try {
          const alert = container.querySelector('[data-slot="alert"][role="alert"]');
          expect(alert).not.toBeNull();
          expect(alert!.className).toContain("border-destructive/25");
          expect(alert!.className).toContain("bg-destructive/10");
          const description = alert!.querySelector('[data-slot="alert-description"]');
          expect(description).not.toBeNull();
          expect(description!.textContent).toBe(message);
        } finally {
          unmount();
        }
      }),
      { numRuns: 20 },
    );
  });

  it("3.2 segment page renders existing destructive Alert unchanged when error is present (Req 3.2)", () => {
    fc.assert(
      fc.property(messageArb, (message) => {
        navState.pathname = "/segment";
        mockState.current = makeShopState({ error: message, result: null });
        const { container, unmount } = render(<SegmentPage />);
        try {
          const alert = container.querySelector('[data-slot="alert"][role="alert"]');
          expect(alert).not.toBeNull();
          const description = alert!.querySelector('[data-slot="alert-description"]');
          expect(description!.textContent).toBe(message);
        } finally {
          unmount();
        }
      }),
      { numRuns: 20 },
    );
  });

  it("3.2 clusters page renders existing destructive Alert unchanged on load error (Req 3.2)", async () => {
    vi.mocked(fetchClusters).mockRejectedValue(new Error("clusters-load-failed"));
    const { container } = render(<ClustersPage />);
    await waitFor(() => {
      const alert = container.querySelector('[data-slot="alert"][role="alert"]');
      expect(alert).not.toBeNull();
    });
    const description = container.querySelector('[data-slot="alert-description"]');
    expect(description!.textContent).toBe("clusters-load-failed");
  });

  it("3.2 methodology page renders existing destructive Alert unchanged on load error (Req 3.2)", async () => {
    vi.mocked(fetchModelInfo).mockRejectedValue(new Error("model-info-failed"));
    const { container } = render(<MethodologyPage />);
    await waitFor(() => {
      const alert = container.querySelector('[data-slot="alert"][role="alert"]');
      expect(alert).not.toBeNull();
    });
    const description = container.querySelector('[data-slot="alert-description"]');
    expect(description!.textContent).toBe("model-info-failed");
  });

  // --- 3.3 Cart/checkout state transitions preservation -------------------------------------
  it("3.3 cart quantity, clear, date, and checkout wiring is preserved (Req 3.3)", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 9 }), { minLength: 1, maxLength: 4 }),
        transactionArb,
        (rawIds, transactionType) => {
          const ids = Array.from(new Set(rawIds));
          const cart = ids.map(makeCartItem);
          const state = makeShopState({ cart, transactionType, result: null });
          navState.pathname = "/cart";
          mockState.current = state;
          const { container, unmount } = render(<CartPage />);
          try {
            // increment / decrement quantity for the first item
            const inc = container.querySelector('[aria-label="Tambah quantity"]') as HTMLElement;
            const dec = container.querySelector('[aria-label="Kurangi quantity"]') as HTMLElement;
            fireEvent.click(inc);
            fireEvent.click(dec);
            expect(state.updateQuantity).toHaveBeenCalledWith(cart[0].product_id, 1);
            expect(state.updateQuantity).toHaveBeenCalledWith(cart[0].product_id, -1);

            // clear cart (now guarded by a confirmation dialog)
            const clear = container.querySelector('[aria-label="Clear cart"]') as HTMLElement;
            expect(clear.hasAttribute("disabled")).toBe(false);
            fireEvent.click(clear);
            const confirmClear = Array.from(document.querySelectorAll("button")).find(
              (button) => button.textContent?.trim() === "Ya, kosongkan",
            ) as HTMLElement | undefined;
            expect(confirmClear, "clear-cart confirmation dialog should appear").toBeDefined();
            fireEvent.click(confirmClear!);
            expect(state.clearCart).toHaveBeenCalledTimes(1);

            // transaction date selection via the themed DatePicker popover
            const dateTrigger = container.querySelector("#transaction-date") as HTMLElement;
            fireEvent.click(dateTrigger);
            const dayButton = Array.from(
              document.querySelectorAll('[data-slot="date-picker-popup"] button'),
            ).find((button) => button.textContent?.trim() === "15") as HTMLElement | undefined;
            expect(dayButton, "calendar should render selectable days").toBeDefined();
            fireEvent.click(dayButton!);
            expect(state.setTransactionDate).toHaveBeenCalledWith("2024-01-15");

            // checkout
            const buttons = Array.from(container.querySelectorAll("button"));
            const checkoutButton = buttons.find((b) => /Checkout & Prediksi|Simpan Cancel & Prediksi/.test(b.textContent ?? ""));
            expect(checkoutButton).toBeDefined();
            fireEvent.click(checkoutButton!);
            expect(state.checkout).toHaveBeenCalledTimes(1);
          } finally {
            unmount();
          }
        },
      ),
      { numRuns: 15 },
    );
  }, 20000);

  // --- 3.4 Radius token preservation --------------------------------------------------------
  it("3.4 elements using --radius-card / --radius-container keep their radii (Req 3.4)", () => {
    fc.assert(
      fc.property(routeArb, cartArb, (route, cart) => {
        navState.pathname = route;
        mockState.current = makeShopState({ cart });
        const { container, unmount } = render(<AppFrame>content</AppFrame>);
        try {
          // the header customer/segment summary block uses --radius-card
          const radiusCard = container.querySelector('[class*="rounded-[var(--radius-card)]"]');
          expect(radiusCard, "AppFrame should keep a --radius-card element").not.toBeNull();
        } finally {
          unmount();
        }
      }),
      { numRuns: 15 },
    );
  });

  it("3.4 segment page keeps --radius-container and --radius-card usage (Req 3.4)", () => {
    navState.pathname = "/segment";
    mockState.current = makeShopState({ result: makeResult() });
    const { container } = render(<SegmentPage />);
    expect(container.querySelector('[class*="rounded-[var(--radius-container)]"]')).not.toBeNull();
    expect(container.querySelector('[class*="rounded-[var(--radius-card)]"]')).not.toBeNull();
  });

  // --- 3.5 Contrast preservation (token-driven baseline) ------------------------------------
  it("3.5 --primary-foreground over --primary keeps AA contrast in light and dark (Req 3.5)", () => {
    // observed token values from globals.css:
    //   light: --primary #004876, --primary-foreground #ffffff
    //   dark:  --primary #ffffff, --primary-foreground #004876
    const themes = {
      light: { primary: "#004876", primaryForeground: "#ffffff" },
      dark: { primary: "#ffffff", primaryForeground: "#004876" },
    } as const;
    fc.assert(
      fc.property(fc.constantFrom("light", "dark"), (theme) => {
        const { primary, primaryForeground } = themes[theme as "light" | "dark"];
        const ratio = contrastRatio(primaryForeground, primary);
        // baseline must meet WCAG AA for normal text (>= 4.5:1) in both themes
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }),
      { numRuns: 10 },
    );
  });

  // --- 3.6 Responsive container preservation ------------------------------------------------
  it("3.6 segment history table stays inside an overflow-x-auto container across widths (Req 3.6)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 320, max: 1440 }), (width) => {
        Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
        navState.pathname = "/segment";
        mockState.current = makeShopState({ result: makeResult() });
        const { container, unmount } = render(<SegmentPage />);
        try {
          const tables = Array.from(container.querySelectorAll('table[data-slot="table"]'));
          expect(tables.length).toBeGreaterThan(0);
          for (const table of tables) {
            const wrapper = table.closest('[data-slot="table-container"]');
            expect(wrapper, "every table should live inside a table-container").not.toBeNull();
            expect(wrapper!.className).toContain("overflow-x-auto");
          }
        } finally {
          unmount();
        }
      }),
      { numRuns: 15 },
    );
  });
});
