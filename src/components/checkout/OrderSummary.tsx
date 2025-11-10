import { ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/card";
import { Cart } from "@src/types/cart.type";
import { formatPrice } from "@src/utils/format.util";
import { CartDeletedConfirmation } from "../cart/CartDeletedConfirmation";
/**
 * Component hiển thị tóm tắt giỏ hàng và các thao tác
 * Hiển thị tổng tiền, số lượng sản phẩm và các nút hành động
 */

interface OrderSummaryProps {
  cart: Cart;
  handleClearCart: () => void;
  handleCheckout: () => void;
}

const renderItem = (label: string, value: string | number) => {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label} :</span>
      <p className="font-semibold text-md text-success">{value}</p>
    </div>
  );
};
export const OrderSummary = ({ cart, handleClearCart, handleCheckout }: OrderSummaryProps) => {
  const ChildTrigger = () => {
    return (
      <Button variant="outline" className="w-full">
        <Trash2 className="h-4 w-4 mr-2" />
        Xóa giỏ hàng
      </Button>
    );
  };
  return (
    <>
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
            {renderItem("Số lượng", cart.totalQuantity)}
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>Tổng cộng:</span>
                <span className="text-product-price">{formatPrice(cart.discountedTotal)}</span>
              </div>
            </div>
          </div>

          {/* Các nút hành động */}
          <div className="space-y-4">
            <Button variant="default" className="w-full" onClick={handleCheckout}>
              Thanh toán
            </Button>

            <CartDeletedConfirmation
              ChildTrigger={<ChildTrigger />}
              handleClearCart={handleClearCart}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};
