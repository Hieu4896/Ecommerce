import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";

export function EmptyCart() {
  return (
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
  );
}
