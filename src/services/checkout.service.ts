import BaseService from "./base.service";
import { UserInfo } from "@src/types/auth.type";
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
  private static instance: CheckoutService;

  /**
   * Singleton pattern để đảm bảo chỉ có một instance của CheckoutService
   * @returns Instance của CheckoutService
   */
  public static getInstance(): CheckoutService {
    if (!CheckoutService.instance) {
      CheckoutService.instance = new CheckoutService();
    }
    return CheckoutService.instance;
  }
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
    this.logDebug("Bắt đầu cập nhật thông tin địa chỉ người dùng", { userId, addressData });
    const url = this.buildUrl(`/users/${userId}`);
    return await this.fetchPutWithTimeout<UserInfo>(url, addressData);
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
}

// Export instance của CheckoutService để sử dụng trong toàn bộ ứng dụng
export const checkoutService = CheckoutService.getInstance();
