"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/card";
import { formatDate, formatPrice } from "@utils/format.util";
import { useCheckoutStore } from "@src/store/checkoutStore";
import { useOrderStore } from "@src/store/orderStore";

/**
 * Component nội dung của trang xác nhận đơn hàng
 * Hiển thị thông tin chi tiết về đơn hàng đã đặt thành công
 */
const OrderConfirmationContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetCheckout } = useCheckoutStore();
  const { orderConfirmation, clearOrderConfirmation, isOrderExpired } = useOrderStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy orderId từ URL
  const urlOrderId = searchParams.get("orderId");

  // Kiểm tra quyền truy cập và thiết lập timer xóa dữ liệu
  useEffect(() => {
    if (!urlOrderId) {
      setIsLoading(false);
      return;
    }

    // Kiểm tra xem orderConfirmation có tồn tại, orderId có khớp không và có hết hạn không
    if (orderConfirmation && orderConfirmation.orderId === urlOrderId && !isOrderExpired()) {
      setIsAuthorized(true);
      setIsLoading(false);

      // Thiết lập timer để xóa dữ liệu sau 15 phút
      const timer = setTimeout(
        () => {
          clearOrderConfirmation();
          setIsAuthorized(false);
        },
        15 * 60 * 1000, // 15 phút
      );

      return () => clearTimeout(timer);
    } else {
      // Nếu order đã hết hạn, xóa dữ liệu
      if (orderConfirmation && isOrderExpired()) {
        clearOrderConfirmation();
      }
      setIsLoading(false);
    }
  }, [urlOrderId, orderConfirmation, clearOrderConfirmation, isOrderExpired]);

  // Xử lý khi người dùng rời khỏi trang
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthorized) {
        clearOrderConfirmation();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isAuthorized, clearOrderConfirmation]);

  // Hàm xử lý quay lại trang sản phẩm
  const handleContinueShopping = () => {
    if (isAuthorized) {
      clearOrderConfirmation();
    }
    resetCheckout();
    router.push("/products");
  };

  // Hiển thị loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success"></div>
        </div>
      </div>
    );
  }

  // Nếu không có quyền truy cập hoặc không có dữ liệu đơn hàng, hiển thị thông báo lỗi
  if (!isAuthorized || !orderConfirmation || !orderConfirmation.orderSummary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Không tìm thấy thông tin đơn hàng
          </h1>
          <p className="text-muted-foreground mb-6">
            Đã có lỗi xảy ra khi tải thông tin xác nhận đơn hàng.
          </p>
          <Button onClick={handleContinueShopping}>Tiếp tục mua sắm</Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen my-auto h-full flex flex-col py-6 justify-center  bg-amber-100">
      <div className="container">
        {/* Success Animation and Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-success rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-success-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </div>
          <h1 className="text-3xl font-bold text-success mb-2">Đặt hàng thành công!</h1>
          <p className="text-muted-foreground">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Thông tin đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                    <p className="font-semibold">#{orderConfirmation.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày đặt hàng</p>
                    <p className="font-semibold">{formatDate(orderConfirmation.orderDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày giao hàng dự kiến</p>
                    <p className="font-semibold">
                      {formatDate(orderConfirmation.estimatedDelivery)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Địa chỉ giao hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">{orderConfirmation.shippingAddress.recipientName}</p>
                  <p className="text-sm">{orderConfirmation.shippingAddress.phone}</p>
                  <p className="text-sm">{orderConfirmation.shippingAddress.email}</p>
                  <p className="text-sm">{orderConfirmation.shippingAddress.streetAddress}</p>
                  <p className="text-sm">
                    {orderConfirmation.shippingAddress.postalCode}, Việt Nam
                  </p>
                  {orderConfirmation.shippingAddress.deliveryNotes && (
                    <p className="text-sm italic">
                      Ghi chú: {orderConfirmation.shippingAddress.deliveryNotes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Sản phẩm đã đặt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderConfirmation.orderSummary.cart.products.map((item, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-4">
                      <div className="flex-1">
                        <h3 className="text-destructive">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.discountedTotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl">Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Tổng cộng</span>
                      <span className="text-success">
                        {formatPrice(orderConfirmation.orderSummary.cart.discountedTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button onClick={handleContinueShopping} className="w-full" variant="default">
                    Tiếp tục mua sắm
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

/**
 * Component hiển thị trang xác nhận đơn hàng
 * Hiển thị thông tin chi tiết về đơn hàng đã đặt thành công
 */
const OrderConfirmation: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success"></div>
          </div>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
};

export default OrderConfirmation;
