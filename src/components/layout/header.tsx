"use client";

import Image from "next/image";
import Link from "next/link";
import { UserMenu } from "../auth/UserMenu";
import { CartIcon } from "../cart/CartIcon";
import { useAuth } from "@hooks/useAuth";
import { useEffect, useState } from "react";

export default function Header() {
  const { isLoading, isLoggingOut, isAuthenticated, restoreSessionFromCookies } = useAuth();
  console.log("isAuthenticated", isAuthenticated);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      console.log("restoreSessionFromCookies is running...");

      restoreSessionFromCookies().then((data) => {
        if (!data) window.location.href = "/login";
      });
    }
  }, [isAuthenticated, mounted, restoreSessionFromCookies]);

  return (
    <header className="w-full h-15 py-2 bg-accent flex justify-between items-center">
      <nav className="container h-full flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Pawsy" width={60} height={60} className="w-8 h-auto" />
        </Link>

        <div className="flex items-center gap-4">
          {/* Cart Icon - chỉ hiển thị khi đã đăng nhập */}
          {isAuthenticated && <CartIcon />}
          {/* Hiển thị thông tin user hoặc nút đăng nhập */}
          {isLoading || isLoggingOut ? (
            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
          ) : (
            isAuthenticated && <UserMenu />
          )}
        </div>
      </nav>
    </header>
  );
}
