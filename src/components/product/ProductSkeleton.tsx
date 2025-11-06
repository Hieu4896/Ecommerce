import { Card, CardContent } from "../ui/card";

/**
 * Component hiển thị loading skeleton
 */
export const ProductSkeleton = () => (
  <Card className="w-full min-h-[238px]">
    <CardContent className="p-4">
      <div className="animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-muted rounded w-1/4"></div>
      </div>
    </CardContent>
  </Card>
);
