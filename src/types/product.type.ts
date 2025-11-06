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
 * Interface cho các tham số query khi lấy danh sách sản phẩm
 */
export interface ProductsQueryParams {
  limit?: number;
  skip?: number;
  select?: string;
  q?: string; // Tham số tìm kiếm theo tên sản phẩm
}
