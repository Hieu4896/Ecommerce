"use client";

import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { cartService } from "@services/cart.service";
import { Cart, CartItem, AddCartRequest, UpdateCartRequest } from "@src/types/cart.type";

/**
 * Interface cho trạng thái và functions của useCart hook
 */
export interface UseCartReturn {
  cart: Cart | null;
  carts: Cart[];
  isLoading: boolean;
  error: string | null;
  fetchUserCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (cartId: number, productId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartId: number) => Promise<void>;
  clearCart: () => void;
}

/**
 * Hook để quản lý giỏ hàng của người dùng
 * Cung cấp các functions để tương tác với giỏ hàng
 * @returns UseCartReturn - Trạng thái và functions của giỏ hàng
 */
export function useCart(): UseCartReturn {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [carts, setCarts] = useState<Cart[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /**
   * Lấy giỏ hàng của người dùng hiện tại
   */
  const fetchUserCart = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !user) {
      setCarts([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await cartService.getCartsByUser(user.id);

      // API trả về { carts: [...], total: 3, skip: 0, limit: 3 }
      // Lấy tất cả carts và sắp xếp theo ID giảm dần (mới nhất trước)
      if (response.carts && response.carts.length > 0) {
        const sortedCarts = response.carts.sort((a, b) => b.id - a.id);
        setCarts(sortedCarts);

        // Set cart hiện tại là cart mới nhất (để tương thích với UI hiện tại)
        const latestCart = sortedCarts[0];
        setCart(latestCart);
      } else {
        setCarts([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi khi lấy giỏ hàng";
      setError(errorMessage);
      console.error("Lỗi khi lấy giỏ hàng:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param productId - ID của sản phẩm cần thêm
   * @param quantity - Số lượng sản phẩm
   */
  const addToCart = useCallback(
    async (productId: number, quantity: number): Promise<void> => {
      if (!isAuthenticated || !user) {
        setError("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const cartItem: CartItem = {
          id: productId,
          quantity,
        };

        let newCart: Cart;

        if (cart) {
          // Nếu đã có giỏ hàng, cập nhật giỏ hàng hiện tại
          const existingItemIndex = cart.products.findIndex((item) => item.id === productId);

          let updatedProducts: CartItem[];

          if (existingItemIndex >= 0) {
            // Nếu sản phẩm đã tồn tại, cập nhật số lượng
            updatedProducts = cart.products.map((item, index) =>
              index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item,
            );
          } else {
            // Nếu sản phẩm chưa tồn tại, thêm mới
            updatedProducts = [...cart.products, cartItem];
          }

          const updateRequest: UpdateCartRequest = {
            merge: true, // Giữ lại các sản phẩm cũ
            products: updatedProducts,
          };

          newCart = await cartService.updateCart(cart.id, updateRequest);
        } else {
          // Nếu chưa có giỏ hàng, tạo giỏ hàng mới
          const addRequest: AddCartRequest = {
            userId: user.id,
            products: [cartItem],
          };

          newCart = await cartService.addNewCart(addRequest);
        }

        setCart(newCart);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi khi thêm vào giỏ hàng";
        setError(errorMessage);
        console.error("Lỗi khi thêm vào giỏ hàng:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, user, cart],
  );

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   * @param cartId - ID của giỏ hàng
   * @param productId - ID của sản phẩm cần cập nhật
   * @param quantity - Số lượng mới
   */
  const updateCartItem = useCallback(
    async (cartId: number, productId: number, quantity: number): Promise<void> => {
      if (!cart) {
        setError("Không tìm thấy giỏ hàng");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const updatedProducts = cart.products.map((item) =>
          item.id === productId ? { ...item, quantity } : item,
        );

        const updateRequest: UpdateCartRequest = {
          merge: true,
          products: updatedProducts,
        };

        const updatedCart = await cartService.updateCart(cartId, updateRequest);
        setCart(updatedCart);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi khi cập nhật giỏ hàng";
        setError(errorMessage);
        console.error("Lỗi khi cập nhật giỏ hàng:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cart],
  );

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * @param cartId - ID của giỏ hàng
   */
  const removeFromCart = useCallback(
    async (cartId: number): Promise<void> => {
      if (!cart) {
        setError("Không tìm thấy giỏ hàng");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await cartService.deleteCart(cartId);
        setCart(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi khi xóa giỏ hàng";
        setError(errorMessage);
        console.error("Lỗi khi xóa giỏ hàng:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cart],
  );

  /**
   * Xóa trạng thái giỏ hàng (không gọi API)
   */
  const clearCart = useCallback((): void => {
    setCart(null);
    setError(null);
  }, []);

  return {
    cart,
    carts,
    isLoading,
    error,
    fetchUserCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };
}
