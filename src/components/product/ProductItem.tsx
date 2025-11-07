import { Product } from "@src/types/product.type";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@src/components/ui/card";
import { Button } from "@src/components/ui/button";

/**
 * Component hiển thị một sản phẩm với nút Add to Cart
 */
export const ProductItem = ({ product }: { product: Product }) => {
  return (
    <Card className="w-full border-border hover:border-accent transition-colors duration-300 ease-out">
      <CardHeader className="pb-2">
        <div className="flex gap-4">
          {product.thumbnail && (
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-16 h-16 object-cover rounded-md"
            />
          )}
          <div className="flex-1">
            <CardTitle className="text-lg text-white line-clamp-1">{product.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">{product.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-product-price">${product.price}</span>
            {product.discountPercentage && (
              <span className="text-sm text-product-discount">-{product.discountPercentage}%</span>
            )}
          </div>
          {product.rating && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-primary-foreground">Rating:</span>
              <span className="text-sm font-medium text-accent">{product.rating}</span>
            </div>
          )}
        </div>
        <Button
          // onClick={handleAddToCart}
          // disabled={isAdding}
          className="w-full"
        >
          Add to Cart
          {/* {isAdding ? "Đang thêm..." : "Add to Cart"} */}
        </Button>
      </CardContent>
    </Card>
  );
};
