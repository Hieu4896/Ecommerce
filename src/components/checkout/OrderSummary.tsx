import { useRouter } from "next/navigation";
import { Button } from "@components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/card";
import { Cart } from "@src/types/cart.type";
import { formatPrice } from "@utils/format.util";
import { ShoppingBag, Trash2 } from "lucide-react";

/**
 * Props cho OrderSummary component
 */
interface CartSummaryProps {
  cart: Cart | null;
  onClearCart: () => void;
  onCheckout: () => void;
}

/**
 * Component hiển thị tóm tắt giỏ hàng và các thao tác
 * Hiển thị tổng tiền, số lượng sản phẩm và các nút hành động
 */

const renderItem = (label: string, value: string | number) => {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label} :</span>
      <p className="font-semibold text-md text-success">{value}</p>
    </div>
  );
};
export const OrderSummary = ({ cart, onClearCart }: CartSummaryProps) => {
  const router = useRouter();

  /**
   * Tính tổng số lượng sản phẩm trong giỏ hàng
   */
  const getTotalItems = (): number => {
    if (!cart || !cart.products) return 0;
    return cart.products.reduce((total, item) => total + item.quantity, 0);
  };

  const totalItems = getTotalItems();
  const subtotal = cart?.discountedTotal || 0;
  const shipping = subtotal > 100 ? 0 : 10; // Phí vận chuyển
  const tax = subtotal * 0.08; // Thuế
  const total = subtotal + shipping + tax;

  // Xử lý chuyển hướng đến trang thanh toán
  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <Card className="w-full sticky top-4 bg-primary-foreground">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Tóm tắt giỏ hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Thông tin giỏ hàng */}
        <div className="space-y-4">
          {renderItem("Số lượng", totalItems)}
          {renderItem("Tạm tính", formatPrice(subtotal))}
          {renderItem("Phí vận chuyển", shipping === 0 ? "Miễn phí" : formatPrice(shipping))}
          {renderItem("Thuế", formatPrice(tax))}
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Tổng cộng:</span>
              <span className="text-product-price">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Các nút hành động */}
        <div className="space-y-4">
          <Button variant="default" className="w-full" onClick={handleCheckout}>
            Thanh toán
          </Button>

          <Button variant="outline" className="w-full" onClick={onClearCart}>
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa giỏ hàng
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
