import { getToken, clearAuth } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      clearAuth();
    }
    throw new ApiError(
      (data as { error?: string }).error ?? "Request failed",
      res.status
    );
  }

  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ user: import("./auth").AuthUser; token: string }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  logout: () =>
    request<{ message: string }>("/api/auth/logout", { method: "POST" }),

  me: () =>
    request<{ user: import("./auth").AuthUser }>("/api/auth/me"),

  getCategories: () =>
    request<
      Array<{
        id: string;
        name: string;
        description: string | null;
        _count: { products: number };
      }>
    >("/api/categories"),

  createCategory: (data: { name: string; description?: string }) =>
    request("/api/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCategory: (
    id: string,
    data: { name?: string; description?: string }
  ) =>
    request(`/api/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteCategory: (id: string) =>
    request(`/api/categories/${id}`, { method: "DELETE" }),

  getProducts: (params?: {
    search?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.categoryId) q.set("categoryId", params.categoryId);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<{
      data: Product[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/products${qs ? `?${qs}` : ""}`);
  },

  createProduct: (data: ProductInput) =>
    request<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateProduct: (id: string, data: Partial<ProductInput>) =>
    request<Product>(`/api/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteProduct: (id: string) =>
    request(`/api/products/${id}`, { method: "DELETE" }),

  stockIn: (data: StockInInput) =>
    request("/api/stock/in", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  stockOut: (data: StockOutInput) =>
    request("/api/stock/out", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getInventoryMovements: (params?: {
    productId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.productId) q.set("productId", params.productId);
    if (params?.from) q.set("from", params.from);
    if (params?.to) q.set("to", params.to);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<{
      data: InventoryMovement[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/inventory/movements${qs ? `?${qs}` : ""}`);
  },

  // Dashboard
  getDashboardSummary: () => request<DashboardSummary>("/api/dashboard/summary"),

  // Low stock alerts
  getLowStockProducts: (limit?: number) =>
    request<LowStockResponse>(`/api/products/low-stock${limit ? `?limit=${limit}` : ""}`),

  // Export
  exportProductsCSV: () =>
    fetch(`${API_URL}/api/reports/products/export`, {
      headers: {
        Authorization: `Bearer ${getToken() ?? ""}`,
      },
    }).then((res) => {
      if (!res.ok) throw new Error("Export failed");
      return res.blob();
    }),

  exportMovementsCSV: (params?: { from?: string; to?: string }) => {
    const q = new URLSearchParams();
    if (params?.from) q.set("from", params.from);
    if (params?.to) q.set("to", params.to);
    const qs = q.toString();
    return fetch(`${API_URL}/api/reports/movements/export${qs ? `?${qs}` : ""}`, {
      headers: {
        Authorization: `Bearer ${getToken() ?? ""}`,
      },
    }).then((res) => {
      if (!res.ok) throw new Error("Export failed");
      return res.blob();
    });
  },

  // Activity Logs
  getActivityLogs: (params?: {
    userId?: string;
    type?: string;
    entityType?: string;
    page?: number;
    limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.userId) q.set("userId", params.userId);
    if (params?.type) q.set("type", params.type);
    if (params?.entityType) q.set("entityType", params.entityType);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<ActivityLogsResponse>(`/api/activity-logs${qs ? `?${qs}` : ""}`);
  },
};

export type Product = {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  categoryId: string;
  category: { id: string; name: string };
  stock: number;
  minimumStock: number;
  costPrice: string;
  sellingPrice: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  sku: string;
  barcode?: string | null;
  name: string;
  description?: string | null;
  categoryId: string;
  stock: number;
  minimumStock: number;
  costPrice: number;
  sellingPrice: number;
  imageUrl?: string | null;
};

export type StockInInput = {
  productId: string;
  quantity: number;
  supplier?: string | null;
  invoiceNumber?: string | null;
  note?: string | null;
};

export type StockOutInput = {
  productId: string;
  quantity: number;
  reason: "SALE" | "DAMAGE" | "INTERNAL";
  note?: string | null;
};

export type InventoryMovement = {
  id: string;
  productId: string;
  product: { id: string; sku: string; name: string };
  type: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT";
  quantity: number;
  beforeStock: number;
  afterStock: number;
  creator: { id: string; name: string; email: string };
  createdAt: string;
};

export type DashboardSummary = {
  overview: {
    totalProducts: number;
    totalCategories: number;
    lowStockItems: number;
    inventoryValue: number;
  };
  monthly: {
    stockIn: number;
    stockOut: number;
  };
  topProducts: Array<{
    productId: string;
    sku: string;
    name: string;
    totalQuantity: number;
  }>;
};

export type LowStockProduct = Product & { shortage: number };

export type LowStockResponse = {
  data: LowStockProduct[];
  count: number;
};

export type ActivityLog = {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string };
  type: "LOGIN" | "CREATE" | "UPDATE" | "DELETE" | "STOCK_IN" | "STOCK_OUT";
  entityType: string | null;
  entityId: string | null;
  description: string;
  metadata: string | null;
  ipAddress: string | null;
  createdAt: string;
};

export type ActivityLogsResponse = {
  data: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
