"use client";

import { useCallback } from "react";
import { useCartStore } from "@src/store/cartStore";
import { UseCartReturn } from "@src/types/cart.type";
import { Product } from "@src/types/product.type";
import { toast } from "react-hot-toast";

/**
 * Hook để quản lý giỏ hàng của người dùng
 * Sử dụng Zustand store thay vì  API calls
 * @returns UseCartReturn - Trạng thái và functions của giỏ hàng
 */
export function useCart(): UseCartReturn {
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, setLoading, setError } =
    useCartStore();

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param product - Sản phẩm cần thêm
   * @param quantity - Số lượng sản phẩm
   */
  const handleAddToCart = useCallback(
    async (product: Product, quantity: number): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        // Sử dụng store action thay vì API call
        addToCart(product, quantity);
        toast.success("Đã thêm sản phẩm vào giỏ hàng");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi khi thêm vào giỏ hàng";
        setError(errorMessage);

        // Hiển thị toast cho lỗi authentication
        if (errorMessage.includes("Vui lòng đăng nhập")) {
          toast.error(errorMessage);
        }

        console.error("Lỗi khi thêm vào giỏ hàng:", err);
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
        toast.success("Đã cập nhật số lượng sản phẩm");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Lỗi khi cập nhật số lượng";

        // Hiển thị toast cho lỗi authentication
        if (errorMessage.includes("Vui lòng đăng nhập")) {
          toast.error(errorMessage);
        } else {
          toast.error("Lỗi khi cập nhật số lượng");
        }

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
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Lỗi khi xóa sản phẩm";

        // Hiển thị toast cho lỗi authentication
        if (errorMessage.includes("Vui lòng đăng nhập")) {
          toast.error(errorMessage);
        } else {
          toast.error("Lỗi khi xóa sản phẩm");
        }

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
        toast.success("Đã xóa toàn bộ giỏ hàng");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Lỗi khi xóa giỏ hàng";

        // Hiển thị toast cho lỗi authentication
        if (errorMessage.includes("Vui lòng đăng nhập")) {
          toast.error(errorMessage);
        } else {
          toast.error("Lỗi khi xóa giỏ hàng");
        }

        console.error("Lỗi khi xóa giỏ hàng:", error);
      }
    }
  }, [cart, clearCart]);

  /**
   * Xử lý khi tiến hành thanh toán
   */
  const handleCheckout = useCallback(async (): Promise<void> => {
    // Chuyển hướng đến trang thanh toán
    if (typeof window !== "undefined") {
      window.location.href = "/checkout";
    }
  }, []);

  return {
    cart,
    handleAddToCart,
    handleQuantityChange,
    handleRemoveItem,
    handleClearCart,
    handleCheckout,
  };
}
