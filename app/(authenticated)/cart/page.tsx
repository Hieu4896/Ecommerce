"use client";

import { useCart } from "@src/hooks/useCart";
import { CartItem } from "@src/components/cart/CartItem";
import { OrderSummary } from "@src/components/checkout/OrderSummary";
import { Button } from "@components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/card";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Trang giỏ hàng
 * Hiển thị danh sách sản phẩm trong giỏ hàng và các thao tác liên quan
 */
export default function CartPage() {
  const { cart, handleClearCart, handleCheckout, handleQuantityChange, handleRemoveItem } =
    useCart();
  const isCartEmpty = !cart || !cart.products || cart.products.length === 0;
  const isCartExists = !isCartEmpty;

  return (
    <div className="container px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Giỏ hàng của bạn</h1>
        <p className="text-muted-foreground">Quản lý các sản phẩm trong giỏ hàng của bạn</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Giỏ hàng trống */}
        {isCartEmpty && (
          <Card className="w-full">
            <CardContent className="pt-6 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Giỏ hàng trống</h2>
              <p className="text-muted-foreground mb-4">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
              <Link href="/products">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Giỏ hàng có sản phẩm */}
        {isCartExists && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Danh sách sản phẩm trong giỏ hàng */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <CardHeader className="px-0">
                  <CardTitle className="flex items-center justify-between">
                    <h2>Sản phẩm ({cart.products.length})</h2>
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
                  onClearCart={handleClearCart}
                  onCheckout={handleCheckout}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
