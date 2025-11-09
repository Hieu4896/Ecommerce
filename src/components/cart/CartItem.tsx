import Image from "next/image";
import { Button } from "@components/button";
import { Input } from "@components/input";
import { Card, CardContent } from "@components/card";
import { CartItem as CartItemType } from "@src/types/cart.type";
import { Minus, Plus, Trash2 } from "lucide-react";

/**
 * Props cho CartItem component
 */
interface CartItemProps {
  cartItem: CartItemType;
  onRemove?: (productId: number) => void;
  onQuantityChange?: (productId: number, quantity: number) => void;
}

/**
 * Component hiển thị một sản phẩm trong giỏ hàng
 * Cho phép thay đổi số lượng và xóa sản phẩm
 */
export const CartItem = ({ cartItem, onRemove, onQuantityChange }: CartItemProps) => {
  // Xử lý khi thay đổi số lượng bằng input
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    onQuantityChange?.(cartItem.id, newQuantity);
  };

  // Xử lý khi giảm số lượng
  const handleDecrease = () => {
    handleQuantityChange(cartItem.quantity - 1);
  };

  // Xử lý khi tăng số lượng
  const handleIncrease = () => {
    handleQuantityChange(cartItem.quantity + 1);
  };

  return (
    <Card className="w-full border-border bg-card shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          {/* Hình ảnh sản phẩm */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20">
            {cartItem.thumbnail ? (
              <Image
                src={cartItem.thumbnail}
                alt={cartItem.title}
                className="object-cover rounded-md"
                fill
                sizes="(max-width: 640px) 64px, 80px"
              />
            ) : (
              <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                <span className="text-muted-foreground text-xs">No Image</span>
              </div>
            )}
          </div>

          {/* Thông tin sản phẩm */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-primary-foreground text-sm sm:text-base truncate">
              {cartItem.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 sm:mt-2">
              <span className="text-base sm:text-lg font-semibold text-success">
                ${cartItem.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Điều khiển số lượng và xóa */}
          <div className="flex flex-col items-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove?.(cartItem.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 p-2 h-auto"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecrease}
                disabled={cartItem.quantity <= 1}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>

              <Input
                type="number"
                min={1}
                value={cartItem.quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleQuantityChange(parseInt(e.target.value) || 1)
                }
                className="w-12 sm:w-16 text-center h-7 sm:h-8 bg-accent text-sm"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={handleIncrease}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Ẩn trên mobile, hiển thị trên desktop */}
            <div className="font-semibold flex gap-3 text-primary-foreground">
              <span className="text-muted-foreground line-through">
                ${cartItem.total.toFixed(2)}
              </span>
              <span>${cartItem.discountedTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
