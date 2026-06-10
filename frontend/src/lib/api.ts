export type Product = {
  product_id: string;
  stock_code: string;
  description: string;
  unit_price: number;
  orders: number;
};

export type CartItem = Product & {
  quantity: number;
};

export type SessionSummary = {
  customer_id: string;
  transaction_rows: number;
  invoice_count: number;
  total_spend: number;
};

export type CheckoutResponse = {
  customer_id: string;
  invoice_no: string;
  summary: SessionSummary;
  checkout: {
    items: number;
    subtotal: number;
  };
  segment: {
    cluster: number;
    cluster_label: string;
    profile: string;
    strategy: string;
    proportion: number;
    dominant_features: string;
    pca: Record<string, number>;
  };
  features: Record<string, { label: string; value: number }>;
  history: Array<{
    invoice_no: string;
    stock_code: string;
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  note: string;
};

export type ClusterProfile = {
  cluster: number;
  cluster_label: string;
  profile: string;
  strategy: string;
  proportion: number;
  dominant_features: string;
  features: Record<string, { label: string; mean: number }>;
};

export type ModelInfo = {
  dataset: string;
  customers: number;
  products: number;
  pca_variance: number;
  inertia: number;
  clusters: number;
  method: string;
  validation_available: boolean;
  decision_tree_best_depth: number;
  decision_tree_test_accuracy: number;
  note: string;
};

export type ValidationMetrics = {
  purpose: string;
  target: string;
  features: string[];
  train_size: number;
  test_size: number;
  baseline: {
    model: string;
    train_accuracy: number;
    test_accuracy: number;
  };
  tuning: {
    cv: string;
    max_depth_range: string;
    best_max_depth: number;
    best_cv_accuracy: number;
    depth_scores: Array<{
      max_depth: number;
      mean_accuracy: number;
      std_accuracy: number;
    }>;
  };
  final: {
    model: string;
    train_accuracy: number;
    test_accuracy: number;
    feature_importance: Array<{
      feature: string;
      importance: number;
    }>;
    labels: string[];
    confusion_matrix: number[][];
    classification_report: Record<string, unknown>;
  };
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchProducts(query = "") {
  const params = new URLSearchParams({ limit: "72" });
  if (query) params.set("q", query);
  return request<{ products: Product[] }>(`/api/products?${params.toString()}`);
}

export async function createSession() {
  return request<{ customer_id: string; summary: SessionSummary }>("/api/session/new", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function resetSession(customerId?: string) {
  return request<{ customer_id: string; summary: SessionSummary }>("/api/session/reset", {
    method: "POST",
    body: JSON.stringify({ customer_id: customerId }),
  });
}

export async function checkout(customerId: string | null, items: CartItem[], simulationMode = "first_time") {
  return request<CheckoutResponse>("/api/checkout", {
    method: "POST",
    body: JSON.stringify({
      customer_id: customerId,
      simulation_mode: simulationMode,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    }),
  });
}

export async function getCurrentSegment(customerId: string) {
  return request<CheckoutResponse>(`/api/session/${encodeURIComponent(customerId)}/segment`);
}

export async function fetchClusters() {
  return request<{ clusters: ClusterProfile[] }>("/api/clusters");
}

export async function fetchModelInfo() {
  return request<ModelInfo>("/api/model-info");
}

export async function fetchValidation() {
  return request<ValidationMetrics>("/api/validation");
}
