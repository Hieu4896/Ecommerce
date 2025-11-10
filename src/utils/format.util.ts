/**
 * Định dạng giá tiền
 * @param price - Giá tiền cần định dạng
 * @returns Chuỗi giá tiền đã định dạng
 */
const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

/**
 * Định dạng số thẻ bằng cách xóa tất cả ký tự không phải số, thêm dấu gạch ngang sau mỗi 4 số và giới hạn độ dài tối đa 19 ký tự (16 số + 3 dấu gạch ngang)
 * @param value - Chuỗi số thẻ cần định dạng
 * @returns Chuỗi số thẻ đã định dạng
 */
const formatCardNumber = (value: string): string => {
  // Xóa tất cả ký tự không phải số
  const cleaned = value.replace(/\D/g, "");
  // Thêm dấu gạch ngang sau mỗi 4 số
  const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1-");
  // Giới hạn độ dài tối đa 19 ký tự (16 số + 3 dấu gạch ngang)
  return formatted.substring(0, 19);
};

/**
 * Định dạng ngày hệ thống
 * @param value - Ngày hệ thống cần định dạng
 * @returns Chuỗi ngày hệ thống đã định dạng
 */
const formatExpiryDate = (value: string): string => {
  // Xóa tất cả ký tự không phải số
  const cleaned = value.replace(/\D/g, "");
  // Thêm dấu / sau 2 số đầu tiên
  if (cleaned.length >= 3) {
    return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
  }
  return cleaned;
};

// Hàm định dạng ngày tháng
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export { formatPrice, formatCardNumber, formatExpiryDate, formatDate };
