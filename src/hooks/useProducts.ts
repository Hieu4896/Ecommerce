import useSWRInfinite, { SWRInfiniteConfiguration } from "swr/infinite";
import { useMemo, useCallback } from "react";
import { productService } from "@services/product.service";
import { ProductsResponse } from "@src/types/product.type";
import { useErrorHandler } from "./useErrorHandler";

export const useProducts = (params: { limit?: number; searchQuery?: string } = {}) => {
  const { limit = 20, searchQuery } = params;

  /**
   * Hàm để tạo key cho SWR dựa trên trang index
   * @param pageIndex - Index của trang hiện tại
   * @param previousPageData - Dữ liệu của trang trước đó
   * @returns Key cho SWR hoặc null nếu không thể tải thêm
   */
  const getKey = useMemo(() => {
    return (pageIndex: number, previousPageData: ProductsResponse | null): string | null => {
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

  // Sử dụng error handler hook để xử lý lỗi tập trung
  const { getErrorMessage, logError } = useErrorHandler();

  // Custom fetcher với xử lý lỗi nâng cao
  const fetcherWithErrorHandling = useCallback(
    async (url: string): Promise<ProductsResponse> => {
      try {
        // Sử dụng fetcher với retry cho các lỗi mạng
        return await productService.swrFetcherWithRetry<ProductsResponse>(url);
      } catch (error) {
        // Log lỗi để debug sử dụng error handler
        logError(error, `Failed to fetch products from ${url}`);
        // Ném lại lỗi để SWR xử lý
        throw error;
      }
    },
    [logError],
  );

  // Cấu hình tối giản cho SWR - chỉ giữ những gì thực sự cần thiết
  const swrConfig: SWRInfiniteConfiguration<ProductsResponse> = {
    // Tắt revalidate khi focus để tránh gọi API không cần thiết khi user quay lại tab
    revalidateOnFocus: false,
  };

  // Sử dụng useSWRInfinite để fetch dữ liệu với xử lý lỗi cải thiện
  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<ProductsResponse>(getKey, fetcherWithErrorHandling, swrConfig);

  // Flatten danh sách sản phẩm từ tất cả các trang
  const products = data ? data.flatMap((page) => page.products) : [];

  // Lấy tổng số sản phẩm từ trang đầu tiên
  const total = data && data[0] ? data[0].total : 0;

  // Kiểm tra xem đã tải hết dữ liệu chưa
  const isReachingEnd =
    data && data[data.length - 1]
      ? data[data.length - 1].products.length < limit || products.length >= total
      : false;

  // Trạng thái đang tải thêm dữ liệu theo SWR best practices
  const isLoadingMore = isValidating || (isLoading && size > 1);

  /**
   * Hàm để tải thêm dữ liệu
   */
  const loadMore = () => {
    if (!isReachingEnd && !isLoadingMore) {
      setSize(size + 1);
    }
  };

  // Hàm để retry thủ công
  const retry = useCallback(() => {
    mutate();
  }, [mutate]);

  // Hàm để reset và tải lại từ đầu
  const resetAndRetry = useCallback(() => {
    setSize(1);
    mutate();
  }, [setSize, mutate]);

  // Hàm để reset khi search query thay đổi
  const resetOnSearchChange = useCallback(() => {
    setSize(1); // Reset về trang đầu tiên
    mutate(); // Trigger re-fetch từ đầu
  }, [setSize, mutate]);

  return {
    products,
    total,
    size,
    isLoading,
    isLoadingMore,
    isError: !!error,
    errorMessage: getErrorMessage(error),
    isReachingEnd,
    loadMore,
    retry,
    resetAndRetry,
    resetOnSearchChange,
    mutate,
    setSize,
  };
};
