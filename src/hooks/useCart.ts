"use client";

import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { cartService } from "@services/cart.service";
import { Cart, AddCartRequest, UpdateCartRequest, AddCartItem } from "@src/types/cart.type";
import { toast } from "react-hot-toast";

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
  updateCartItemSilent: (cartId: number, productId: number, quantity: number) => Promise<void>;
  removeItemFromCart: (productId: number) => Promise<void>;
  removeItemFromCartSilent: (productId: number) => Promise<void>;
  removeFromCart: (cartId: number) => Promise<void>;
  calculateTotal: () => number;
  clearCart: () => void;
  handleQuantityChange: (productId: number, quantity: number) => Promise<void>;
  handleRemoveItem: (productId: number) => Promise<void>;
  handleClearCart: () => Promise<void>;
  handleCheckout: () => void;
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
        setCart(null); // Đảm bảo cart được set về null khi không có giỏ hàng
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
        const cartItem: AddCartItem = {
          id: productId,
          quantity,
        };

        // Nếu chưa có giỏ hàng, tạo giỏ hàng mới
        const addRequest: AddCartRequest = {
          userId: user.id,
          products: [cartItem],
        };

        const newCart = await cartService.addNewCart(addRequest);

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
    [isAuthenticated, user],
  );

  /**
   * Xóa một sản phẩm cụ thể khỏi giỏ hàng
   * @param productId - ID của sản phẩm cần xóa
   */
  const removeItemFromCart = useCallback(
    async (productId: number): Promise<void> => {
      if (!cart) {
        setError("Không tìm thấy giỏ hàng");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Lọc bỏ sản phẩm cần xóa
        const updatedProducts = cart.products.filter((item) => item.id !== productId);

        if (updatedProducts.length === 0) {
          // Nếu không còn sản phẩm nào, xóa toàn bộ giỏ hàng
          await cartService.deleteCart(cart.id);
          setCart(null);
        } else {
          // Nếu còn sản phẩm, cập nhật giỏ hàng
          const updateRequest: UpdateCartRequest = {
            merge: false, // Thay thế hoàn toàn danh sách sản phẩm
            products: updatedProducts,
          };

          const updatedCart = await cartService.updateCart(cart.id, updateRequest);
          setCart(updatedCart);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Lỗi khi xóa sản phẩm khỏi giỏ hàng";
        setError(errorMessage);
        console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cart],
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
   * Cập nhật số lượng sản phẩm trong giỏ hàng (không gây loading)
   * @param cartId - ID của giỏ hàng
   * @param productId - ID của sản phẩm cần cập nhật
   * @param quantity - Số lượng mới
   */
  const updateCartItemSilent = useCallback(
    async (cartId: number, productId: number, quantity: number): Promise<void> => {
      if (!cart) return;

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
        console.error("Lỗi khi cập nhật giỏ hàng:", err);
        throw err;
      }
    },
    [cart],
  );

  /**
   * Xóa một sản phẩm cụ thể khỏi giỏ hàng (không gây loading)
   * @param productId - ID của sản phẩm cần xóa
   */
  const removeItemFromCartSilent = useCallback(
    async (productId: number): Promise<void> => {
      if (!cart) return;

      try {
        // Lọc bỏ sản phẩm cần xóa
        const updatedProducts = cart.products.filter((item) => item.id !== productId);

        if (updatedProducts.length === 0) {
          // Nếu không còn sản phẩm nào, xóa toàn bộ giỏ hàng
          await cartService.deleteCart(cart.id);
          setCart(null);
        } else {
          // Nếu còn sản phẩm, cập nhật giỏ hàng
          const updateRequest: UpdateCartRequest = {
            merge: false, // Thay thế hoàn toàn danh sách sản phẩm
            products: updatedProducts,
          };

          const updatedCart = await cartService.updateCart(cart.id, updateRequest);
          setCart(updatedCart);
        }
      } catch (err) {
        console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", err);
        throw err;
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
   * Tính tổng giá trị giỏ hàng
   * @returns Tổng giá trị của tất cả sản phẩm trong giỏ hàng
   */
  const calculateTotal = useCallback((): number => {
    if (!cart || !cart.products) return 0;

    // Sử dụng total từ API nếu có, nếu không thì tính toán từ products
    return cart.total || 0;
  }, [cart]);

  /**
   * Xóa trạng thái giỏ hàng (không gọi API)
   */
  const clearCart = useCallback((): void => {
    setCart(null);
    setError(null);
  }, []);

  /**
   * Xử lý khi thay đổi số lượng sản phẩm với toast notification
   * @param productId - ID của sản phẩm
   * @param quantity - Số lượng mới
   */
  const handleQuantityChange = useCallback(
    async (productId: number, quantity: number): Promise<void> => {
      if (!cart) return;

      // Tối ưu hóa: Cập nhật UI ngay lập tức trước khi gọi API
      const updatedProducts = cart.products.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      );

      // Tính toán lại các giá trị total
      const calculateTotal = (products: Cart["products"]) =>
        products.reduce((sum, item) => sum + (item.total || 0), 0);
      const calculateDiscountedTotal = (products: Cart["products"]) =>
        products.reduce((sum, item) => sum + (item.discountedTotal || 0), 0);

      const updatedCart = {
        ...cart,
        products: updatedProducts,
        // Tính lại total dựa trên products đã cập nhật
        total: calculateTotal(updatedProducts),
        discountedTotal: calculateDiscountedTotal(updatedProducts),
      };

      // Cập nhật state ngay lập tức để UI không bị render lại
      setCart(updatedCart);

      try {
        // Gọi API để cập nhật trên server (sử dụng hàm silent để không gây loading)
        await updateCartItemSilent(cart.id, productId, quantity);
        // Import toast động để tránh lỗi trên server side
        toast.success("Đã cập nhật số lượng sản phẩm");
      } catch (error) {
        // Nếu có lỗi, khôi phục lại state ban đầu
        setCart(cart);
        toast.error("Lỗi khi cập nhật số lượng");
        console.error("Lỗi khi cập nhật số lượng:", error);
      }
    },
    [cart, updateCartItemSilent],
  );

  /**
   * Xử lý khi xóa sản phẩm khỏi giỏ hàng với toast notification
   * @param productId - ID của sản phẩm cần xóa
   */
  const handleRemoveItem = useCallback(
    async (productId: number): Promise<void> => {
      if (!cart) return;

      // Tối ưu hóa: Cập nhật UI ngay lập tức trước khi gọi API
      const updatedProducts = cart.products.filter((item) => item.id !== productId);

      let updatedCart;
      if (updatedProducts.length === 0) {
        // Nếu không còn sản phẩm nào, set cart về null
        updatedCart = null;
      } else {
        // Nếu còn sản phẩm, tính toán lại các giá trị total
        const calculateTotal = (products: Cart["products"]) =>
          products.reduce((sum, item) => sum + (item.total || 0), 0);
        const calculateDiscountedTotal = (products: Cart["products"]) =>
          products.reduce((sum, item) => sum + (item.discountedTotal || 0), 0);

        updatedCart = {
          ...cart,
          products: updatedProducts,
          total: calculateTotal(updatedProducts),
          discountedTotal: calculateDiscountedTotal(updatedProducts),
        };
      }

      // Cập nhật state ngay lập tức để UI không bị render lại
      setCart(updatedCart);

      try {
        // Gọi API để cập nhật trên server (sử dụng hàm silent để không gây loading)
        await removeItemFromCartSilent(productId);
        // Import toast động để tránh lỗi trên server side
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
      } catch (error) {
        // Nếu có lỗi, khôi phục lại state ban đầu
        setCart(cart);
        toast.error("Lỗi khi xóa sản phẩm");
        console.error("Lỗi khi xóa sản phẩm:", error);
      }
    },
    [cart, removeItemFromCartSilent],
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
        await removeFromCart(cart.id);
        toast.success("Đã xóa toàn bộ giỏ hàng");
      } catch (error) {
        toast.error("Lỗi khi xóa giỏ hàng");
        console.error("Lỗi khi xóa giỏ hàng:", error);
      }
    }
  }, [cart, removeFromCart]);

  /**
   * Xử lý khi tiến hành thanh toán
   */
  const handleCheckout = useCallback(async (): Promise<void> => {
    toast.success("Chức năng thanh toán sẽ được triển khai sau!");
  }, []);

  return {
    cart,
    carts,
    isLoading,
    error,
    fetchUserCart,
    addToCart,
    updateCartItem,
    updateCartItemSilent,
    removeItemFromCart,
    removeItemFromCartSilent,
    removeFromCart,
    calculateTotal,
    clearCart,
    handleQuantityChange,
    handleRemoveItem,
    handleClearCart,
    handleCheckout,
  };
}
