"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@src/hooks/useCart";
import Link from "next/link";

/**
 * Component CartIcon
 * Hiển thị icon giỏ hàng và số lượng sản phẩm trong giỏ hàng
 */
export function CartIcon() {
  const { cart } = useCart();

  // Tính tổng số lượng sản phẩm trong giỏ hàng
  const totalItems = cart?.totalProducts;

  return (
    <Link href="/cart" className="relative">
      <ShoppingCart className="h-6 w-6 text-primary-foreground" />
      {totalItems && totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}
