"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCheckoutStore } from "@src/store/checkoutStore";
import { useCart } from "@hooks/useCart";
import { OrderSummary } from "@src/components/checkout/OrderSummary";
import { FormField } from "./FormField";
import { checkoutSchema } from "../schema/checkout.schema";
import checkoutService from "@services/checkout.service";
import { formatCardNumber, formatExpiryDate } from "@utils/format.util";

/**
 * Component CheckoutForm - Form thanh toán hoàn chỉnh
 * Sử dụng react-hook-form và yup validation
 * Bao gồm thông tin giao hàng, thanh toán và tóm tắt đơn hàng
 */
const CheckoutForm: React.FC = () => {
  const router = useRouter();

  // Lấy state và actions từ stores
  const {
    orderSummary,
    isProcessing,
    isCompleted,
    error,
    setFormData,
    setOrderSummary,
    processCheckout,
  } = useCheckoutStore();

  const { handleClearCart, cart } = useCart();

  // Khởi tạo react-hook-form với schema validation
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(checkoutSchema),
    defaultValues: {
      recipientName: "",
      phone: "",
      email: "",
      postalCode: "",
      streetAddress: "",
      detailedAddress: "",
      deliveryNotes: "",
      paymentMethod: "card",
      cardNumber: "",
      cardExpiry: "",
      cardCVV: "",
    },
    mode: "onBlur",
  });

  // Watch tất cả các giá trị để truyền vào FormField
  const formValues = watch();

  // Khởi tạo order summary từ cart khi component mount
  useEffect(() => {
    if (cart && cart.products.length > 0 && !orderSummary) {
      const summary = checkoutService.calculateOrderSummary(cart.products);
      setOrderSummary(summary);
    }
  }, [cart, orderSummary, setOrderSummary]);

  // Chuyển hướng đến trang xác nhận đơn hàng khi checkout hoàn thành
  useEffect(() => {
    if (isCompleted) {
      router.push("/checkout/confirmation");
    }
  }, [isCompleted, router]);

  // Xử lý thay đổi card number với auto-format
  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setValue("cardNumber", formatted);
  };

  // Xử lý thay đổi expiry date với auto-format
  const handleExpiryDateChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    setValue("cardExpiry", formatted);
  };

  // Xử lý thay đổi CVV (chỉ cho phép nhập số)
  const handleCVVChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").substring(0, 3);
    setValue("cardCVV", numericValue);
  };

  // Xử lý submit form
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      // Chuyển đổi dữ liệu form thành cấu trúc CheckoutForm
      const checkoutData = {
        shippingAddress: {
          recipientName: data.recipientName,
          phone: data.phone,
          email: data.email,
          postalCode: data.postalCode,
          streetAddress: data.streetAddress,
          detailedAddress: data.detailedAddress,
          deliveryNotes: data.deliveryNotes,
        },
        paymentInfo: {
          paymentMethod: data.paymentMethod as "card" | "bank" | "cash",
          cardNumber: data.cardNumber,
          cardExpiry: data.cardExpiry,
          cardCVV: data.cardCVV,
        },
      };

      // Lưu form data vào store
      setFormData(checkoutData);

      // Xử lý checkout
      await processCheckout();
    } catch (error) {
      // Error đã được xử lý trong store
      console.error("Checkout error:", error);
    }
  };

  // Reset form
  const handleReset = () => {
    reset();
  };

  // Nếu không có sản phẩm trong giỏ hàng, hiển thị thông báo
  if (!cart || cart.products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-600">Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form thanh toán */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin giao hàng</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  id="recipientName"
                  label="Tên người nhận"
                  value={formValues.recipientName}
                  onChange={(e) => setValue("recipientName", e.target.value)}
                  error={errors.recipientName?.message}
                  placeholder="Nhập tên người nhận"
                  required
                />

                <FormField
                  id="phone"
                  label="Số điện thoại"
                  type="tel"
                  value={formValues.phone}
                  onChange={(e) => setValue("phone", e.target.value)}
                  error={errors.phone?.message}
                  placeholder="Nhập số điện thoại"
                  required
                />

                <FormField
                  id="email"
                  label="Email"
                  type="email"
                  value={formValues.email}
                  onChange={(e) => setValue("email", e.target.value)}
                  error={errors.email?.message}
                  placeholder="Nhập email"
                  required
                />

                <FormField
                  id="postalCode"
                  label="Mã bưu chính"
                  value={formValues.postalCode}
                  onChange={(e) => setValue("postalCode", e.target.value)}
                  error={errors.postalCode?.message}
                  placeholder="Nhập mã bưu chính"
                  required
                />
              </div>

              <FormField
                id="streetAddress"
                label="Địa chỉ giao hàng"
                value={formValues.streetAddress}
                onChange={(e) => setValue("streetAddress", e.target.value)}
                error={errors.streetAddress?.message}
                placeholder="Nhập địa chỉ giao hàng"
                required
              />

              <FormField
                id="detailedAddress"
                label="Địa chỉ chi tiết"
                value={formValues.detailedAddress}
                onChange={(e) => setValue("detailedAddress", e.target.value)}
                placeholder="Số nhà, tên đường, tòa nhà, etc."
              />

              <FormField
                id="deliveryNotes"
                label="Ghi chú giao hàng"
                value={formValues.deliveryNotes}
                onChange={(e) => setValue("deliveryNotes", e.target.value)}
                rows={3}
                placeholder="Ghi chú đặc biệt cho giao hàng (thời gian, hướng dẫn, etc.)"
              />
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin thanh toán</h2>

              {/* Payment Method */}
              <FormField
                id="paymentMethod"
                label="Phương thức thanh toán"
                name="paymentMethod"
                value={formValues.paymentMethod}
                onChange={(e) =>
                  setValue("paymentMethod", e.target.value as "card" | "bank" | "cash")
                }
                error={errors.paymentMethod?.message}
                required
                options={[
                  { value: "card", label: "Thẻ tín dụng" },
                  { value: "bank", label: "Chuyển khoản" },
                  { value: "cash", label: "Thanh toán khi nhận hàng (COD)" },
                ]}
              />

              {/* Card Payment Fields */}
              {formValues.paymentMethod === "card" && (
                <div className="space-y-4">
                  <FormField
                    id="cardNumber"
                    label="Số thẻ"
                    value={formValues.cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    error={errors.cardNumber?.message}
                    placeholder="1234-5678-9012-3456"
                    maxLength={19}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      id="cardExpiry"
                      label="Ngày hết hạn"
                      value={formValues.cardExpiry}
                      onChange={(e) => handleExpiryDateChange(e.target.value)}
                      error={errors.cardExpiry?.message}
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                    />

                    <FormField
                      id="cardCVV"
                      label="CVV"
                      value={formValues.cardCVV}
                      onChange={(e) => handleCVVChange(e.target.value)}
                      error={errors.cardCVV?.message}
                      placeholder="123"
                      maxLength={3}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Bank Transfer Info */}
              {formValues.paymentMethod === "bank" && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium text-blue-900 mb-2">Thông tin chuyển khoản</h3>
                  <p className="text-sm text-blue-800">
                    Ngân hàng: Vietcombank
                    <br />
                    Số tài khoản: 1234567890
                    <br />
                    Chủ tài khoản: Cửa hàng Pawsy
                    <br />
                    Nội dung: &quot;Thanh toán đơn hàng [Mã đơn hàng]&quot;
                  </p>
                </div>
              )}

              {/* COD Info */}
              {formValues.paymentMethod === "cash" && (
                <div className="bg-green-50 p-4 rounded-md">
                  <h3 className="font-medium text-green-900 mb-2">
                    Thanh toán khi nhận hàng (COD)
                  </h3>
                  <p className="text-sm text-green-800">
                    Bạn sẽ thanh toán bằng tiền mặt khi nhận được hàng. Vui lòng chuẩn bị đủ số tiền
                    để thanh toán cho nhân viên giao hàng.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className={`px-6 py-2 rounded-md text-white transition-colors ${
                  isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary/90"
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  "Đặt hàng"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          {cart && (
            <OrderSummary
              cart={cart}
              onClearCart={handleClearCart}
              onCheckout={() => {}} // Không sử dụng trong CheckoutForm
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
