import CryptoJS from "crypto-js";

// Secret key để mã hóa
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || "pawsy-ecommerce-secret-key-2024";

// Danh sách các key cần bảo vệ
const PROTECTED_KEYS = ["auth-storage", "cart-storage", "checkout-storage", "order-storage"];

/**
 * Interface cho dữ liệu được mã hóa
 */
interface EncryptedData {
  data: string;
  checksum: string;
  timestamp: number;
}

/**
 * Mã hóa dữ liệu
 */
const encryptData = (data: unknown): string => {
  try {
    const jsonString = JSON.stringify(data);
    const encryptedData = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
    const checksum = CryptoJS.SHA256(jsonString + ENCRYPTION_KEY).toString();

    const encryptedObject: EncryptedData = {
      data: encryptedData,
      checksum,
      timestamp: Date.now(),
    };

    return JSON.stringify(encryptedObject);
  } catch (error) {
    console.error("Lỗi khi mã hóa dữ liệu:", error);
    throw new Error("Không thể mã hóa dữ liệu");
  }
};

/**
 * Giải mã dữ liệu
 */
const decryptData = <T = unknown>(encryptedString: string): T => {
  try {
    const encryptedObject: EncryptedData = JSON.parse(encryptedString);
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedObject.data, ENCRYPTION_KEY);
    const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      throw new Error("Dữ liệu không thể giải mã");
    }

    const expectedChecksum = CryptoJS.SHA256(decryptedString + ENCRYPTION_KEY).toString();
    if (expectedChecksum !== encryptedObject.checksum) {
      throw new Error("Dữ liệu đã bị thay đổi hoặc không hợp lệ");
    }

    return JSON.parse(decryptedString) as T;
  } catch (error) {
    console.error("Lỗi khi giải mã dữ liệu:", error);
    throw new Error("Dữ liệu localStorage không hợp lệ hoặc đã bị thay đổi");
  }
};

/**
 * Custom storage cho Zustand với mã hóa
 */
export const createSecureStorage = () => {
  return {
    getItem: (name: string): string | null => {
      // Kiểm tra xem có đang ở môi trường client không
      if (typeof window === "undefined") {
        return null;
      }

      try {
        const encryptedItem = localStorage.getItem(name);
        if (!encryptedItem) return null;

        const decryptedData = decryptData(encryptedItem);
        return JSON.stringify(decryptedData);
      } catch (error) {
        console.error(`Lỗi khi đọc ${name} từ localStorage:`, error);
        localStorage.removeItem(name);
        return null;
      }
    },

    setItem: (name: string, value: string): void => {
      // Kiểm tra xem có đang ở môi trường client không
      if (typeof window === "undefined") {
        return;
      }

      try {
        const data = JSON.parse(value);
        const encryptedData = encryptData(data);
        localStorage.setItem(name, encryptedData);
      } catch (error) {
        console.error(`Lỗi khi lưu ${name} vào localStorage:`, error);
        throw new Error("Không thể lưu dữ liệu vào localStorage");
      }
    },

    removeItem: (name: string): void => {
      // Kiểm tra xem có đang ở môi trường client không
      if (typeof window === "undefined") {
        return;
      }

      localStorage.removeItem(name);
    },
  };
};

/**
 * Kiểm tra và dọn dẹp dữ liệu không hợp lệ
 */
const validateAndCleanup = (): void => {
  if (typeof window === "undefined") return;

  PROTECTED_KEYS.forEach((key) => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        // Thử giải mã để kiểm tra tính hợp lệ
        decryptData(item);

        // Kiểm tra tuổi của dữ liệu (24 giờ)
        const encryptedObject: EncryptedData = JSON.parse(item);
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 giờ

        if (now - encryptedObject.timestamp > maxAge) {
          localStorage.removeItem(key);
          console.log(`Đã xóa dữ liệu hết hạn: ${key}`);
        }
      }
    } catch (error) {
      console.error(`Dữ liệu ${key} không hợp lệ, đang xóa:`, error);
      localStorage.removeItem(key);
    }
  });
};

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

/**
 * Xóa an toàn toàn bộ dữ liệu được bảo vệ
 */
export const clearSecureStorage = (): void => {
  if (typeof window === "undefined") return;

  PROTECTED_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
      console.log(`Đã xóa ${key} khỏi localStorage`);
    } catch (error) {
      console.error(`Lỗi khi xóa ${key}:`, error);
    }
  });
};
