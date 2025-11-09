"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrderConfirmation as OrderConfirmationType } from "@src/types/checkout.type";
import { Button } from "@components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/card";
import { formatPrice } from "@utils/format.util";
import { useCheckoutStore } from "@src/store/checkoutStore";

/**
 * Component hiển thị trang xác nhận đơn hàng
 * Hiển thị thông tin chi tiết về đơn hàng đã đặt thành công
 */
const OrderConfirmation: React.FC = () => {
  const router = useRouter();
  const { isCompleted, resetCheckout } = useCheckoutStore();
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmationType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy dữ liệu xác nhận đơn hàng từ localStorage khi component được mount
  useEffect(() => {
    const fetchOrderConfirmation = () => {
      try {
        // Lấy dữ liệu từ localStorage
        const storedData = localStorage.getItem("order-confirmation");
        if (storedData) {
          const confirmationData = JSON.parse(storedData);
          // Chuyển đổi chuỗi ngày thành đối tượng Date
          if (confirmationData.orderDate) {
            confirmationData.orderDate = new Date(confirmationData.orderDate);
          }
          if (confirmationData.estimatedDelivery) {
            confirmationData.estimatedDelivery = new Date(confirmationData.estimatedDelivery);
          }
          setOrderConfirmation(confirmationData);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu xác nhận đơn hàng:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderConfirmation();
  }, []);

  // Nếu không phải trang xác nhận đơn hàng, chuyển hướng về trang sản phẩm
  useEffect(() => {
    if (!isLoading && !isCompleted) {
      router.push("/products");
    }
  }, [isLoading, isCompleted, router]);

  // Hàm định dạng ngày tháng
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // Hàm xử lý quay lại trang sản phẩm
  const handleContinueShopping = () => {
    resetCheckout();
    router.push("/products");
  };

  // Hàm xử lý in hóa đơn
  const handlePrintReceipt = () => {
    window.print();
  };

  // Hàm xử lý theo dõi đơn hàng (placeholder)
  const handleTrackOrder = () => {
    // Placeholder cho chức năng theo dõi đơn hàng
    alert("Tính năng theo dõi đơn hàng sẽ sớm được cập nhật!");
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

  // Nếu không có dữ liệu đơn hàng, hiển thị thông báo lỗi
  if (!orderConfirmation) {
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
    <div className="container mx-auto px-4 py-8">
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
                  <p className="font-semibold">{formatDate(orderConfirmation.estimatedDelivery)}</p>
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
                {orderConfirmation.shippingAddress.detailedAddress && (
                  <p className="text-sm">{orderConfirmation.shippingAddress.detailedAddress}</p>
                )}
                <p className="text-sm">{orderConfirmation.shippingAddress.postalCode}, Việt Nam</p>
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
                {orderConfirmation.orderSummary.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Số lượng: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(item.total)}</p>
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
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{formatPrice(orderConfirmation.orderSummary.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(orderConfirmation.orderSummary.shippingFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thuế (10%)</span>
                  <span>{formatPrice(orderConfirmation.orderSummary.tax)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Tổng cộng</span>
                    <span className="text-success">
                      {formatPrice(orderConfirmation.orderSummary.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button onClick={handleContinueShopping} className="w-full" variant="default">
                  Tiếp tục mua sắm
                </Button>
                <Button onClick={handleTrackOrder} className="w-full" variant="outline">
                  Theo dõi đơn hàng
                </Button>
                <Button onClick={handlePrintReceipt} className="w-full" variant="secondary">
                  In hóa đơn
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
