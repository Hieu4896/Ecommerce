import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Cart } from "@src/types/cart.type";
import { Product } from "@src/types/product.type";
import {
  createCartItem,
  updateCartItemQuantity,
  findCartItemIndex,
  createCartFromItems,
  updateCartWithItems,
} from "@utils/cart.util";
import { checkAuthentication } from "@src/utils/auth.util";

/**
 * Interface cho state của giỏ hàng
 */
interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Interface cho actions của giỏ hàng
 */
interface CartActions {
  // Thiết lập giỏ hàng
  setCart: (cart: Cart | null) => void;
  // Thêm sản phẩm vào giỏ hàng
  addToCart: (product: Product, quantity: number) => void;
  // Cập nhật số lượng sản phẩm
  updateQuantity: (productId: number, quantity: number) => void;
  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: (productId: number) => void;
  // Xóa toàn bộ giỏ hàng
  clearCart: () => void;
  // Thiết lập loading state
  setLoading: (isLoading: boolean) => void;
  // Thiết lập error state
  setError: (error: string | null) => void;
}

/**
 * Type cho store của giỏ hàng
 */
type CartStore = CartState & CartActions;

/**
 * Tạo store cho giỏ hàng với Zustand và persist middleware
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // State
      cart: null,
      isLoading: false,
      error: null,

      // Actions
      setCart: (cart) => set({ cart }),

      addToCart: (product, quantity) => {
        // Kiểm tra authentication trước khi thực hiện thao tác
        try {
          checkAuthentication();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Lỗi xác thực" });
          return;
        }

        const { cart } = get();
        const newItem = createCartItem(product, quantity);

        if (cart) {
          // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
          const existingItemIndex = findCartItemIndex(cart.products, product.id);

          if (existingItemIndex >= 0) {
            // Nếu sản phẩm đã có, cập nhật số lượng
            const updatedProducts = [...cart.products];
            const existingItem = updatedProducts[existingItemIndex];
            const newQuantity = existingItem.quantity + quantity;

            updatedProducts[existingItemIndex] = updateCartItemQuantity(existingItem, newQuantity);

            const updatedCart = updateCartWithItems(cart, updatedProducts);
            set({ cart: updatedCart });
          } else {
            // Nếu sản phẩm chưa có, thêm mới
            const updatedProducts = [...cart.products, newItem];
            const updatedCart = updateCartWithItems(cart, updatedProducts);
            set({ cart: updatedCart });
          }
        } else {
          // Nếu chưa có giỏ hàng, tạo mới
          const newCart = createCartFromItems([newItem]);
          set({ cart: newCart });
        }
      },

      updateQuantity: (productId, quantity) => {
        // Kiểm tra authentication trước khi thực hiện thao tác
        try {
          checkAuthentication();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Lỗi xác thực" });
          return;
        }

        const { cart } = get();
        if (!cart) return;

        const updatedProducts = cart.products.map((item) =>
          item.id === productId ? updateCartItemQuantity(item, quantity) : item,
        );

        const updatedCart = updateCartWithItems(cart, updatedProducts);
        set({ cart: updatedCart });
      },

      removeFromCart: (productId) => {
        // Kiểm tra authentication trước khi thực hiện thao tác
        try {
          checkAuthentication();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Lỗi xác thực" });
          return;
        }

        const { cart } = get();
        if (!cart) return;

        const updatedProducts = cart.products.filter((item) => item.id !== productId);

        if (updatedProducts.length === 0) {
          set({ cart: null });
        } else {
          const updatedCart = updateCartWithItems(cart, updatedProducts);
          set({ cart: updatedCart });
        }
      },

      clearCart: () => {
        // Kiểm tra authentication trước khi thực hiện thao tác
        try {
          checkAuthentication();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Lỗi xác thực" });
          return;
        }

        set({ cart: null });
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
