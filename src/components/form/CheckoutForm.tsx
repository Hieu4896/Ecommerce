"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCheckoutStore } from "@src/store/checkoutStore";
import { useCart } from "@hooks/useCart";
import { checkoutSchema } from "../schema/checkout.schema";
import checkoutService from "@services/checkout.service";
import { ShippingForm } from "./ShippingForm";
import { PaymentForm } from "./PaymentForm";
import { Button } from "../ui/button";
import { EmptyCart } from "../cart/EmptyCart";

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

  const { cart } = useCart();

  // Khởi tạo react-hook-form với schema validation
  const methods = useForm({
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

  const { handleSubmit, reset } = methods;

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
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Form thanh toán */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Shipping Form */}
          <ShippingForm />

          {/* Payment Form */}
          <PaymentForm />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </Button>
            <Button
              variant="default"
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
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default CheckoutForm;
