/**
 * Interface cho một item trong giỏ hàng
 */
export interface CartItem {
  id: number; // ID của sản phẩm
  quantity: number; // Số lượng
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
  products: CartItem[];
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
