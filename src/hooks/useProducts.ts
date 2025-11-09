import useSWRInfinite from "swr/infinite";
import { useMemo, useCallback } from "react";
import { productService } from "@services/product.service";
import { ProductsResponse } from "@src/types/product.type";
import swrConfig from "@src/config/swr.config";
import { getErrorMessage } from "@utils/error.util";

export const useProducts = (params: { limit?: number; searchQuery?: string } = {}) => {
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
    ): (string | Record<string, number>)[] | null => {
      // Nếu đã có dữ liệu từ trang trước và không còn sản phẩm nào, trả về null
      if (previousPageData && previousPageData.products.length === 0) {
        return null;
      }

      // Tính toán skip dựa trên trang hiện tại và limit
      const skip = pageIndex * limit;

      // Trả về mảng chứa thông tin để fetch
      if (searchQuery) {
        // Nếu có search query, sử dụng phương thức search với retry
        return ["searchWithRetry", searchQuery, { limit, skip }];
      } else {
        // Mặc định sử dụng phương thức get products với retry
        return ["getWithRetry", { limit, skip }];
      }
    };
  }, [limit, searchQuery]);

  const fetcher = useCallback(
    async (key: (string | Record<string, number>)[]): Promise<ProductsResponse> => {
      const [method, ...params] = key;

      switch (method) {
        case "getWithRetry": {
          const [queryParams] = params as [Record<string, number>];
          return await productService.getProductsWithRetry(queryParams);
        }

        case "searchWithRetry": {
          const [query, searchParams] = params as [string, Record<string, number>];
          return await productService.searchProductsWithRetry(query, searchParams);
        }

        default:
          throw new Error(`Unknown fetch method: ${method}`);
      }
    },
    [],
  );

  // Sử dụng useSWRInfinite để fetch dữ liệu với xử lý lỗi từ BaseService
  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<ProductsResponse>(getKey, fetcher, swrConfig);

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
  const loadMore = useCallback(() => {
    if (!isReachingEnd && !isLoadingMore) {
      setSize(size + 1);
    }
  }, [isLoadingMore, isReachingEnd, setSize, size]);

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
