/**
 * Tạo một API error object với cấu trúc chuẩn theo SWR best practices
 * @param message - Thông báo lỗi
 * @param status - HTTP status code
 * @returns Error object với info và status
 */
export const createApiError = (
  message: string,
  status: number,
): Error & {
  info: { message: string };
  status: number;
} => {
  const error = new Error(message) as Error & {
    info: { message: string };
    status: number;
  };
  error.info = { message };
  error.status = status;
  return error;
};

/**
 * Xử lý và chuyển đổi các loại lỗi khác nhau thành thông báo lỗi thân thiện với người dùng
 * @param error - Đối tượng lỗi cần xử lý
 * @returns Chuỗi thông báo lỗi đã được local hóa
 */
export const getErrorMessage = (error: unknown): string => {
  if (!error) return "";
  // Nếu là Error object với status và info (theo SWR best practices)
  if (error && typeof error === "object" && ("status" in error || "message" in error)) {
    const errors = error as Error & {
      info?: { message?: string; [key: string]: unknown };
      status?: number;
    };

    // Ưu tiên hiển thị message từ error.info nếu có
    if (errors.info?.message) {
      return errors.info.message;
    }

    // Xử lý các loại lỗi cụ thể theo status code
    if (errors.status === 0) {
      return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
    }

    if (errors.status === 404) {
      return "Không tìm thấy dữ liệu yêu cầu.";
    }

    if (errors.status === 408) {
      return "Request hết thời gian chờ. Vui lòng thử lại.";
    }

    if (errors.status === 429) {
      return "Quá nhiều yêu cầu. Vui lòng thử lại sau.";
    }

    if (errors.status && errors.status >= 400 && errors.status < 500) {
      return "Yêu cầu không hợp lệ. Vui lòng thử lại.";
    }

    if (errors.status && errors.status >= 500) {
      return "Lỗi máy chủ. Vui lòng thử lại sau.";
    }

    return errors.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
  }

  // Xử lý các loại lỗi khác
  if (error instanceof Error) {
    if (error.message.includes("fetch")) {
      return "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.";
    }
    if (error.message.includes("timeout")) {
      return "Request hết thời gian chờ. Vui lòng thử lại.";
    }
    return error.message;
  }

  return "Đã xảy ra lỗi không xác định. Vui lòng thử lại.";
};

/**
 * Xử lý timeout error
 * @param url - URL gây ra lỗi
 * @returns Timeout error object
 */
export const createTimeoutError = (): Error & {
  info: { message: string };
  status: number;
} => {
  return createApiError("Request hết thời gian chờ. Vui lòng thử lại.", 408);
};

/**
 * Xử lý network error
 * @param url - URL gây ra lỗi
 * @returns Network error object
 */
export const createNetworkError = (): Error & {
  info: { message: string };
  status: number;
} => {
  return createApiError("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.", 0);
};

/**
 * Xử lý unknown error
 * @param error - Đối tượng lỗi không xác định
 * @param url - URL gây ra lỗi
 * @returns Unknown error object
 */
export const createUnknownError = (
  error: unknown,
): Error & {
  info: { message: string };
  status?: number;
} => {
  const message =
    error instanceof Error
      ? `Lỗi không xác định: ${error.message}`
      : "Đã xảy ra lỗi không xác định. Vui lòng thử lại.";

  const apiError = createApiError(message, 500);
  return apiError as Error & {
    info: { message: string };
    status?: number;
  };
};

/**
 * Xử lý fallback error khi không thể xác định loại lỗi
 * @returns Fallback error object
 */
export const createFallbackError = (): Error & {
  info: { message: string };
  status?: number;
} => {
  return createApiError("Đã xảy ra lỗi không xác định. Vui lòng thử lại.", 500) as Error & {
    info: { message: string };
    status?: number;
  };
};
