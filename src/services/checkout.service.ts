import BaseService from "./base.service";
import { UserInfo } from "@src/types/auth.type";
import { CartItem } from "@src/types/cart.type";
import {
  ShippingAddress,
  PaymentInfo,
  OrderSummary,
  OrderConfirmation,
} from "@src/types/checkout.type";

/**
 * Interface cho kết quả validation thanh toán
 */
interface PaymentValidationResult {
  isValid: boolean;
  errors: {
    cardNumber?: string;
    cardExpiry?: string;
    cardCVV?: string;
  };
}

/**
 * Service xử lý các thao tác liên quan đến thanh toán và đơn hàng
 * Kế thừa từ BaseService để sử dụng các phương thức chung
 */
class CheckoutService extends BaseService {
  /**
   * Cập nhật thông tin địa chỉ của user
   * @param userId - ID của người dùng cần cập nhật
   * @param addressData - Dữ liệu địa chỉ mới
   * @returns Promise<UserInfo> - Thông tin user đã được cập nhật
   */
  public async updateUserAddress(
    userId: number,
    addressData: {
      address: {
        address: string;
        city: string;
        state: string;
        stateCode: string;
        postalCode: string;
        country: string;
      };
      phone: string;
      email: string;
    },
  ): Promise<UserInfo> {
    try {
      this.logDebug("Bắt đầu cập nhật thông tin địa chỉ người dùng", { userId, addressData });

      const url = this.buildUrl(`/users/${userId}`);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || `Lỗi khi cập nhật thông tin người dùng: ${response.status}`;
        this.logError(
          {
            message: errorMessage,
            status: response.status,
          },
          url,
        );
        throw new Error(errorMessage);
      }

      const updatedUser: UserInfo = await response.json();
      this.logDebug("Cập nhật thông tin địa chỉ thành công", { userId });

      return updatedUser;
    } catch (error) {
      this.logError(
        {
          message:
            error instanceof Error ? error.message : "Lỗi không xác định khi cập nhật địa chỉ",
          status: 0,
        },
        `/users/${userId}`,
      );
      throw error;
    }
  }

  /**
   * Xử lý đơn hàng (simulation)
   * @param shippingAddress - Địa chỉ giao hàng
   * @param orderSummary - Tóm tắt đơn hàng
   * @returns Promise<OrderConfirmation> - Thông tin xác nhận đơn hàng
   */
  public async processOrder(
    shippingAddress: ShippingAddress,
    orderSummary: OrderSummary,
  ): Promise<OrderConfirmation> {
    try {
      this.logDebug("Bắt đầu xử lý đơn hàng", { shippingAddress, orderSummary });

      // Tạo orderId ngẫu nhiên (6 chữ số)
      const orderId = Math.floor(100000 + Math.random() * 900000).toString();

      // Tính estimated delivery date (3-5 ngày từ hiện tại)
      const orderDate = new Date();
      const estimatedDelivery = new Date();
      const deliveryDays = 3 + Math.floor(Math.random() * 3); // 3-5 ngày
      estimatedDelivery.setDate(orderDate.getDate() + deliveryDays);

      const orderConfirmation: OrderConfirmation = {
        orderId,
        orderDate,
        estimatedDelivery,
        shippingAddress,
        orderSummary,
      };

      this.logDebug("Xử lý đơn hàng thành công", { orderId, estimatedDelivery });

      return orderConfirmation;
    } catch (error) {
      this.logError(
        {
          message: error instanceof Error ? error.message : "Lỗi không xác định khi xử lý đơn hàng",
          status: 0,
        },
        "processOrder",
      );
      throw error;
    }
  }

  /**
   * Validate thông tin thanh toán
   * @param paymentInfo - Thông tin thanh toán cần validate
   * @returns PaymentValidationResult - Kết quả validation
   */
  public validatePaymentInfo(paymentInfo: PaymentInfo): PaymentValidationResult {
    this.logDebug("Bắt đầu validate thông tin thanh toán", { paymentInfo });

    const errors: PaymentValidationResult["errors"] = {};
    let isValid = true;

    // Validate card number (format: 1234-5678-9012-3456)
    const cardNumberPattern = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
    if (!cardNumberPattern.test(paymentInfo.cardNumber)) {
      errors.cardNumber = "Số thẻ không hợp lệ. Định dạng đúng: 1234-5678-9012-3456";
      isValid = false;
    }

    // Validate expiry date (format: MM/YY)
    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryPattern.test(paymentInfo.cardExpiry)) {
      errors.cardExpiry = "Ngày hết hạn không hợp lệ. Định dạng đúng: MM/YY";
      isValid = false;
    } else {
      // Kiểm tra xem thẻ đã hết hạn chưa
      const [month, year] = paymentInfo.cardExpiry.split("/");
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      const expiryYear = parseInt(year);
      const expiryMonth = parseInt(month);

      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        errors.cardExpiry = "Thẻ đã hết hạn";
        isValid = false;
      }
    }

    // Validate CVV (3 digits)
    const cvvPattern = /^\d{3}$/;
    if (!cvvPattern.test(paymentInfo.cardCVV)) {
      errors.cardCVV = "CVV không hợp lệ. Phải gồm 3 chữ số";
      isValid = false;
    }

    const validationResult: PaymentValidationResult = {
      isValid,
      errors,
    };

    this.logDebug("Kết quả validate thông tin thanh toán", validationResult);

    return validationResult;
  }

  /**
   * Tính toán tóm tắt đơn hàng
   * @param cartItems - Danh sách sản phẩm trong giỏ hàng
   * @returns OrderSummary - Tóm tắt đơn hàng
   */
  public calculateOrderSummary(cartItems: CartItem[]): OrderSummary {
    this.logDebug("Bắt đầu tính toán tóm tắt đơn hàng", { cartItems });

    // Tính subtotal từ cart items
    const subtotal = cartItems.reduce((total, item) => total + item.total, 0);

    // Tính shipping fee (fixed 30,000 VND)
    const shippingFee = 30000;

    // Tính tax (10% của subtotal)
    const tax = Math.round(subtotal * 0.1);

    // Tính total = subtotal + shippingFee + tax
    const total = subtotal + shippingFee + tax;

    const orderSummary: OrderSummary = {
      items: cartItems,
      subtotal,
      shippingFee,
      tax,
      total,
    };

    this.logDebug("Tính toán tóm tắt đơn hàng thành công", orderSummary);

    return orderSummary;
  }
}

// Export instance của CheckoutService để sử dụng trong toàn bộ ứng dụng
const checkoutService = new CheckoutService();
export default checkoutService;
