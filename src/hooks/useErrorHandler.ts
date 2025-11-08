import { useCallback } from "react";
import { getErrorMessage } from "@utils/error.util";

/**
 * Custom hook để xử lý lỗi một cách tập trung và tái sử dụng
 * Cung cấp các phương thức để xử lý và hiển thị thông báo lỗi
 */
export const useErrorHandler = () => {
  /**
   * Chuyển đổi error object thành thông báo lỗi thân thiện với người dùng
   * @param error - Đối tượng lỗi cần xử lý
   * @returns Chuỗi thông báo lỗi đã được local hóa
   */
  const getErrorMessageCallback = useCallback(
    (
      error:
        | (Error & {
            info?: { message?: string; [key: string]: unknown };
            status?: number;
          })
        | unknown,
    ): string => {
      return getErrorMessage(error);
    },
    [],
  );

  /**
   * Log lỗi để debug trong development mode
   * @param error - Đối tượng lỗi cần log
   * @param context - Context thông tin bổ sung về lỗi
   */
  const logError = useCallback((error: unknown, context?: string): void => {
    if (process.env.NODE_ENV === "development") {
      console.group(`🚨 Error Handler`);
      if (context) {
        console.log("Context:", context);
      }
      console.log("Error:", error);
      console.log("Message:", getErrorMessage(error));
      console.log("Timestamp:", new Date().toISOString());
      console.groupEnd();
    }
  }, []);

  return {
    getErrorMessage: getErrorMessageCallback,
    logError,
  };
};
