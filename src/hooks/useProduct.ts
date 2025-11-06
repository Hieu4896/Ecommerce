import useSWRInfinite, { SWRInfiniteConfiguration } from "swr/infinite";
import { useMemo } from "react";
import { productService } from "@services/product.service";
import { ProductsResponse } from "@src/types/product.type";

export const useInfiniteProducts = (
  params: { limit?: number; searchQuery?: string } = {},
  config?: SWRInfiniteConfiguration<ProductsResponse>,
) => {
  const { limit = 20, searchQuery } = params;

  /**
   * Hàm để tạo key cho SWR dựa trên trang index
   * @param pageIndex - Index của trang hiện tại
   * @param previousPageData - Dữ liệu của trang trước đó
   * @returns Key cho SWR hoặc null nếu không thể tải thêm
   */
  const getKey = useMemo(() => {
    return (
      pageIndex: number,
      previousPageData: ProductsResponse | null,
    ): string | null => {
      // Nếu đã có dữ liệu từ trang trước và không còn sản phẩm nào, trả về null
      if (previousPageData && previousPageData.products.length === 0) {
        return null;
      }

      // Tính toán skip dựa trên trang hiện tại và limit
      const skip = pageIndex * limit;

      // Xây dựng URL dựa trên loại request
      if (searchQuery) {
        // Nếu có search query, sử dụng endpoint search
        return productService.getSearchProductsUrl(searchQuery, {
          limit,
          skip,
        });
      } else {
        // Mặc định sử dụng endpoint products thông thường
        return productService.getProductsUrl({ limit, skip });
      }
    };
  }, [limit, searchQuery]);

  // Sử dụng useSWRInfinite để fetch dữ liệu
  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<ProductsResponse>(
      getKey,
      (url: string) => productService.swrFetcher<ProductsResponse>(url),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        // Chỉ fetch 1 page ban đầu, không tự động fetch thêm
        initialSize: 1,
        // Ngăn việc persist size giữa re-renders
        persistSize: false,
        ...config,
      },
    );

  // Flatten danh sách sản phẩm từ tất cả các trang
  const products = data ? data.flatMap((page) => page.products) : [];

  // Lấy tổng số sản phẩm từ trang đầu tiên
  const total = data && data[0] ? data[0].total : 0;

  // Kiểm tra xem đã tải hết dữ liệu chưa
  const isReachingEnd =
    data && data[data.length - 1]
      ? data[data.length - 1].products.length < limit ||
        products.length >= total
      : false;

  // Trạng thái đang tải thêm dữ liệu
  const isLoadingMore = isValidating || (isLoading && size > 0);

  /**
   * Hàm để tải thêm dữ liệu
   */
  const loadMore = () => {
    if (!isReachingEnd && !isLoadingMore) {
      setSize(size + 1);
    }
  };

  return {
    products,
    total,
    isLoading,
    isLoadingMore,
    isError: !!error,
    error,
    isReachingEnd,
    loadMore,
    mutate,
    size,
    setSize,
  };
};

/**
 * Custom hook để implement infinite scroll cho tìm kiếm sản phẩm
 * @param query - Từ khóa tìm kiếm
 * @param params - Tham số cấu hình bổ sung
 * @param config - Cấu hình SWR bổ sung
 * @returns Object chứa các phương thức và trạng thái để quản lý infinite scroll
 */
export const useInfiniteSearchProducts = (
  query: string,
  params: { limit?: number } = {},
  config?: SWRInfiniteConfiguration<ProductsResponse>,
) => {
  return useInfiniteProducts(
    {
      ...params,
      searchQuery: query,
    },
    config,
  );
};
