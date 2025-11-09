/**
 * Utility functions cho fetch với xử lý authentication
 */

/**
 * Wrapper cho fetch để tự động xử lý lỗi 401
 * @param url - URL để gọi
 * @param options - Fetch options
 * @returns Promise<Response> - Response từ fetch
 */
export const authenticatedFetch = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);

    // Nếu nhận lỗi 401, thử khôi phục session trước khi xóa
    if (response.status === 401) {
      // Import trực tiếp store để gọi restoreSessionFromCookies
      const { useAuthStore } = await import("@src/store/authStore");
      const authStore = useAuthStore.getState();

      // Kkhôi phục session từ cookies
      const restored = await authStore.restoreSessionFromCookies();

      if (!restored) {
        // Nếu không thể khôi phục, xóa localStorage và chuyển hướng
        localStorage.removeItem("auth-storage");
        // Chuyển hướng về trang đăng nhập
        window.location.href = "/login";
        throw new Error("Unauthorized - Session expired");
      }

      // Nếu khôi phục thành công, thử lại request gốc
      return await fetch(url, options);
    }

    return response;
  } catch (error) {
    // Nếu có lỗi network, ném lại lỗi
    throw error;
  }
};

/**
 * Wrapper cho fetch với xử lý lỗi 401 và tự động retry
 * @param url - URL để gọi
 * @param options - Fetch options
 * @param retryCount - Số lần retry (mặc định là 1)
 * @returns Promise<Response> - Response từ fetch
 */
export const authenticatedFetchWithRetry = async (
  url: string,
  options?: RequestInit,
  retryCount: number = 1,
): Promise<Response> => {
  try {
    return await authenticatedFetch(url, options);
  } catch (error) {
    // Nếu là lỗi 401, không retry
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      throw error;
    }

    // Nếu còn lần retry và là lỗi network, thử lại
    if (retryCount > 0 && error instanceof Error) {
      console.log(`Retrying fetch to ${url}, attempts left: ${retryCount}`);
      return await authenticatedFetchWithRetry(url, options, retryCount - 1);
    }

    throw error;
  }
};
