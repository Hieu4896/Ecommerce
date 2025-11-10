import { ApiError } from "@src/types/api.type";
import {
  createApiError,
  createTimeoutError,
  createNetworkError,
  createUnknownError,
  createFallbackError,
} from "@utils/error.util";

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
   * Xây dựng URL với query parameters
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns URL hoàn chỉnh với query string
   */
  protected buildUrl(endpoint: string, params?: Record<string, unknown>): string {
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

  /**
   * Ghi log lỗi để debug
   * @param error - Đối tượng lỗi
   * @param url - URL gây ra lỗi
   */
  public logError(error: ApiError, url: string): void {
    if (process.env.NODE_ENV === "development") {
      console.group(`🚨 Base Service Error`);
      console.error("URL:", url);
      console.error("Message:", error.message);
      console.error("Status:", error.status);
      console.error("Timestamp:", new Date().toISOString());
      console.groupEnd();
    }
  }

  /**
   * Log thông tin debug trong development mode
   * @param message - Thông điệp debug
   * @param data - Dữ liệu bổ sung (optional)
   */
  public logDebug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === "development") {
      console.group(`🔍 Debug Information`);
      console.log("Message:", message);
      if (data) {
        console.log("Data:", data);
      }
      console.log("Timestamp:", new Date().toISOString());
      console.groupEnd();
    }
  }

  /**
   * Xử lý response từ API
   * @param response - Response object từ fetch
   * @returns JSON data từ response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    return await response.json();
  }

  /**
   * Xử lý lỗi HTTP response
   * @param response - Response object từ fetch
   * @param url - URL đã được gọi
   * @returns ApiError object
   */
  private async handleApiError(response: Response, url: string): Promise<never> {
    const errorData = await response.json().catch(() => ({}));
    const error = createApiError(
      errorData.message || `Lỗi HTTP! trạng thái: ${response.status}`,
      response.status,
    );
    error.info = errorData;
    this.logError(
      {
        message: error.message,
        status: error.status,
      },
      url,
    );
    throw error;
  }

  /**
   * Xử lý các loại lỗi từ fetch request (network, timeout, etc.)
   * Lưu ý: Hàm này không xử lý ApiError vì đã được xử lý ở handleApiError()
   * @param error - Đối tượng lỗi cần xử lý
   * @param url - URL gây ra lỗi
   * @returns Error object đã được xử lý
   */
  private handleFetchError(error: unknown, url: string): never {
    // Nếu là ApiError, throw lại mà không xử lý vì đã được log ở handleApiError()
    if (error && typeof error === "object" && "message" in error && "status" in error) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        const timeoutError = createTimeoutError();
        this.logError(
          {
            message: timeoutError.message,
            status: timeoutError.status,
          },
          url,
        );
        throw timeoutError;
      }

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        const networkError = createNetworkError();
        this.logError(
          {
            message: networkError.message,
            status: networkError.status,
          },
          url,
        );
        throw networkError;
      }

      const unknownError = createUnknownError(error);
      this.logError(
        {
          message: unknownError.message,
        },
        url,
      );
      throw unknownError;
    }

    const fallbackError = createFallbackError();
    this.logError(
      {
        message: fallbackError.message,
      },
      url,
    );
    throw fallbackError;
  }

  /**
   * Thực hiện fetch request với timeout
   * @param url - URL để fetch
   * @param timeout - Thời gian chờ tối đa (ms)
   * @returns Response object
   */
  private async fetchWithTimeout(url: string, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Thực hiện POST request với timeout
   * @param url - URL để gửi request
   * @param data - Dữ liệu để gửi trong body
   * @param timeout - Thời gian chờ tối đa (ms)
   * @returns Promise với dữ liệu JSON
   */
  protected async fetchPostWithTimeout<T>(
    url: string,
    data: unknown,
    timeout: number = 10000,
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Kiểm tra response status trước khi xử lý
      if (!response.ok) {
        return await this.handleApiError(response, url);
      }

      return await this.handleResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleFetchError(error, url);
    }
  }

  /**
   * Thực hiện PUT request với timeout
   * @param url - URL để gửi request
   * @param data - Dữ liệu để gửi trong body
   * @param timeout - Thời gian chờ tối đa (ms)
   * @returns Promise với dữ liệu JSON
   */
  protected async fetchPutWithTimeout<T>(
    url: string,
    data: unknown,
    timeout: number = 10000,
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Kiểm tra response status trước khi xử lý
      if (!response.ok) {
        return await this.handleApiError(response, url);
      }

      return await this.handleResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleFetchError(error, url);
    }
  }

  /**
   * Thực hiện POST request với retry và timeout
   * @param url - URL để gửi request
   * @param data - Dữ liệu để gửi trong body
   * @param retries - Số lần retry tối đa
   * @param delay - Độ trễ giữa các lần retry (ms)
   * @returns Promise với dữ liệu JSON
   */
  protected async fetchPostWithRetry<T>(
    url: string,
    data: unknown,
    retries: number = 3,
    delay: number = 1000,
  ): Promise<T> {
    let lastError: ApiError;

    for (let i = 0; i <= retries; i++) {
      try {
        return await this.fetchPostWithTimeout<T>(url, data);
      } catch (error) {
        lastError = error as ApiError;

        // Nếu là lỗi client (4xx), không retry
        if (lastError.status && lastError.status >= 400 && lastError.status < 500) {
          throw lastError;
        }

        // Nếu đã hết lần retry, throw lỗi cuối cùng
        if (i === retries) {
          throw lastError;
        }

        // Đợi trước khi retry với exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }

    throw lastError!;
  }

  /**
   * Public method để thực hiện GET request với timeout
   * @param url - URL để fetch dữ liệu
   * @param timeout - Thời gian chờ tối đa (ms)
   * @returns Promise với dữ liệu JSON
   */
  public async fetchGetWithTimeout<T>(url: string, timeout: number = 10000): Promise<T> {
    try {
      const response = await this.fetchWithTimeout(url, timeout);

      // Kiểm tra response status trước khi xử lý
      if (!response.ok) {
        return await this.handleApiError(response, url);
      }

      return await this.handleResponse(response);
    } catch (error: unknown) {
      throw this.handleFetchError(error, url);
    }
  }

  /**
   * Public method để thực hiện GET request với retry và timeout
   * @param url - URL để fetch dữ liệu
   * @param retries - Số lần retry tối đa
   * @param delay - Độ trễ giữa các lần retry (ms)
   * @returns Promise với dữ liệu JSON
   */
  public async fetchGetWithRetry<T>(
    url: string,
    retries: number = 3,
    delay: number = 1000,
  ): Promise<T> {
    let lastError: ApiError;

    for (let i = 0; i <= retries; i++) {
      try {
        return await this.fetchGetWithTimeout<T>(url);
      } catch (error) {
        lastError = error as ApiError;

        // Nếu là lỗi client (4xx), không retry
        if (lastError.status && lastError.status >= 400 && lastError.status < 500) {
          throw lastError;
        }

        // Nếu đã hết lần retry, throw lỗi cuối cùng
        if (i === retries) {
          throw lastError;
        }

        // Đợi trước khi retry với exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }

    throw lastError!;
  }
}

export default BaseService;
