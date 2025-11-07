"use client";

import { useSearchParams } from "next/navigation";
import LoginForm from "@src/components/form/LoginForm";

/**
 * Trang đăng nhập với Credentials Provider
 * Sử dụng component LoginForm để hiển thị form đăng nhập
 * Xử lý callbackUrl để redirect về trang gốc sau khi login thành công
 */
export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/products";

  // Truyền callbackUrl vào LoginForm để xử lý redirect sau khi login thành công
  return <LoginForm callbackUrl={callbackUrl} />;
}
