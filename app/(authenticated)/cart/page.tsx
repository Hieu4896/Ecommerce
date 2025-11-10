"use client";

import { useCart } from "@src/hooks/useCart";
import { CartItem } from "@src/components/cart/CartItem";
import { OrderSummary } from "@src/components/checkout/OrderSummary";
import { Button } from "@components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EmptyCart } from "@src/components/cart/EmptyCart";

/**
 * Trang giỏ hàng
 * Hiển thị danh sách sản phẩm trong giỏ hàng và các thao tác liên quan
 */
export default function CartPage() {
  const {
    cart,
    handleQuantityChange,
    handleRemoveItem,
    handleCheckout,
    handleClearCart,
    isCartEmpty,
  } = useCart();
  const isEmpty = isCartEmpty();
  const isExists = !isEmpty && cart?.products && cart.products.length > 0;

  if (isEmpty)
    return (
      <div className="container px-4 py-8">
        <EmptyCart />
      </div>
    );

  if (!isExists) return null;

  return (
    <div className="container px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Giỏ hàng của bạn</h1>
        <p className="text-muted-foreground">Quản lý các sản phẩm trong giỏ hàng của bạn</p>
      </div>

      {/* Giỏ hàng có sản phẩm */}
      {isExists && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Danh sách sản phẩm trong giỏ hàng */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="px-0">
                <CardTitle className="flex items-center justify-between">
                  <h2>Sản phẩm ({cart?.products.length})</h2>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-0">
                {cart.products.map((cartItem) => (
                  <CartItem
                    key={cartItem.id}
                    cartItem={cartItem}
                    onRemove={handleRemoveItem}
                    onQuantityChange={handleQuantityChange}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Nút quay lại trang sản phẩm */}
            <div className="mt-6">
              <Link href="/products">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </div>
          </div>

          {/* Tóm tắt giỏ hàng */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <OrderSummary
                cart={cart}
                handleClearCart={handleClearCart}
                handleCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
