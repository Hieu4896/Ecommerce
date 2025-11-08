import { useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/card";
import { Button } from "@components/button";
import { Input } from "@components/input";
import { Product } from "@src/types/product.type";
import { useCart } from "@src/hooks/useCart";

/**
 * Component hiển thị một sản phẩm với nút Add to Cart
 */
export const ProductItem = ({ product }: { product: Product }) => {
  const quantityRef = useRef<HTMLInputElement>(null);
  const { addToCart, isLoading } = useCart();

  return (
    <Card className="w-full border-border hover:border-accent transition-colors duration-300 ease-out">
      <CardHeader className="pb-2">
        <div className="flex gap-4">
          {product.thumbnail && (
            <div className="relative w-16">
              <Image
                src={product.thumbnail}
                alt={product.title}
                className="object-cover"
                fill
                sizes="64px"
              />
            </div>
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
        <div className="flex items-center justify-between gap-4">
          <Button
            className="flex-1"
            disabled={isLoading}
            onClick={async () => {
              const quantity = Number(quantityRef.current?.value || 1);
              await addToCart(product, quantity);
            }}
          >
            {isLoading ? "Adding..." : "Add to Cart"}
          </Button>

          <Input
            ref={quantityRef}
            type="number"
            min={1}
            defaultValue={1}
            className="w-16 bg-muted"
          />
        </div>
      </CardContent>
    </Card>
  );
};
