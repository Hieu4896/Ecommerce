import { useEffect, useRef, useCallback } from "react";

/**
 * Custom hook để xử lý infinite scroll
 * @param hasMore - Kiểm tra xem còn dữ liệu để tải không
 * @param isLoading - Trạng thái đang tải
 * @param onLoadMore - Hàm được gọi khi cần tải thêm dữ liệu
 * @param options - Tùy chọn cấu hình
 */
export const useInfiniteScroll = (
  hasMore: boolean,
  isLoading: boolean,
  onLoadMore: () => void,
  options: {
    threshold?: number;
    rootMargin?: string;
  } = {},
) => {
  const { threshold = 0.1, rootMargin = "100px" } = options;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  // Hàm xử lý khi element visible
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;

      // Nếu element visible và còn dữ liệu để tải và không đang tải
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore],
  );

  useEffect(() => {
    const element = triggerRef.current;

    // Nếu không có element hoặc không còn dữ liệu, không làm gì cả
    if (!element || !hasMore) {
      return;
    }

    // Tạo observer mới
    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin,
    });

    // Sử dụng setTimeout để đảm bảo element đã được render hoàn toàn
    // và tránh kích hoạt ngay khi trang tải
    const timeoutId = setTimeout(() => {
      if (observerRef.current && element) {
        observerRef.current.observe(element);
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (observerRef.current) {
        observerRef.current.unobserve(element);
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, hasMore, threshold, rootMargin]);

  // Trả về ref để gán vào trigger element
  return triggerRef;
};
