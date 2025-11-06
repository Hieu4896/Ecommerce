import { ProductsQueryParams } from "@src/types/product.type";
import { ApiError } from "@src/types/api.type";
import BaseService from "./base.service";

/**
 * Product Service Class kế thừa từ Base Service
 * Cung cấp các phương thức để tương tác với DummyJSON Products API
 */
class ProductService extends BaseService {
  private static instance: ProductService;

  /**
   * Singleton pattern để đảm bảo chỉ có một instance của ProductService
   * @returns Instance của ProductService
   */
  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  /**
   * Lấy URL cho danh sách sản phẩm với pagination
   * @param params - Tham số query (limit, skip, select)
   * @returns URL để fetch danh sách sản phẩm
   */
  public getProductsUrl(params?: ProductsQueryParams): string {
    const queryParams = {
      limit: params?.limit || 20, // Mặc định 20 items cho infinite scroll
      skip: params?.skip || 0,
      select: params?.select,
    };

    return this.buildUrl("/products", queryParams);
  }

  /**
   * Lấy URL cho chi tiết một sản phẩm theo ID
   * @param id - ID của sản phẩm
   * @returns URL để fetch chi tiết sản phẩm
   */
  public getProductUrl(id: number): string {
    return this.buildUrl(`/products/${id}`);
  }

  /**
   * Lấy URL cho tìm kiếm sản phẩm theo từ khóa
   * @param query - Từ khóa tìm kiếm
   * @param params - Tham số query bổ sung (limit, skip, select)
   * @returns URL để tìm kiếm sản phẩm
   */
  public getSearchProductsUrl(
    query: string,
    params?: Omit<ProductsQueryParams, "q">,
  ): string {
    const queryParams = {
      limit: params?.limit || 20,
      skip: params?.skip || 0,
      select: params?.select,
      q: query,
    };

    return this.buildUrl("/products/search", queryParams);
  }

  /**
   * Public method để sử dụng swrFetcher từ bên ngoài với xử lý lỗi nâng cao
   * @param url - URL để fetch dữ liệu
   * @param timeout - Thời gian chờ tối đa (ms)
   * @returns Promise với dữ liệu JSON
   */
  public async swrFetcher<T>(url: string, timeout: number = 10000): Promise<T> {
    try {
      // Thêm timeout cho request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Tạo error object theo SWR best practices với info và status
        const error = new Error(
          errorData.message || `Lỗi HTTP! trạng thái: ${response.status}`,
        ) as Error & {
          info: { message: string; [key: string]: unknown };
          status: number;
        };

        error.info = errorData;
        error.status = response.status;

        // Log lỗi để debug
        this.logError(
          {
            message: error.message,
            status: error.status,
          },
          url,
        );

        throw error;
      }

      return await response.json();
    } catch (error: unknown) {
      // Xử lý các loại lỗi khác nhau theo SWR best practices
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          const timeoutError = new Error(
            "Request hết thời gian chờ. Vui lòng thử lại.",
          ) as Error & {
            info: { message: string };
            status: number;
          };
          timeoutError.info = { message: timeoutError.message };
          timeoutError.status = 408;
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
          const networkError = new Error(
            "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.",
          ) as Error & {
            info: { message: string };
            status: number;
          };
          networkError.info = { message: networkError.message };
          networkError.status = 0;
          this.logError(
            {
              message: networkError.message,
              status: networkError.status,
            },
            url,
          );
          throw networkError;
        }

        // Xử lý các lỗi Error khác
        const unknownError = new Error(
          `Lỗi không xác định: ${error.message}`,
        ) as Error & {
          info: { message: string };
          status?: number;
        };
        unknownError.info = { message: unknownError.message };
        this.logError(
          {
            message: unknownError.message,
          },
          url,
        );
        throw unknownError;
      }

      // Xử lý trường hợp error không phải là Error instance
      if (error && typeof error === "object" && "message" in error) {
        const apiError = error as ApiError;
        const errorObj = new Error(apiError.message) as Error & {
          info: { message: string };
          status: number;
        };
        errorObj.info = { message: apiError.message };
        errorObj.status = apiError.status || 0;
        this.logError(apiError, url);
        throw errorObj;
      }

      const fallbackError = new Error(
        "Đã xảy ra lỗi không xác định. Vui lòng thử lại.",
      ) as Error & {
        info: { message: string };
        status?: number;
      };
      fallbackError.info = { message: fallbackError.message };
      this.logError(
        {
          message: fallbackError.message,
        },
        url,
      );
      throw fallbackError;
    }
  }

  /**
   * Ghi log lỗi để debug
   * @param error - Đối tượng lỗi
   * @param url - URL gây ra lỗi
   */
  private logError(error: ApiError, url: string): void {
    if (process.env.NODE_ENV === "development") {
      console.group(`🚨 Product Service Error`);
      console.error("URL:", url);
      console.error("Message:", error.message);
      console.error("Status:", error.status);
      console.error("Timestamp:", new Date().toISOString());
      console.groupEnd();
    }
  }

  /**
   * Xử lý retry cho các request thất bại
   * @param url - URL để fetch dữ liệu
   * @param retries - Số lần retry tối đa
   * @param delay - Độ trễ giữa các lần retry (ms)
   * @returns Promise với dữ liệu JSON
   */
  public async swrFetcherWithRetry<T>(
    url: string,
    retries: number = 3,
    delay: number = 1000,
  ): Promise<T> {
    let lastError: ApiError;

    for (let i = 0; i <= retries; i++) {
      try {
        return await this.swrFetcher<T>(url);
      } catch (error) {
        lastError = error as ApiError;

        // Nếu là lỗi client (4xx), không retry
        if (
          lastError.status &&
          lastError.status >= 400 &&
          lastError.status < 500
        ) {
          throw lastError;
        }

        // Nếu đã hết lần retry, throw lỗi cuối cùng
        if (i === retries) {
          throw lastError;
        }

        // Đợi trước khi retry
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, i)),
        );
      }
    }

    throw lastError!;
  }
}

// Export instance của ProductService để sử dụng trong toàn bộ ứng dụng
export const productService = ProductService.getInstance();
