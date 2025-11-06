import { ApiError } from "@src/types/api.type";

/**
 * Base Service Class với các phương thức chung và xử lý lỗi
 * Abstract class làm nền tảng cho các service khác
 */
abstract class BaseService {
  /**
   * Base URL cho API
   */
  protected readonly baseUrl: string = "https://dummyjson.com";

  /**
   * Phương thức fetcher chung cho tất cả API calls
   * @param url - URL để fetch dữ liệu
   * @returns Promise với dữ liệu JSON
   * @throws ApiError với message và status code
   */
  protected async fetcher<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message:
            errorData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
        } as ApiError;
      }

      return await response.json();
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        throw error;
      }

      if (error instanceof Error) {
        throw {
          message: error.message,
        } as ApiError;
      }

      throw {
        message: "Unknown error occurred",
      } as ApiError;
    }
  }

  /**
   * Phương thức fetcher dành riêng cho SWR
   * @param url - URL để fetch dữ liệu
   * @returns Promise với dữ liệu JSON
   */
  protected async swrFetcher<T>(url: string): Promise<T> {
    return this.fetcher<T>(url);
  }

  /**
   * Xây dựng URL với query parameters
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns URL hoàn chỉnh với query string
   */
  protected buildUrl(
    endpoint: string,
    params?: Record<string, unknown>,
  ): string {
    const url = new URL(endpoint, this.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }
}

export default BaseService;
