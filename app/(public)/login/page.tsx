"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import LoginForm from "@src/components/form/LoginForm";

/**
 * Component nội dung trang đăng nhập
 * Sử dụng useSearchParams để lấy callbackUrl
 */
function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/products";

  return <LoginForm callbackUrl={callbackUrl} />;
}

/**
 * Trang đăng nhập với Credentials Provider
 * Sử dụng component LoginForm để hiển thị form đăng nhập
 * Xử lý callbackUrl để redirect về trang gốc sau khi login thành công
 * Bọc trong Suspense để xử lý useSearchParams trong SSR
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="hidden overflow-hidden" />}>
      <LoginContent />
    </Suspense>
  );
}
