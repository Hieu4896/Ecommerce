import { ENCRYPTION_KEY, PROTECTED_KEYS } from "@src/constants/storage.constant";
import CryptoJS from "crypto-js";

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
export const encryptData = (data: unknown): string => {
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
export const decryptData = <T = unknown>(encryptedString: string): T => {
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
export const validateAndCleanup = (): void => {
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
