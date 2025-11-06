import { ApiError } from "./api.type";

export interface Review {
  rating: number;
  comment: string;
  date: string; // ISO string
  reviewerName: string;
  reviewerEmail: string;
}

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Meta {
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  barcode?: string;
  qrCode?: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: Dimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: Review[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  meta?: Meta;
  images?: string[];
  thumbnail?: string;
}

/**
 * Interface cho response từ API danh sách sản phẩm
 */
export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Interface cho response từ API chi tiết sản phẩm
 */
export interface ProductResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: Array<{
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }>;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  meta?: {
    createdAt: string;
    updatedAt: string;
    barcode?: string;
    qrCode?: string;
  };
  images?: string[];
  thumbnail?: string;
}

/**
 * Interface cho các tham số query khi lấy danh sách sản phẩm
 */
export interface ProductsQueryParams {
  limit?: number;
  skip?: number;
  select?: string;
  q?: string; // Tham số tìm kiếm theo tên sản phẩm
}

/**
 * Interface cho tham số của useInfiniteProducts
 */
export interface UseInfiniteProductsParams {
  /** Số items mỗi trang, mặc định là 20 */
  limit?: number;
  /** Từ khóa tìm kiếm sản phẩm */
  searchQuery?: string;
  /** Danh mục sản phẩm */
  category?: string;
  /** Các tham số query khác */
  additionalParams?: Omit<ProductsQueryParams, "limit" | "skip" | "q">;
}

/**
 * Interface cho return value của useInfiniteProducts
 */
export interface UseInfiniteProductsReturn {
  /** Danh sách tất cả sản phẩm đã tải */
  products: Product[];
  /** Tổng số sản phẩm có sẵn */
  total: number;
  /** Trạng thái đang tải */
  isLoading: boolean;
  /** Trạng thái đang tải thêm dữ liệu */
  isLoadingMore: boolean;
  /** Trạng thái có lỗi */
  isError: boolean;
  /** Đối tượng lỗi */
  error: ApiError | undefined;
  /** Trạng thái đã tải xong tất cả dữ liệu */
  isReachingEnd: boolean;
  /** Hàm để tải thêm dữ liệu */
  loadMore: () => void;
  /** Hàm để làm mới dữ liệu từ trang đầu tiên */
  mutate: () => void;
  /** Số trang đã tải */
  size: number;
  /** Hàm để đặt lại kích thước pagination */
  setSize: (size: number | ((size: number) => number)) => void;
}
