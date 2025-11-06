import useSWRInfinite, { SWRInfiniteConfiguration } from "swr/infinite";
import { useMemo, useCallback } from "react";
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

  // Custom fetcher với xử lý lỗi nâng cao
  const fetcherWithErrorHandling = useCallback(
    async (url: string): Promise<ProductsResponse> => {
      try {
        // Sử dụng fetcher với retry cho các lỗi mạng
        return await productService.swrFetcherWithRetry<ProductsResponse>(url);
      } catch (error) {
        // Log lỗi để debug
        if (process.env.NODE_ENV === "development") {
          console.group(`🚨 useInfiniteProducts Error`);
          console.error("URL:", url);
          console.error("Error:", error);
          console.error("Timestamp:", new Date().toISOString());
          console.groupEnd();
        }

        // Ném lại lỗi để SWR xử lý
        throw error;
      }
    },
    [],
  );

  // Sử dụng useSWRInfinite để fetch dữ liệu với xử lý lỗi cải thiện
  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<ProductsResponse>(getKey, fetcherWithErrorHandling, {
      revalidateOnFocus: false,
      revalidateOnReconnect: true, // Kích hoạt khi kết nối lại
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      // Chỉ fetch 1 page ban đầu, không tự động fetch thêm
      initialSize: 1,
      // Ngăn việc persist size giữa re-renders
      persistSize: false,
      // Custom error handling
      onError: (err, key) => {
        // Xử lý lỗi tập trung
        if (process.env.NODE_ENV === "development") {
          console.error(`SWR Error for key ${key}:`, err);
        }
      },
      ...config,
    });

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

  // Xử lý thông báo lỗi thân thiện với người dùng theo SWR best practices
  const getErrorMessage = useCallback(
    (
      error:
        | (Error & {
            info?: { message?: string; [key: string]: unknown };
            status?: number;
          })
        | unknown,
    ): string => {
      if (!error) return "";

      // Nếu là Error object với status và info (theo SWR best practices)
      if (
        error &&
        typeof error === "object" &&
        ("status" in error || "message" in error)
      ) {
        const swrError = error as Error & {
          info?: { message?: string; [key: string]: unknown };
          status?: number;
        };

        // Ưu tiên hiển thị message từ error.info nếu có
        if (swrError.info?.message) {
          return swrError.info.message;
        }

        // Xử lý các loại lỗi cụ thể theo status code
        if (swrError.status === 0) {
          return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
        }

        if (swrError.status === 404) {
          return "Không tìm thấy dữ liệu yêu cầu.";
        }

        if (swrError.status === 408) {
          return "Request hết thời gian chờ. Vui lòng thử lại.";
        }

        if (swrError.status === 429) {
          return "Quá nhiều yêu cầu. Vui lòng thử lại sau.";
        }

        if (
          swrError.status &&
          swrError.status >= 400 &&
          swrError.status < 500
        ) {
          return "Yêu cầu không hợp lệ. Vui lòng thử lại.";
        }

        if (swrError.status && swrError.status >= 500) {
          return "Lỗi máy chủ. Vui lòng thử lại sau.";
        }

        return swrError.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
      }

      // Xử lý các loại lỗi khác
      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          return "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.";
        }
        if (error.message.includes("timeout")) {
          return "Request hết thời gian chờ. Vui lòng thử lại.";
        }
        return error.message;
      }

      return "Đã xảy ra lỗi không xác định. Vui lòng thử lại.";
    },
    [],
  );

  // Hàm để retry thủ công
  const retry = useCallback(() => {
    mutate();
  }, [mutate]);

  // Hàm để reset và tải lại từ đầu
  const resetAndRetry = useCallback(() => {
    setSize(1);
    mutate();
  }, [setSize, mutate]);

  return {
    products,
    total,
    isLoading,
    isLoadingMore,
    isError: !!error,
    errorMessage: getErrorMessage(error),
    isReachingEnd,
    loadMore,
    retry,
    resetAndRetry,
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
