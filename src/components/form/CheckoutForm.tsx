"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCheckoutStore } from "@src/store/checkoutStore";
import { useCart } from "@hooks/useCart";
import { checkoutSchema } from "../schema/checkout.schema";
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
  const [isLoading, setIsLoading] = useState(true);

  // Lấy state và actions từ stores
  const { isProcessing, error, setOrderSummary, processCheckout, resetCheckout } =
    useCheckoutStore();

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
    mode: "onChange", // Thay đổi thành onChange để realtime validation
  });

  const {
    handleSubmit,
    clearErrors,
    trigger,
    formState: { errors },
  } = methods;

  // Lưu orderSummary từ cart khi cart thay đổi
  useEffect(() => {
    if (cart && cart.products.length > 0) {
      setOrderSummary({
        cart,
        formData: null,
      });
    }
    // Set loading thành false khi cart đã load xong
    setIsLoading(false);
  }, [cart, setOrderSummary]);

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

      // Cập nhật orderSummary với formData
      if (cart) {
        setOrderSummary({
          cart,
          formData: checkoutData,
        });
      }

      // Xử lý checkout và lấy orderConfirmation
      const orderConfirmation = await processCheckout();

      // Chuyển hướng đến trang xác nhận đơn hàng với orderId
      if (orderConfirmation) {
        router.push(`/checkout/confirmation?orderId=${orderConfirmation.orderId}`);
      }
    } catch (error) {
      // Error đã được xử lý trong store
      console.error("Checkout error:", error);
    }
  };

  // Xử lý khi người dùng bấm nút Đặt hàng
  const handlePlaceOrder = async () => {
    // Trigger validation cho tất cả các field
    const isFormValid = await trigger();

    if (isFormValid) {
      // Nếu form hợp lệ, submit form
      handleSubmit(onSubmit)();
    }
    // Nếu form không hợp lệ, errors sẽ được hiển thị tại từng FormField
  };

  // Reset form và clear tất cả state khi bấm nút hủy
  const handleReset = () => {
    // Clear checkout store state
    resetCheckout();

    // Chuyển hướng về trang cart
    router.push("/cart");
  };

  // Xử lý khi người dùng thay đổi giá trị của một field
  const handleFieldChange = (
    fieldName:
      | "recipientName"
      | "phone"
      | "email"
      | "postalCode"
      | "streetAddress"
      | "detailedAddress"
      | "deliveryNotes"
      | "paymentMethod"
      | "cardNumber"
      | "cardExpiry"
      | "cardCVV",
    value: string,
  ) => {
    // Cập nhật giá trị field
    methods.setValue(fieldName, value);

    // Nếu field có error và người dùng đã nhập giá trị, clear error của field đó
    if (errors[fieldName] && value.trim() !== "") {
      clearErrors(fieldName);
    }
  };

  // Xử lý khi người dùng thay đổi giá trị của shipping field
  const handleShippingFieldChange = (
    fieldName:
      | "recipientName"
      | "phone"
      | "email"
      | "postalCode"
      | "streetAddress"
      | "detailedAddress"
      | "deliveryNotes",
    value: string,
  ) => {
    handleFieldChange(fieldName, value);
  };

  // Xử lý khi người dùng thay đổi giá trị của payment field
  const handlePaymentFieldChange = (
    fieldName: "paymentMethod" | "cardNumber" | "cardExpiry" | "cardCVV",
    value: string,
  ) => {
    handleFieldChange(fieldName, value);
  };

  // Hiển thị loading khi cart đang được tải
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

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
          <ShippingForm onFieldChange={handleShippingFieldChange} />

          {/* Payment Form */}
          <PaymentForm onFieldChange={handlePaymentFieldChange} />

          {/* Error Message từ store */}
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
              type="button"
              onClick={handlePlaceOrder}
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
