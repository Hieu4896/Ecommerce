"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@src/components/ui/button";
import { usePathname } from "next/navigation";
import { UserMenu } from "../auth/UserMenu";

export default function Header() {
  const { data: session, status } = useSession();
  const pathName = usePathname();

  /**
   * Kiểm tra xem có nên ẩn authentication UI không
   * Ẩn trên trang chủ (/) và trang đăng nhập (/login)
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
            <>
              {/* Hiển thị thông tin user hoặc nút đăng nhập */}
              {status === "loading" ? (
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
              ) : status === "authenticated" ? (
                <UserMenu session={session} status={status} />
              ) : (
                <Button
                  className="bg-foreground py-2 px-4 transition-colors duration-300 ease-out hover:bg-success"
                  onClick={() => (window.location.href = "/login")}
                >
                  Đăng nhập
                </Button>
              )}
            </>
          </div>
        </nav>
      </header>
    )
  );
}
