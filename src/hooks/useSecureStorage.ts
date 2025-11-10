import { PROTECTED_KEYS } from "@src/constants/storage.constant";
import { decryptData, validateAndCleanup } from "@src/utils/storage.util";

/**
 * Hook để bảo vệ localStorage
 */
export const useSecureStorage = (): (() => void) | void => {
  if (typeof window === "undefined") return;

  // Chạy validation ngay lập tức
  validateAndCleanup();

  // Thiết lập interval để kiểm tra định kỳ (mỗi 5 phút)
  const interval = setInterval(validateAndCleanup, 5 * 60 * 1000);

  // Event listener để theo dõi thay đổi từ tab khác
  const handleStorageChange = (event: StorageEvent) => {
    if (PROTECTED_KEYS.includes(event.key || "")) {
      if (event.newValue) {
        try {
          decryptData(event.newValue);
        } catch (error) {
          console.error(`Phát hiện thay đổi không hợp lệ cho ${event.key}:`, error);
          localStorage.removeItem(event.key!);
          window.location.reload();
        }
      }
    }
  };

  window.addEventListener("storage", handleStorageChange);

  // Cleanup
  return () => {
    clearInterval(interval);
    window.removeEventListener("storage", handleStorageChange);
  };
};
