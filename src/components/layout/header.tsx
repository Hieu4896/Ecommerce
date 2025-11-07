"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "../auth/UserMenu";
import { useAuth } from "@hooks/useAuth";

export default function Header() {
  const { isLoading, isLoggingOut, isAuthenticated } = useAuth();

  const pathName = usePathname();

  /**
   * Ẩn Header trên trang chủ (/) và trang đăng nhập (/login)
   */
  const shouldHideAuthUI = pathName === "/" || pathName === "/login";

  return (
    !shouldHideAuthUI && (
      <header className="w-full h-15 py-2 bg-accent flex justify-between items-center">
        <nav className="container h-full flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Pawsy" width={60} height={60} className="w-8 h-auto" />
          </Link>

          <div className="flex items-center gap-4">
            {/* Hiển thị thông tin user hoặc nút đăng nhập */}
            {isLoading || isLoggingOut ? (
              <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
            ) : (
              isAuthenticated && <UserMenu />
            )}
          </div>
        </nav>
      </header>
    )
  );
}
