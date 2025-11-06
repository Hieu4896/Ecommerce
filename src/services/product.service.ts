import { ProductsQueryParams, Product } from "@src/types/product.type";
import BaseService from "./base.service";
import { filterByTitle } from "@src/utils/filterUtils";

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
  public getSearchProductsUrl(
    query: string,
    params?: Omit<ProductsQueryParams, "q">,
  ): string {
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
}

// Export instance của ProductService để sử dụng trong toàn bộ ứng dụng
export const productService = ProductService.getInstance();
