import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@components/dropdown-menu";
import { LogOutIcon } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@hooks/useAuth";
import { CartIcon } from "@src/components/cart/CartIcon";
export function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      {/* Giỏ hàng */}
      <CartIcon />

      {/* Menu người dùng */}
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
            <DropdownMenuItem onClick={logout}>
              <LogOutIcon />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
