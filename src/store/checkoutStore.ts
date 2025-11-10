"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CheckoutState, OrderConfirmation, OrderSummary } from "@src/types/checkout.type";
import { checkoutService } from "@src/services/checkout.service";
import { useAuthStore } from "./authStore";
import { useCartStore } from "./cartStore";
import { useOrderStore } from "./orderStore";
import { createSecureStorage } from "@src/utils/storage.util";

/**
 * Interface cho actions của checkout store
 */
interface CheckoutActions {
  // Thiết lập order summary
  setOrderSummary: (orderSummary: OrderSummary | null) => void;
  // Thiết lập processing state
  setProcessing: (isProcessing: boolean) => void;
  // Thiết lập completed state
  setCompleted: (isCompleted: boolean) => void;
  // Thiết lập error state
  setError: (error: string | null) => void;
  // Reset checkout state
  resetCheckout: () => void;
  // Xử lý checkout
  processCheckout: () => Promise<OrderConfirmation>;
}

/**
 * Type cho store của checkout
 */
type CheckoutStore = CheckoutState & CheckoutActions;

/**
 * Tạo store cho checkout với Zustand và persist middleware
 */
export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      // State ban đầu
      orderSummary: null,
      isProcessing: false,
      isCompleted: false,
      error: null,

      // Actions
      setOrderSummary: (orderSummary) => set({ orderSummary }),

      setProcessing: (isProcessing) => set({ isProcessing }),

      setCompleted: (isCompleted) => set({ isCompleted }),

      setError: (error) => set({ error }),

      resetCheckout: () => {
        set({
          orderSummary: null,
          isProcessing: false,
          isCompleted: false,
          error: null,
        });
      },

      processCheckout: async (): Promise<OrderConfirmation> => {
        const { orderSummary } = get();
        // Kiểm tra order summary
        if (!orderSummary || !orderSummary.formData) {
          set({ error: "Thiếu thông tin thanh toán" });
          throw new Error("Thiếu thông tin thanh toán");
        }

        try {
          // Bắt đầu processing
          set({ isProcessing: true, error: null });

          // 1. Kiểm tra authentication
          const authStore = useAuthStore.getState();
          if (!authStore.isAuthenticated || !authStore.user) {
            throw new Error("Bạn cần đăng nhập để thực hiện thanh toán");
          }

          // 2. Validate payment info
          const paymentValidation = checkoutService.validatePaymentInfo(
            orderSummary.formData.paymentInfo,
          );
          if (!paymentValidation.isValid) {
            const errorMessage = Object.values(paymentValidation.errors).join(", ");
            throw new Error(`Thông tin thanh toán không hợp lệ: ${errorMessage}`);
          }

          // 3. Cập nhật user address
          try {
            const addressData = {
              address: {
                address: orderSummary.formData.shippingAddress.streetAddress,
                city: "Hà Nội", // Mặc định, có thể lấy từ form nếu cần
                state: "Hà Nội", // Mặc định, có thể lấy từ form nếu cần
                stateCode: "HN", // Mặc định, có thể lấy từ form nếu cần
                postalCode: orderSummary.formData.shippingAddress.postalCode,
                country: "Việt Nam", // Mặc định, có thể lấy từ form nếu cần
              },
              phone: orderSummary.formData.shippingAddress.phone,
              email: orderSummary.formData.shippingAddress.email,
            };

            const res = await checkoutService.updateUserAddress(authStore.user.id, addressData);
            console.log("processCheckout - res", res);
          } catch (error) {
            console.error("Lỗi khi cập nhật địa chỉ:", error);
            // Không throw error ở đây, vẫn tiếp tục quy trình
          }

          // 4. Xử lý order
          const orderConfirmation = await checkoutService.processOrder(
            orderSummary.formData.shippingAddress,
            orderSummary,
          );

          // 5. Lưu thông tin xác nhận đơn hàng vào orderStore
          const orderStore = useOrderStore.getState();
          orderStore.setOrderConfirmation(orderConfirmation);

          // 6. Clear cart
          const cartStore = useCartStore.getState();
          cartStore.clearCart();

          // 7. Set completion state
          set({
            isProcessing: false,
            isCompleted: true,
            error: null,
          });

          // 8. Return order confirmation
          console.log("Đơn hàng đã được xử lý thành công:", orderConfirmation);
          return orderConfirmation;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Lỗi không xác định khi xử lý thanh toán";
          set({
            isProcessing: false,
            isCompleted: false,
            error: errorMessage,
          });
          throw error;
        }
      },
    }),
    {
      name: "checkout-storage",
      storage: createJSONStorage(() => createSecureStorage()),
      // Chỉ persist các trường cần thiết
      partialize: (state) => ({
        orderSummary: state.orderSummary,
        isCompleted: state.isCompleted,
      }),
      // Xử lý khi hydrate state từ localStorage
      onRehydrateStorage: () => (state) => {
        // Reset processing và error khi hydrate
        if (state) {
          state.isProcessing = false;
          state.error = null;
        }
      },
    },
  ),
);
