"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  CartItem,
  CheckoutResponse,
  Product,
  TransactionType,
  checkout as checkoutRequest,
  createSession,
  fetchProducts,
  getCurrentSegment,
  resetSession,
} from "@/lib/api";

type ShopState = {
  customerId: string | null;
  products: Product[];
  cart: CartItem[];
  result: CheckoutResponse | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  total: number;
  simulationMode: string;
  transactionType: TransactionType;
  transactionDate: string;
  setSimulationMode: (mode: string) => void;
  setTransactionType: (type: TransactionType) => void;
  setTransactionDate: (date: string) => void;
  searchProducts: (query: string) => Promise<void>;
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  checkout: () => Promise<void>;
  startNewCustomer: () => Promise<void>;
  refreshSegment: () => Promise<void>;
};

const ShopContext = createContext<ShopState | null>(null);
const CUSTOMER_KEY = "segment-shop-customer";
const CART_KEY = "segment-shop-cart";
const RESULT_KEY = "segment-shop-result";

function todayInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [result, setResult] = useState<CheckoutResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationMode, setSimulationMode] = useState("first_time");
  const [transactionType, setTransactionType] = useState<TransactionType>("purchase");
  const [transactionDate, setTransactionDate] = useState(todayInputValue);

  useEffect(() => {
    let active = true;
    async function boot() {
      setLoading(true);
      setError(null);
      try {
        const storedCustomer = window.localStorage.getItem(CUSTOMER_KEY);
        const storedCart = readJson<CartItem[]>(CART_KEY, []);
        const storedResult = readJson<CheckoutResponse | null>(RESULT_KEY, null);
        const productResponse = await fetchProducts();

        if (!active) return;
        setProducts(productResponse.products);
        setCart(storedCart);
        setResult(storedResult);

        if (storedCustomer) {
          setCustomerId(storedCustomer);
          try {
            const segment = await getCurrentSegment(storedCustomer);
            if (active) {
              setResult(segment);
              window.localStorage.setItem(RESULT_KEY, JSON.stringify(segment));
            }
          } catch {
            // Backend sessions are in-memory; keep the cached result as the last known snapshot.
          }
        } else {
          const session = await createSession();
          if (active) {
            setCustomerId(session.customer_id);
            window.localStorage.setItem(CUSTOMER_KEY, session.customer_id);
          }
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Gagal memuat aplikasi.");
      } finally {
        if (active) setLoading(false);
      }
    }
    boot();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loading) window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, loading]);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0), [cart]);

  const searchProducts = useCallback(async (query: string) => {
    try {
      const response = await fetchProducts(query);
      setProducts(response.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mencari produk.");
    }
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.product_id === product.product_id);
      if (existing) {
        return current.map((item) =>
          item.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) => (item.product_id === productId ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const checkout = useCallback(async () => {
    if (!cart.length) return;
    setBusy(true);
    setError(null);
    try {
      const response = await checkoutRequest(customerId, cart, simulationMode, transactionType, transactionDate);
      setCustomerId(response.customer_id);
      setResult(response);
      setCart([]);
      setTransactionType("purchase");
      setTransactionDate(todayInputValue());
      window.localStorage.setItem(CUSTOMER_KEY, response.customer_id);
      window.localStorage.setItem(RESULT_KEY, JSON.stringify(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout gagal.");
    } finally {
      setBusy(false);
    }
  }, [cart, customerId, simulationMode, transactionDate, transactionType]);

  const startNewCustomer = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const session = await resetSession(customerId ?? undefined);
      setCustomerId(session.customer_id);
      setCart([]);
      setResult(null);
      setSimulationMode("first_time");
      setTransactionType("purchase");
      setTransactionDate(todayInputValue());
      window.localStorage.setItem(CUSTOMER_KEY, session.customer_id);
      window.localStorage.removeItem(CART_KEY);
      window.localStorage.removeItem(RESULT_KEY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset customer gagal.");
    } finally {
      setBusy(false);
    }
  }, [customerId]);

  const refreshSegment = useCallback(async () => {
    if (!customerId) return;
    setBusy(true);
    setError(null);
    try {
      const response = await getCurrentSegment(customerId);
      setResult(response);
      window.localStorage.setItem(RESULT_KEY, JSON.stringify(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Belum ada histori pembelian untuk customer ini.");
    } finally {
      setBusy(false);
    }
  }, [customerId]);

  return (
    <ShopContext.Provider
      value={{
        customerId,
        products,
        cart,
        result,
        loading,
        busy,
        error,
        total,
        simulationMode,
        transactionType,
        transactionDate,
        setSimulationMode,
        setTransactionType,
        setTransactionDate,
        searchProducts,
        addToCart,
        updateQuantity,
        clearCart: () => setCart([]),
        checkout,
        startNewCustomer,
        refreshSegment,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used inside ShopProvider");
  }
  return context;
}
