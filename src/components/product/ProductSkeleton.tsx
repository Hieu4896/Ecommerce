import { Card, CardContent } from "../ui/card";

/**
 * Component hiển thị loading skeleton
 */
export const ProductSkeleton = () => (
  <Card className="w-full border-border shadow-xs overflow-hidden">
    <CardContent className="p-4">
      <div className="animate-pulse space-y-3">
        {/* Hình ảnh sản phẩm */}
        <div className="h-40 bg-muted rounded-md mb-4"></div>

        {/* Thông tin sản phẩm */}
        <div className="space-y-2">
          <div className="h-5 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>

        {/* Giá và rating */}
        <div className="flex justify-between items-center mt-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-5 bg-muted rounded w-1/4"></div>
        </div>

        {/* Nút Add to Cart */}
        <div className="h-10 bg-muted rounded w-full mt-3"></div>
      </div>
    </CardContent>
  </Card>
);
