import { Product } from "./product.type";

/**
 * Interface cho một item trong giỏ hàng
 */
export interface CartItem {
  id: number; // ID của sản phẩm
  product: Product; // Thông tin chi tiết sản phẩm
  quantity: number; // Số lượng
  addedAt: string; // Thời gian thêm vào giỏ hàng (ISO string)
}

/**
 * Interface cho giỏ hàng của người dùng
 */
export interface Cart {
  id: number; // ID của giỏ hàng (từ API)
  userId: number; // ID của người dùng
  products: CartItem[]; // Danh sách sản phẩm trong giỏ hàng
  total: number; // Tổng giá trị giỏ hàng
  totalProducts: number; // Tổng số sản phẩm
  totalQuantity: number; // Tổng số lượng sản phẩm
  discountedTotal: number; // Tổng giá trị sau giảm giá
  createdAt: string; // Thời gian tạo giỏ hàng
  updatedAt: string; // Thời gian cập nhật giỏ hàng
}

/**
 * Interface cho response từ DummyJSON Cart API
 */
export interface CartResponse {
  id: number;
  userId: number;
  products: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
    total: number;
    discountPercentage: number;
    discountedTotal: number;
    thumbnail?: string;
  }>;
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface cho request thêm sản phẩm vào giỏ hàng
 */
export interface AddToCartRequest {
  userId: number;
  products: Array<{
    id: number;
    quantity: number;
  }>;
}

/**
 * Interface cho response khi thêm sản phẩm vào giỏ hàng
 */
export interface AddToCartResponse {
  id: number;
  products: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
    total: number;
    discountPercentage: number;
    discountedTotal: number;
    thumbnail?: string;
  }>;
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
  userId: number;
}

/**
 * Interface cho request cập nhật giỏ hàng
 */
export interface UpdateCartRequest {
  merge?: boolean; // Có merge với giỏ hàng hiện tại hay không
  products: Array<{
    id: number;
    quantity: number;
  }>;
}

/**
 * Interface cho lỗi API
 */
export interface CartApiError {
  message: string;
  status?: number;
}

/**
 * Interface cho local storage cart state
 */
export interface LocalCartState {
  items: CartItem[];
  total: number;
  totalQuantity: number;
  updatedAt: string;
}

/**
 * Interface cho Cart Store state
 */
export interface CartState {
  // State
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userId: number | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuth: (isAuthenticated: boolean, userId?: number) => void;

  // Cart operations
  initializeCart: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;

  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: number) => boolean;
  getItemQuantity: (productId: number) => number;
}
