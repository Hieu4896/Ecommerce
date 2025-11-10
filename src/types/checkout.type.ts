import { Cart } from "./cart.type";

/**
 * Interface cho thông tin địa chỉ giao hàng
 */
export interface ShippingAddress {
  recipientName: string;
  phone: string;
  email: string;
  postalCode: string;
  streetAddress: string;
  detailedAddress?: string;
  deliveryNotes?: string;
}

/**
 * Interface cho thông tin thanh toán
 */
export interface PaymentInfo {
  paymentMethod: "card" | "bank" | "cash";
  cardNumber: string;
  cardExpiry: string;
  cardCVV: string;
}

/**
 * Interface cho form thanh toán hoàn chỉnh
 */
export interface CheckoutForm {
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
}

/**
 * Interface cho tóm tắt đơn hàng
 */
export interface OrderSummary {
  cart: Cart;
  formData: CheckoutForm | null;
}

/**
 * Interface cho state của checkout store
 */
export interface CheckoutState {
  orderSummary: OrderSummary | null;
  isProcessing: boolean;
  isCompleted: boolean;
  error: string | null;
}

/**
 * Interface cho thông tin xác nhận đơn hàng
 */
export interface OrderConfirmation {
  orderId: string;
  orderDate: Date;
  estimatedDelivery: Date;
  shippingAddress: ShippingAddress;
  orderSummary: OrderSummary;
}
