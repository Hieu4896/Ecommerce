"use client";

import { ReactNode, useEffect } from "react";
import { useSecureStorage } from "@src/hooks/useSecureStorage";
import { clearSecureStorage } from "@src/utils/storage.util";

/**
 * Interface mở rộng cho Window object để hỗ trợ clearSecureStorage
 */
interface ExtendedWindow extends Window {
  clearSecureStorage?: () => void;
}

/**
 * StorageSecureProvider Component
 *
 * Component này chịu trách nhiệm:
 * 1. Khởi tạo hệ thống bảo vệ localStorage khi ứng dụng khởi chạy
 * 2. Cung cấp phương thức xóa dữ liệu bảo vệ qua window object cho debugging
 * 3. Bao bọc các component con với chức năng bảo vệ storage
 *
 * @component
 * @param {ReactNode} children - Các component con được bao bọc
 * @returns {JSX.Element} Provider component với children
 */
export default function StorageSecureProvider({ children }: { children: ReactNode }) {
  console.log("StorageSercureProvider running");

  // Khởi tạo secure storage hook để bảo vệ dữ liệu localStorage
  const cleanup = useSecureStorage();

  // Đăng ký phương thức clearSecureStorage vào window object cho mục đích debugging
  useEffect(() => {
    // Chỉ thực hiện trên client-side
    if (typeof window !== "undefined") {
      const extendedWindow = window as ExtendedWindow;

      // Gán phương thức xóa dữ liệu bảo vệ
      extendedWindow.clearSecureStorage = clearSecureStorage;

      // Cleanup function khi component unmount
      return () => {
        // Gọi cleanup function từ useSecureStorage nếu có
        if (cleanup) {
          cleanup();
        }

        // Xóa phương thức khỏi window object
        delete extendedWindow.clearSecureStorage;
      };
    }
  }, [cleanup]);

  return <>{children}</>;
}
