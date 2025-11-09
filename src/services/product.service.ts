import { ProductsQueryParams, Product, ProductsResponse } from "@src/types/product.type";
import BaseService from "./base.service";
import { filterByTitle } from "@utils/filter.util";

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
    // Chỉ select những trường đang được sử dụng trong ProductItem.tsx
    const queryParams = {
      limit: params?.limit || 20, // Mặc định 20 items cho infinite scroll
      skip: params?.skip || 0,
      select: "title,description,price,thumbnail,discountPercentage,rating",
    };

    return this.buildUrl("/products", queryParams);
  }
  /**
   * Lấy URL cho tìm kiếm sản phẩm theo từ khóa
   * @param query - Từ khóa tìm kiếm
   * @param params - Tham số query bổ sung (limit, skip, select)
   * @returns URL để tìm kiếm sản phẩm
   */
  public getSearchProductsUrl(query: string, params?: Omit<ProductsQueryParams, "q">): string {
    const queryParams = {
      limit: params?.limit || 20,
      skip: params?.skip || 0,
      q: query,
    };

    // Log để debug sử dụng logDebug từ BaseService
    const searchUrl = this.buildUrl("/products/search", queryParams);
    this.logDebug("Search URL generated", { url: searchUrl, query });

    return this.buildUrl("/products/search", queryParams);
  }

  /**
   * Lọc sản phẩm theo title ở phía client
   * Sử dụng utility function từ filterUtils để tái sử dụng logic
   * @param products - Danh sách sản phẩm cần lọc
   * @param query - Từ khóa tìm kiếm
   * @returns Danh sách sản phẩm đã lọc
   */
  public filterProductsByTitle(products: Product[], query: string): Product[] {
    return filterByTitle(products, query);
  }

  /**
   * Lấy danh sách sản phẩm với retry mechanism
   * @param params - Tham số query (limit, skip, select)
   * @param retries - Số lần retry tối đa
   * @param delay - Độ trễ giữa các lần retry (ms)
   * @returns Promise với danh sách sản phẩm
   */
  public async getProductsWithRetry(
    params?: ProductsQueryParams,
    retries: number = 3,
    delay: number = 1000,
  ): Promise<ProductsResponse> {
    const url = this.getProductsUrl(params);
    this.logDebug("Fetching products with retry", { url, retries, delay });

    return await this.fetchGetWithRetry<ProductsResponse>(url, retries, delay);
  }

  /**
   * Tìm kiếm sản phẩm theo từ khóa với retry mechanism
   * @param query - Từ khóa tìm kiếm
   * @param params - Tham số query bổ sung (limit, skip, select)
   * @param retries - Số lần retry tối đa
   * @param delay - Độ trễ giữa các lần retry (ms)
   * @returns Promise với kết quả tìm kiếm
   */
  public async searchProductsWithRetry(
    query: string,
    params?: Omit<ProductsQueryParams, "q">,
    retries: number = 3,
    delay: number = 1000,
  ): Promise<ProductsResponse> {
    const url = this.getSearchProductsUrl(query, params);
    this.logDebug("Searching products with retry", { url, query, retries, delay });

    return await this.fetchGetWithRetry<ProductsResponse>(url, retries, delay);
  }
}

// Export instance của ProductService để sử dụng trong toàn bộ ứng dụng
export const productService = ProductService.getInstance();
