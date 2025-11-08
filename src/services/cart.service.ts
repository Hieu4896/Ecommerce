// Dùng Zustand với persist middleware để giả lập giỏ hàng của người dùng ở localStorage nên tạm thời ẩn service này

// import { AddCartRequest, Cart, DeleteCartResponse, UpdateCartRequest } from "@src/types/cart.type";
// import BaseService from "./base.service";

// /**
//  * Cart Service Class kế thừa từ Base Service
//  * Cung cấp các phương thức để tương tác với DummyJSON Carts API
//  */
// class CartService extends BaseService {
//   private static instance: CartService;

//   /**
//    * Singleton pattern để đảm bảo chỉ có một instance của CartService
//    * @returns Instance của CartService
//    */
//   public static getInstance(): CartService {
//     if (!CartService.instance) {
//       CartService.instance = new CartService();
//     }
//     return CartService.instance;
//   }

//   /**
//    * Lấy giỏ hàng của người dùng theo userId
//    * @param userId - ID của người dùng
//    * @returns Promise<Cart[]> - Danh sách giỏ hàng của người dùng
//    */
//   async getCartsByUser(
//     userId: number,
//   ): Promise<{ carts: Cart[]; total: number; skip: number; limit: number }> {
//     try {
//       const url = this.buildUrl(`/carts/user/${userId}`);
//       const response = await this.swrFetcherWithTimeout<{
//         carts: Cart[];
//         total: number;
//         skip: number;
//         limit: number;
//       }>(url);
//       this.logDebug("Lấy giỏ hàng thành công", { userId, count: response.carts.length });
//       return response;
//     } catch (error) {
//       this.logError(
//         {
//           message: error instanceof Error ? error.message : "Lỗi không xác định",
//           status: 0,
//         },
//         `/carts/user/${userId}`,
//       );
//       throw error;
//     }
//   }

//   /**
//    * Thêm giỏ hàng mới
//    * @param cartData - Dữ liệu giỏ hàng mới
//    * @returns Promise<Cart> - Giỏ hàng đã được tạo
//    */
//   async addNewCart(cartData: AddCartRequest): Promise<Cart> {
//     this.logDebug("Thêm giỏ hàng mới", {
//       userId: cartData.userId,
//       productsCount: cartData.products.length,
//     });

//     try {
//       const response = await fetch(`${this.baseUrl}/carts/add`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(cartData),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || "Thêm giỏ hàng thất bại");
//       }

//       const data: Cart = await response.json();
//       this.logDebug("Thêm giỏ hàng thành công", { cartId: data.id });
//       return data;
//     } catch (error) {
//       this.logError(
//         {
//           message: error instanceof Error ? error.message : "Lỗi không xác định",
//           status: 0,
//         },
//         "/carts/add",
//       );
//       throw error;
//     }
//   }

//   /**
//    * Cập nhật giỏ hàng
//    * @param cartId - ID của giỏ hàng cần cập nhật
//    * @param cartData - Dữ liệu cập nhật
//    * @returns Promise<Cart> - Giỏ hàng đã được cập nhật
//    */
//   async updateCart(cartId: number, cartData: UpdateCartRequest): Promise<Cart> {
//     this.logDebug("Cập nhật giỏ hàng", {
//       cartId,
//       merge: cartData.merge,
//       productsCount: cartData.products.length,
//     });

//     try {
//       const response = await fetch(`${this.baseUrl}/carts/${cartId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(cartData),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || "Cập nhật giỏ hàng thất bại");
//       }

//       const data: Cart = await response.json();
//       this.logDebug("Cập nhật giỏ hàng thành công", { cartId: data.id });
//       return data;
//     } catch (error) {
//       this.logError(
//         {
//           message: error instanceof Error ? error.message : "Lỗi không xác định",
//           status: 0,
//         },
//         `/carts/${cartId}`,
//       );
//       throw error;
//     }
//   }

//   /**
//    * Xóa giỏ hàng
//    * @param cartId - ID của giỏ hàng cần xóa
//    * @returns Promise<DeleteCartResponse> - Thông tin giỏ hàng đã bị xóa
//    */
//   async deleteCart(cartId: number): Promise<DeleteCartResponse> {
//     this.logDebug("Xóa giỏ hàng", { cartId });

//     try {
//       const response = await fetch(`${this.baseUrl}/carts/${cartId}`, {
//         method: "DELETE",
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || "Xóa giỏ hàng thất bại");
//       }

//       const data: DeleteCartResponse = await response.json();
//       this.logDebug("Xóa giỏ hàng thành công", { cartId, isDeleted: data.isDeleted });
//       return data;
//     } catch (error) {
//       this.logError(
//         {
//           message: error instanceof Error ? error.message : "Lỗi không xác định",
//           status: 0,
//         },
//         `/carts/${cartId}`,
//       );
//       throw error;
//     }
//   }
// }

// // Export instance của CartService để sử dụng trong toàn bộ ứng dụng
// export const cartService = CartService.getInstance();
