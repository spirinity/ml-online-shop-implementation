/**
 * Bug Condition Exploration Test (Property 1)
 *
 * Encodes the EXPECTED (post-fix) design-system-consistent rendering behavior
 * described by `expectedBehavior` / Property 1 in design.md.
 *
 * IMPORTANT: This test is expected to FAIL on the UNFIXED code. Each failure is a
 * counterexample that confirms a defect described by `isBugCondition` exists. It
 * will pass once the fixes in task 3 are applied.
 *
 * Scoped property-based approach: the defects are deterministic structural issues,
 * so the properties are scoped to the concrete affected elements (navbar pill
 * container, catalog error, cart header, button radius base, on-primary text) and
 * asserted across randomized shop/render states generated with fast-check.
 *
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
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

// Components under test (default exports)
import { AppFrame } from "@/components/app-frame";
import CatalogPage from "@/app/page";
import CartPage from "@/app/cart/page";
import { buttonVariants } from "@/components/ui/button";

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

const nonEmptyText = fc
  .string({ minLength: 1, maxLength: 40 })
  .map((s) => `err-${s.replace(/\s+/g, " ").trim() || "x"}`);

const cartArb = fc.array(fc.integer({ min: 1, max: 9 }), { maxLength: 4 }).map((ids) => ids.map(makeCartItem));

const routeArb = fc.constantFrom("/", "/cart", "/segment", "/clusters", "/methodology");

const transactionArb = fc.constantFrom("purchase", "cancel");

// --- 1.1 Navbar pill container must NOT be stretched with flex-1 -----------------------------
describe("Property 1 - Bug Condition: design-system-consistent rendering", () => {
  it("1.1 primary nav pill container does NOT use flex-1 (Req 2.1)", () => {
    fc.assert(
      fc.property(routeArb, cartArb, (route, cart) => {
        navState.pathname = route;
        mockState.current = makeShopState({ cart });
        const { container, unmount } = render(<AppFrame>content</AppFrame>);
        try {
          const nav = container.querySelector('nav[aria-label="Primary"]');
          expect(nav).not.toBeNull();
          expect(nav!.className).not.toContain("flex-1");
        } finally {
          unmount();
        }
      }),
      { numRuns: 25 },
    );
  });

  // --- 1.2 Catalog error must render via shadcn Alert (role="alert" / data-slot="alert") ------
  it("1.2 catalog error renders via shadcn Alert, not a hand-styled div (Req 2.2)", () => {
    fc.assert(
      fc.property(nonEmptyText, (message) => {
        navState.pathname = "/";
        mockState.current = makeShopState({ error: message, loading: false });
        const { container, unmount } = render(<CatalogPage />);
        try {
          const alert = container.querySelector('[role="alert"], [data-slot="alert"]');
          expect(alert, "catalog error should render inside a shadcn Alert").not.toBeNull();
          // and the message should live in an alert-description slot
          const description = container.querySelector('[data-slot="alert-description"]');
          expect(description, "catalog error should use AlertDescription").not.toBeNull();
          expect(alert!.textContent).toContain(message);
        } finally {
          unmount();
        }
      }),
      { numRuns: 25 },
    );
  });

  // --- 1.3 Cart "Cart items" header uses grid + CardAction, not flex-row/justify-between -------
  it("1.3 cart items header uses CardHeader grid with Clear-cart in card-action slot (Req 2.3)", () => {
    fc.assert(
      fc.property(cartArb, (cart) => {
        navState.pathname = "/cart";
        mockState.current = makeShopState({ cart, result: null });
        const { container, unmount } = render(<CartPage />);
        try {
          const headers = Array.from(container.querySelectorAll('[data-slot="card-header"]'));
          const cartHeader = headers.find((h) => h.textContent?.includes("Cart items"));
          expect(cartHeader, "should find the 'Cart items' CardHeader").toBeDefined();

          // Post-fix: header must not rely on the inert flex classes on a grid CardHeader
          expect(cartHeader!.className).not.toContain("flex-row");
          expect(cartHeader!.className).not.toContain("justify-between");

          // Post-fix: the Clear-cart button lives inside a CardAction slot
          const action = cartHeader!.querySelector('[data-slot="card-action"]');
          expect(action, "Clear-cart button should be inside a card-action slot").not.toBeNull();
          const clearButton = action!.querySelector('[aria-label="Clear cart"]');
          expect(clearButton, "card-action should contain the Clear cart button").not.toBeNull();
        } finally {
          unmount();
        }
      }),
      { numRuns: 25 },
    );
  });

  // --- 1.4 Button base radius must be bound to the --radius-button token -----------------------
  it("1.4 button base radius is bound to --radius-button, not an ad-hoc value (Req 2.4)", () => {
    // sizes that do not define their own radius, so the base radius is observable
    const variantArb = fc.constantFrom("default", "outline", "secondary", "ghost", "destructive", "link");
    const sizeArb = fc.constantFrom("default", "lg", "icon", "icon-lg");
    fc.assert(
      fc.property(variantArb, sizeArb, (variant, size) => {
        const classes = buttonVariants({
          variant: variant as never,
          size: size as never,
        });
        expect(classes, "button base radius should trace to --radius-button").toContain(
          "rounded-[var(--radius-button)]",
        );
        // and must not fall back to the ad-hoc rounded-md base
        expect(classes.split(/\s+/)).not.toContain("rounded-md");
      }),
      { numRuns: 24 },
    );
  });

  // --- 1.5a Active nav link must use --primary-foreground, not hardcoded text-white ------------
  it("1.5 active nav link uses --primary-foreground, not text-white (Req 2.5)", () => {
    fc.assert(
      fc.property(routeArb, (route) => {
        navState.pathname = route;
        mockState.current = makeShopState({ cart: [makeCartItem(2)] });
        const { container, unmount } = render(<AppFrame>content</AppFrame>);
        try {
          const activeLink = container.querySelector('nav[aria-label="Primary"] [aria-current="page"]');
          expect(activeLink, "should find the active nav link").not.toBeNull();
          expect(activeLink!.className).not.toContain("text-white");
          expect(activeLink!.className).toContain("var(--primary-foreground)");
        } finally {
          unmount();
        }
      }),
      { numRuns: 25 },
    );
  });

  // --- 1.5b Active Tabs triggers must use --primary-foreground, not text-white -----------------
  it("1.5 cart Tabs triggers use --primary-foreground, not text-white (Req 2.5)", () => {
    fc.assert(
      fc.property(transactionArb, cartArb, (transactionType, cart) => {
        navState.pathname = "/cart";
        mockState.current = makeShopState({ cart, result: null, transactionType });
        const { container, unmount } = render(<CartPage />);
        try {
          const triggers = Array.from(container.querySelectorAll('[data-slot="tabs-trigger"]'));
          expect(triggers.length, "cart page should render Tabs triggers").toBeGreaterThan(0);
          for (const trigger of triggers) {
            expect(trigger.className).not.toContain("text-white");
            expect(trigger.className).toContain("var(--primary-foreground)");
          }
        } finally {
          unmount();
        }
      }),
      { numRuns: 25 },
    );
  });
});
