import { ProductsQueryParams } from "@src/types/product.type";
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
   * Public method để sử dụng swrFetcher từ bên ngoài
   * @param url - URL để fetch dữ liệu
   * @returns Promise với dữ liệu JSON
   */
  public async swrFetcher<T>(url: string): Promise<T> {
    return super.swrFetcher<T>(url);
  }
}

// Export instance của ProductService để sử dụng trong toàn bộ ứng dụng
export const productService = ProductService.getInstance();
