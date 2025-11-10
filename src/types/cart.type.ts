import { Product } from "./product.type";

/**
 * Interface cho một item trong giỏ hàng
 */
export interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedTotal: number;
  thumbnail: string;
}

/**
 * Interface cho giỏ hàng của người dùng
 */
export interface Cart {
  id: number; // ID của giỏ hàng (từ API)
  userId: number; // ID của người dùng
  products: CartItem[]; // Danh sách sản phẩm trong giỏ hàng
  total: number; // Tổng giá trị giỏ hàng
  discountedTotal: number; // Tổng giá trị sau giảm giá
  totalProducts: number; // Tổng số sản phẩm
  totalQuantity: number; // Tổng số lượng sản phẩm
}

export interface CartStore {
  cart: Cart | null;
  addNewCart: ({ userId, products }: { userId: number; products: CartItem[] }) => Promise<void>;
  updateCart: ({ cartId, products }: { cartId: number; products: CartItem[] }) => Promise<Response>;
  clearCart: () => void;
}

/**
 * Interface cho request thêm giỏ hàng mới
 */
export interface AddCartRequest {
  userId: number;
  products: AddCartItem[];
}

/**
 * Interface cho sản phẩm khi thêm vào giỏ hàng (chỉ cần các trường cơ bản)
 */
export interface AddCartItem {
  id: number;
  quantity: number;
}

/**
 * Interface cho request cập nhật giỏ hàng
 */
export interface UpdateCartRequest {
  merge?: boolean; // Có giữ lại sản phẩm cũ hay không
  products: CartItem[];
}

/**
 * Interface cho response sau khi xóa giỏ hàng
 */
export interface DeleteCartResponse {
  id: number;
  isDeleted: boolean;
  deletedOn: string;
}

/**
 * Interface cho trạng thái và functions của useCart hook
 */
export interface UseCartReturn {
  cart: Cart | null;
  isCartEmpty: () => boolean;
  handleAddToCart: (product: Product, quantity: number) => Promise<void>;
  handleQuantityChange: (productId: number, quantity: number) => Promise<void>;
  handleRemoveItem: (productId: number) => Promise<void>;
  handleClearCart: () => Promise<void>;
  handleCheckout: () => void;
}
