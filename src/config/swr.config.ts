import { ProductsResponse } from "@src/types/product.type";
import { SWRInfiniteConfiguration } from "swr/infinite";

const swrConfig: SWRInfiniteConfiguration<ProductsResponse> = {
  // Tắt revalidate khi focus để tránh gọi API không cần thiết khi user quay lại tab
  revalidateOnFocus: false,
};

export default swrConfig;
