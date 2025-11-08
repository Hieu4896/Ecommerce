import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@components/dropdown-menu";
import { LogOutIcon, ShoppingCartIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@hooks/useAuth";
import { useCart } from "@hooks/useCart";
import { useEffect } from "react";

export function UserMenu() {
  const { user, logout, isLoading } = useAuth();
  const { carts, fetchUserCart } = useCart();
  /**
   * Fetch cart data khi component mount và khi user thay đổi
   */
  useEffect(() => {
    if (user) {
      fetchUserCart();
    }
  }, [user, fetchUserCart]);

  if (isLoading) {
    return <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>;
  }

  if (!user) {
    return null;
  }

  /**
   * Xử lý đăng xuất
   */
  const handleSignOut = async () => {
    try {
      // Cập nhật state trong context
      await logout();

      // Chuyển hướng đến trang đăng nhập
      window.location.href = "/login";
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2">
          {user?.image && (
            <Image
              src={user.image}
              alt={user.name || "User"}
              className="w-8 h-auto rounded-full object-cover"
              width={32}
              height={32}
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>{user.name || "User"}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href="/cart" className="w-5 h-5 aspect-auto relative">
              <ShoppingCartIcon />
              {carts && carts.length > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-semibold rounded-full w-4 h-4 absolute -top-3 -right-1 text-center">
                  {carts.reduce((total, cart) => total + cart.totalQuantity, 0)}
                </span>
              )}
            </Link>
            <span>Giỏ hàng</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOutIcon />
            <span>Đăng xuất</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
