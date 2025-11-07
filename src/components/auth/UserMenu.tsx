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

export function UserMenu() {
  const { user, logout, isLoading } = useAuth();

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
      // Gọi API route để xóa cookies
      await fetch("/api/auth/logout", {
        method: "POST",
      });

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
