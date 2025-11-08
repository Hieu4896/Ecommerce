"use client";

import { useCallback } from "react";
import { useCartStore } from "@src/store/cartStore";
import { Cart } from "@src/types/cart.type";
import { Product } from "@src/types/product.type";

/**
 * Interface cho trạng thái và functions của useCart hook
 */
export interface UseCartReturn {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  fetchUserCart: () => Promise<void>;
  addToCart: (product: Product, quantity: number) => Promise<void>;
  // Các hàm xử lý với toast notification
  handleQuantityChange: (productId: number, quantity: number) => Promise<void>;
  handleRemoveItem: (productId: number) => Promise<void>;
  handleClearCart: () => Promise<void>;
  handleCheckout: () => void;
}

/**
 * Hook để quản lý giỏ hàng của người dùng
 * Sử dụng Zustand store thay vì  API calls
 * @returns UseCartReturn - Trạng thái và functions của giỏ hàng
 */
export function useCart(): UseCartReturn {
  const {
    cart,
    isLoading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setLoading,
    setError,
  } = useCartStore();

  /**
   * Lấy giỏ hàng của người dùng hiện tại (simulation)
   */
  const fetchUserCart = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi khi lấy giỏ hàng";
      setError(errorMessage);
      console.error("Lỗi khi lấy giỏ hàng:", err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param product - Sản phẩm cần thêm
   * @param quantity - Số lượng sản phẩm
   */
  const addToCartHook = useCallback(
    async (product: Product, quantity: number): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        // Sử dụng store action thay vì API call
        addToCart(product, quantity);

        // Import toast động để tránh lỗi trên server side
        const { toast } = await import("react-hot-toast");
        toast.success("Đã thêm sản phẩm vào giỏ hàng");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi khi thêm vào giỏ hàng";
        setError(errorMessage);
        console.error("Lỗi khi thêm vào giỏ hàng:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addToCart, setLoading, setError],
  );

  /**
   * Xử lý khi thay đổi số lượng sản phẩm với toast notification
   * @param productId - ID của sản phẩm
   * @param quantity - Số lượng mới
   */
  const handleQuantityChange = useCallback(
    async (productId: number, quantity: number): Promise<void> => {
      if (!cart) return;

      try {
        // Sử dụng store action thay vì API call
        updateQuantity(productId, quantity);

        // Import toast động để tránh lỗi trên server side
        const { toast } = await import("react-hot-toast");
        toast.success("Đã cập nhật số lượng sản phẩm");
      } catch (error) {
        const { toast } = await import("react-hot-toast");
        toast.error("Lỗi khi cập nhật số lượng");
        console.error("Lỗi khi cập nhật số lượng:", error);
      }
    },
    [cart, updateQuantity],
  );

  /**
   * Xử lý khi xóa sản phẩm khỏi giỏ hàng với toast notification
   * @param productId - ID của sản phẩm cần xóa
   */
  const handleRemoveItem = useCallback(
    async (productId: number): Promise<void> => {
      try {
        // Sử dụng store action thay vì API call
        removeFromCart(productId);

        // Import toast động để tránh lỗi trên server side
        const { toast } = await import("react-hot-toast");
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
      } catch (error) {
        const { toast } = await import("react-hot-toast");
        toast.error("Lỗi khi xóa sản phẩm");
        console.error("Lỗi khi xóa sản phẩm:", error);
      }
    },
    [removeFromCart],
  );

  /**
   * Xử lý khi xóa toàn bộ giỏ hàng với toast notification
   */
  const handleClearCart = useCallback(async (): Promise<void> => {
    if (!cart) return;

    if (
      typeof window !== "undefined" &&
      window.confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?")
    ) {
      try {
        // Sử dụng store action thay vì API call
        clearCart();

        // Import toast động để tránh lỗi trên server side
        const { toast } = await import("react-hot-toast");
        toast.success("Đã xóa toàn bộ giỏ hàng");
      } catch (error) {
        const { toast } = await import("react-hot-toast");
        toast.error("Lỗi khi xóa giỏ hàng");
        console.error("Lỗi khi xóa giỏ hàng:", error);
      }
    }
  }, [cart, clearCart]);

  /**
   * Xử lý khi tiến hành thanh toán
   */
  const handleCheckout = useCallback(async (): Promise<void> => {
    const { toast } = await import("react-hot-toast");
    toast.success("Chức năng thanh toán sẽ được triển khai sau!");
  }, []);

  return {
    cart,
    isLoading,
    error,
    fetchUserCart,
    addToCart: addToCartHook,
    handleQuantityChange,
    handleRemoveItem,
    handleClearCart,
    handleCheckout,
  };
}
