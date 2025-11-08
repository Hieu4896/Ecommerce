import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Cart, CartItem } from "@src/types/cart.type";
import { Product } from "@src/types/product.type";

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
        const { cart } = get();

        // Tính toán giá sau khi giảm giá
        const discountPercentage = product.discountPercentage || 0;
        const discountedPrice = product.price * (1 - discountPercentage / 100);

        const newItem: CartItem = {
          id: product.id,
          title: product.title,
          price: product.price,
          quantity,
          total: product.price * quantity,
          discountPercentage,
          discountedTotal: discountedPrice * quantity,
          thumbnail: product.thumbnail || "/placeholder.jpg",
        };

        if (cart) {
          // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
          const existingItemIndex = cart.products.findIndex((item) => item.id === product.id);

          if (existingItemIndex >= 0) {
            // Nếu sản phẩm đã có, cập nhật số lượng
            const updatedProducts = [...cart.products];
            const existingItem = updatedProducts[existingItemIndex];
            const newQuantity = existingItem.quantity + quantity;
            const existingDiscountedPrice =
              existingItem.price * (1 - existingItem.discountPercentage / 100);

            updatedProducts[existingItemIndex] = {
              ...existingItem,
              quantity: newQuantity,
              total: existingItem.price * newQuantity,
              discountedTotal: existingDiscountedPrice * newQuantity,
            };

            const updatedCart = {
              ...cart,
              products: updatedProducts,
              total: updatedProducts.reduce((sum, item) => sum + item.total, 0),
              discountedTotal: updatedProducts.reduce((sum, item) => sum + item.discountedTotal, 0),
              totalQuantity: updatedProducts.reduce((sum, item) => sum + item.quantity, 0),
            };

            set({ cart: updatedCart });
          } else {
            // Nếu sản phẩm chưa có, thêm mới
            const updatedCart = {
              ...cart,
              products: [...cart.products, newItem],
              total: cart.total + newItem.total,
              discountedTotal: cart.discountedTotal + newItem.discountedTotal,
              totalProducts: cart.totalProducts + 1,
              totalQuantity: cart.totalQuantity + quantity,
            };

            set({ cart: updatedCart });
          }
        } else {
          // Nếu chưa có giỏ hàng, tạo mới
          const newCart: Cart = {
            id: 1,
            userId: 1,
            products: [newItem],
            total: newItem.total,
            discountedTotal: newItem.discountedTotal,
            totalProducts: 1,
            totalQuantity: quantity,
          };

          set({ cart: newCart });
        }
      },

      updateQuantity: (productId, quantity) => {
        const { cart } = get();
        if (!cart) return;

        const updatedProducts = cart.products.map((item) => {
          if (item.id === productId) {
            const discountedPrice = item.price * (1 - item.discountPercentage / 100);
            return {
              ...item,
              quantity,
              total: item.price * quantity,
              discountedTotal: discountedPrice * quantity,
            };
          }
          return item;
        });

        const updatedCart = {
          ...cart,
          products: updatedProducts,
          total: updatedProducts.reduce((sum, item) => sum + item.total, 0),
          discountedTotal: updatedProducts.reduce((sum, item) => sum + item.discountedTotal, 0),
          totalQuantity: updatedProducts.reduce((sum, item) => sum + item.quantity, 0),
        };

        set({ cart: updatedCart });
      },

      removeFromCart: (productId) => {
        const { cart } = get();
        if (!cart) return;

        const updatedProducts = cart.products.filter((item) => item.id !== productId);

        if (updatedProducts.length === 0) {
          set({ cart: null });
        } else {
          const updatedCart = {
            ...cart,
            products: updatedProducts,
            total: updatedProducts.reduce((sum, item) => sum + item.total, 0),
            discountedTotal: updatedProducts.reduce((sum, item) => sum + item.discountedTotal, 0),
            totalProducts: updatedProducts.length,
            totalQuantity: updatedProducts.reduce((sum, item) => sum + item.quantity, 0),
          };

          set({ cart: updatedCart });
        }
      },

      clearCart: () => set({ cart: null }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
