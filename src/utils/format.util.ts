/**
 * Định dạng giá tiền
 * @param price - Giá tiền cần định dạng
 * @returns Chuỗi giá tiền đã định dạng
 */
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

export { formatPrice };
