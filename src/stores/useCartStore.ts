import { CartItem, CartStore } from "@src/types/cart.type";
import toast from "react-hot-toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: null,

      // Hàm gọi API giả lập để thêm giỏ hàng
      addNewCart: async ({ userId, products }: { userId: number; products: CartItem[] }) => {
        console.log("products", products);

        const currentCart = useCartStore.getState().cart;
        if (currentCart?.id) {
          // Do endpoint "Update a cart" không nhận id cart 51 nên sử dụng tạm các id của cart trong "Get all carts"
          try {
            const res = await useCartStore.getState().updateCart({
              cartId: 1,
              products,
            });
            const data = await res.json();
            console.log("data", data);

            if (data) {
              set({ cart: data });
              toast.success("Thêm vào giỏ hàng thành công!");
            } else {
              toast.error("Thêm vào giỏ hàng thất bại!");
            }
          } catch (error) {
            toast.error("Thêm vào giỏ hàng thất bại!");
            throw error;
          }
        } else {
          try {
            const res = await fetch("https://dummyjson.com/carts/add", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, products }),
            });
            const data = await res.json();
            console.log("addToCart Data", data);

            set({ cart: data });
            toast.success("Thêm vào giỏ hàng thành công!");
          } catch (error) {
            console.log("Error adding to cart:", error);
            toast.error("Thêm vào giỏ hàng thất bại!");
          }
        }
      },

      updateCart: async ({ cartId, products }: { cartId: number; products: CartItem[] }) => {
        try {
          const res = await fetch(`https://dummyjson.com/carts/${cartId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ merge: true, products }),
          });
          return res;
        } catch (error) {
          throw error;
        }
      },

      // Hàm xóa giỏ hàng (nếu cần)
      clearCart: () => set({ cart: null }),
    }),

    {
      name: "cart-storage", // tên key trong localStorage
      storage: createJSONStorage(() => localStorage), // tùy chọn: có thể đổi sang sessionStorage nếu muốn
    },
  ),
);
