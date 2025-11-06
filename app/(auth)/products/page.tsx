"use client";

import { useEffect, useRef } from "react";
import { useInfiniteProducts } from "@src/hooks/useProduct";
import { ProductItem } from "@src/components/product/ProductItem";
import { ProductSkeleton } from "@src/components/product/ProductSkeleton";

/**
 * Component trang sản phẩm với infinite scroll
 */
export default function ProductsPage() {
  const {
    products,
    isLoading,
    isLoadingMore,
    isError,
    error,
    isReachingEnd,
    loadMore,
  } = useInfiniteProducts({ limit: 20 }); // 20 items per load như yêu cầu

  // Ref để theo dõi element cuối cùng cho infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);

  // Thiết lập Intersection Observer cho infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isReachingEnd && !isLoadingMore) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      },
    );

    if (lastElementRef.current) {
      observerRef.current.observe(lastElementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isReachingEnd, isLoadingMore, loadMore, products.length]);

  // Hiển thị loading state ban đầu
  if (isLoading && products.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="grid mobile:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-6">
          {Array.from({ length: 20 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      </main>
    );
  }

  // Hiển thị error state
  if (isError) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Đã có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message || "Không thể tải danh sách sản phẩm"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </main>
    );
  }
  console.log("products", products);

  return (
    <main className="container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Danh sách sản phẩm</h1>
      </div>

      {/* Grid layout với 4 columns */}
      <div className="grid mobile:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4  gap-6">
        {products.map((product, index) => (
          <div
            key={product.id}
            ref={index === products.length - 1 ? lastElementRef : null}
          >
            <ProductItem product={product} />
          </div>
        ))}
      </div>

      {/* Loading state cho infinite scroll */}
      {isLoadingMore && (
        <div className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductSkeleton key={`loading-${index}`} />
            ))}
          </div>
        </div>
      )}

      {/* Thông báo khi đã tải hết dữ liệu */}
      {isReachingEnd && products.length > 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-500">
            Đã hiển thị tất cả {products.length} sản phẩm
          </p>
        </div>
      )}

      {/* Thông báo khi không có sản phẩm nào */}
      {products.length === 0 && !isLoading && !isError && (
        <div className="text-center mt-8">
          <p className="text-gray-500">Không có sản phẩm nào</p>
        </div>
      )}
    </main>
  );
}
