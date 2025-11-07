import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@components/dropdown-menu";
import { LogOutIcon, ShoppingCart, ShoppingCartIcon } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export function UserMenu({
  status,
  session,
}: {
  status: "authenticated" | "loading" | "unauthenticated";
  session: Session | null;
}) {
  if (status === "loading") {
    return <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>;
  }
  /**
   * Xử lý đăng xuất
   */
  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2">
          {session?.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel> {session?.user?.name || "User"}</DropdownMenuLabel>
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
