"use client";

import { useInfiniteProducts } from "@src/hooks/useProduct";
import { ProductItem } from "@src/components/product/ProductItem";
import { ProductSkeleton } from "@src/components/product/ProductSkeleton";
import { Button } from "@src/components/ui/button";

/**
 * Component trang sản phẩm với infinite scroll
 */
export default function ProductsPage() {
  console.log("products page render");

  const {
    products,
    isLoading,
    isLoadingMore,
    isError,
    errorMessage,
    isReachingEnd,
    loadMore,
    retry,
    resetAndRetry,
  } = useInfiniteProducts({ limit: 20 }); // 20 items per load như yêu cầu

  // Hiển thị loading state ban đầu
  if ((isLoading && products.length === 0) || isError) {
    return (
      <main className="container mobile:py-6 laptop:py-12">
        <h1 className="text-3xl font-bold mb-10 text-white">
          Danh sách sản phẩm
        </h1>
        {isError ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Đã có lỗi xảy ra
            </h2>
            <p className="text-gray-600 mb-4">
              {errorMessage || "Không thể tải danh sách sản phẩm"}
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="destructive" size="lg" onClick={retry}>
                Thử lại
              </Button>
              <Button variant="outline" size="lg" onClick={resetAndRetry}>
                Tải lại từ đầu
              </Button>
            </div>
            {/* Hiển thị chi tiết lỗi trong môi trường development */}
            {process.env.NODE_ENV === "development" && isError && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Chi tiết lỗi (Development)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  {errorMessage}
                </pre>
              </details>
            )}
          </div>
        ) : (
          <div className="grid mobile:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-6">
            {Array.from({ length: 20 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        )}
      </main>
    );
  }

  console.log("products", products);

  return (
    <main className="container mobile:py-6 laptop:py-12">
      <h1 className="text-3xl font-bold mb-10 text-white">
        Danh sách sản phẩm
      </h1>

      {/* Grid layout với 4 columns */}
      <div className="grid mobile:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4  gap-6">
        {products.map((product) => (
          <div key={product.id}>
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

      {/* Nút Load More */}
      {!isReachingEnd && products.length > 0 && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoadingMore}
            size="lg"
            className="px-8"
          >
            {isLoadingMore ? "Đang tải..." : "Tải thêm"}
          </Button>
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
