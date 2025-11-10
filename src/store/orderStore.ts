"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { OrderConfirmation } from "@src/types/checkout.type";
import { createSecureStorage } from "@src/utils/storage.util";

/**
 * Interface cho state của order store
 */
interface OrderState {
  orderConfirmation: OrderConfirmation | null;
  createdAt: number | null; // Timestamp khi tạo orderConfirmation
}

/**
 * Interface cho actions của order store
 */
interface OrderActions {
  // Thiết lập thông tin xác nhận đơn hàng
  setOrderConfirmation: (orderConfirmation: OrderConfirmation) => void;
  // Xóa thông tin xác nhận đơn hàng
  clearOrderConfirmation: () => void;
  // Kiểm tra xem order đã hết hạn chưa (15 phút)
  isOrderExpired: () => boolean;
}

/**
 * Type cho store của order
 */
type OrderStore = OrderState & OrderActions;

/**
 * Tạo store cho order với Zustand và persist middleware
 */
export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      // State ban đầu
      orderConfirmation: null,
      createdAt: null,

      // Actions
      setOrderConfirmation: (orderConfirmation) =>
        set({ orderConfirmation, createdAt: Date.now() }),

      clearOrderConfirmation: () => set({ orderConfirmation: null, createdAt: null }),

      isOrderExpired: () => {
        const { createdAt } = get();
        if (!createdAt) return true;

        // 15 phút = 15 * 60 * 1000 milliseconds
        const fifteenMinutes = 15 * 60 * 1000;
        return Date.now() - createdAt > fifteenMinutes;
      },
    }),
    {
      name: "order-storage",
      storage: createJSONStorage(() => createSecureStorage()),
    },
  ),
);
