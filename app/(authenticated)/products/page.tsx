"use client";

import { useRef, useState, useCallback } from "react";
import { useProducts } from "@hooks/useProducts";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { ProductItem } from "@src/components/product/ProductItem";
import { ProductSkeleton } from "@src/components/product/ProductSkeleton";
import { Button } from "@components/button";
import { Input } from "@components/input";

export default function ProductsPage() {
  const searchInputRef = useRef<HTMLInputElement>(null); // Ref cho input element
  const [searchQuery, setSearchQuery] = useState(""); // State để trigger re-render khi cần thiết
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
    resetOnSearchChange,
  } = useProducts({
    limit: 20, // Mạc định 20 items cho infinite scroll
    searchQuery, // Truyền state vào hook
  });
  // Áp dụng hook infinite scroll để tự động tải thêm dữ liệu
  const infiniteScrollRef = useInfiniteScroll(
    !isReachingEnd && products.length >= 20, // hasMore - còn dữ liệu để tải và đã có ít nhất 1 trang
    isLoadingMore, // isLoading - đang tải
    loadMore, // onLoadMore - hàm tải thêm
    {
      threshold: 0.1, // Kích hoạt khi 10% element visible
      rootMargin: "20px", // rootMargin để tránh kích hoạt quá sớm
    },
  );

  // Reset search khi có lỗi
  const handleRetry = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
    setSearchQuery(""); // Trigger re-render với query rỗng
    retry();
  }, [retry]);

  // Reset search khi tải lại từ đầu
  const handleResetAndRetry = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
    setSearchQuery(""); // Trigger re-render với query rỗng
    resetAndRetry();
  }, [resetAndRetry]);

  // Xử lý search khi click button
  const handleSearch = useCallback(() => {
    const value = searchInputRef.current?.value || "";
    setSearchQuery(value); // Trigger re-render với query mới
    resetOnSearchChange(); // Reset và fetch lại từ đầu
  }, [resetOnSearchChange]);

  // Xử lý khi nhấn Enter trong input
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch],
  );

  return (
    <main className="container mobile:py-6 laptop:py-12">
      <div className="flex flex-col w-full laptop:flex-row mobile:flex-col-reverse gap-5 mobile:items-start laptop:items-center justify-between mobile:mb-5 laptop:mb-10">
        <h1>Danh sách sản phẩm</h1>
        {/* Search Input */}
        <div className="flex gap-2 mobile:w-full laptop:w-100">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              ref={searchInputRef}
              onKeyUp={handleKeyPress}
              defaultValue={searchQuery}
              disabled={isLoading}
              className="w-full h-10 px-10 bg-gray-100 text-amber-600 border-gray-300 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/* Clear button */}
            {searchQuery && !isLoading && (
              <button
                onClick={() => {
                  if (searchInputRef.current) {
                    searchInputRef.current.value = "";
                  }
                  setSearchQuery(""); // Trigger re-render với query rỗng
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-600"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Search button */}
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="h-10 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tìm kiếm
          </Button>
        </div>
      </div>

      {searchQuery && (
        <div className="mb-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-linear-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-600 border-t-transparent"></div>
                  ) : (
                    <svg
                      className="h-5 w-5 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  )}
                  <h3 className="text-lg font-semibold text-gray-800">
                    {isLoading ? "Đang tìm kiếm..." : "Kết quả tìm kiếm"}
                  </h3>
                </div>
                {!isLoading && searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                    &quot;{searchQuery}&quot;
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Search results  */}
          <div className="px-6 py-4">
            {!isLoading && products.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-800">{products.length}</span>
                  <span className="text-gray-600">sản phẩm được tìm thấy</span>
                </div>
              </div>
            )}

            {!isLoading && !isError && products.length === 0 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 00-5.656 5.656L3.516 21.656a4 4 0 005.656-5.656L17.656 10.344a4 4 0 00-5.656-5.656L21.656 7.756a4 4 0 00-5.656-5.656L14.344 3.172a4 4 0 005.656-5.656L9.172 16.172z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-800 mb-2">
                  Không tìm thấy sản phẩm nào
                </h4>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading Skeleton  */}
      {isLoading && products.length === 0 && (
        <div className="grid mobile:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 gap-6">
          {Array.from({ length: 20 }).map((_, index) => (
            <ProductSkeleton key={`loading-${index}`} />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="text-center">
          <h2 className="text-red-600 mb-4">Đã có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">{errorMessage || "Không thể tải danh sách sản phẩm"}</p>
          <div className="flex justify-center gap-4">
            <Button variant="destructive" size="lg" onClick={handleRetry}>
              Thử lại
            </Button>
            <Button variant="outline" size="lg" onClick={handleResetAndRetry}>
              Tải lại từ đầu
            </Button>
          </div>
        </div>
      )}

      {/* List items */}
      <div className="grid mobile:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductItem product={product} key={product.id} />
        ))}
      </div>

      {/* Loading state cho infinite scroll */}
      {isLoadingMore && (
        <div className="mt-6 grid mobile:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 gap-6">
          {Array.from({ length: 20 }).map((_, index) => (
            <ProductSkeleton key={`loading-${index}`} />
          ))}
        </div>
      )}

      {/* Trigger element cho infinite scroll */}
      {!isReachingEnd && products.length >= 20 && (
        <div ref={infiniteScrollRef} className="flex justify-center mt-6 h-10">
          {isLoadingMore && (
            <div className="flex items-center justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-600 border-t-transparent mr-2"></div>
              <span className="text-gray-600">Đang tải thêm sản phẩm...</span>
            </div>
          )}
        </div>
      )}

      {/* Thông báo khi đã tải hết dữ liệu */}
      {isReachingEnd && products.length > 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-500">Đã hiển thị tất cả {products.length} sản phẩm</p>
        </div>
      )}
    </main>
  );
}
