import { Cart, CartItem } from "@src/types/cart.type";
import { Product } from "@src/types/product.type";

/**
 * Tính toán giá sau khi giảm giá
 * @param price - Giá gốc
 * @param discountPercentage - Phần trăm giảm giá
 * @returns Giá sau khi giảm giá
 */
export const calculateDiscountedPrice = (price: number, discountPercentage: number = 0): number => {
  return price * (1 - discountPercentage / 100);
};

/**
 * Tạo một CartItem từ Product và quantity
 * @param product - Sản phẩm
 * @param quantity - Số lượng
 * @returns CartItem mới
 */
export const createCartItem = (product: Product, quantity: number): CartItem => {
  const discountPercentage = product.discountPercentage || 0;
  const discountedPrice = calculateDiscountedPrice(product.price, discountPercentage);

  return {
    id: product.id,
    title: product.title,
    price: product.price,
    quantity,
    total: product.price * quantity,
    discountPercentage,
    discountedTotal: discountedPrice * quantity,
    thumbnail: product.thumbnail || "/placeholder.jpg",
  };
};

/**
 * Cập nhật số lượng của một CartItem
 * @param item - CartItem cần cập nhật
 * @param newQuantity - Số lượng mới
 * @returns CartItem đã được cập nhật
 */
export const updateCartItemQuantity = (item: CartItem, newQuantity: number): CartItem => {
  const discountedPrice = calculateDiscountedPrice(item.price, item.discountPercentage);

  return {
    ...item,
    quantity: newQuantity,
    total: item.price * newQuantity,
    discountedTotal: discountedPrice * newQuantity,
  };
};

/**
 * Tính toán tổng giá trị của danh sách CartItem
 * @param items - Danh sách CartItem
 * @returns Tổng giá trị
 */
export const calculateItemsTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.total, 0);
};

/**
 * Tính toán tổng giá trị sau giảm giá của danh sách CartItem
 * @param items - Danh sách CartItem
 * @returns Tổng giá trị sau giảm giá
 */
export const calculateItemsDiscountedTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.discountedTotal, 0);
};

/**
 * Tính toán tổng số lượng của danh sách CartItem
 * @param items - Danh sách CartItem
 * @returns Tổng số lượng
 */
export const calculateItemsQuantity = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

/**
 * Tìm CartItem trong danh sách theo ID
 * @param items - Danh sách CartItem
 * @param productId - ID sản phẩm cần tìm
 * @returns Index của item hoặc -1 nếu không tìm thấy
 */
export const findCartItemIndex = (items: CartItem[], productId: number): number => {
  return items.findIndex((item) => item.id === productId);
};

/**
 * Tạo một Cart mới từ danh sách CartItem
 * @param items - Danh sách CartItem
 * @param userId - ID người dùng
 * @returns Cart mới
 */
export const createCartFromItems = (items: CartItem[], userId: number = 1): Cart => {
  return {
    id: 1,
    userId,
    products: items,
    total: calculateItemsTotal(items),
    discountedTotal: calculateItemsDiscountedTotal(items),
    totalProducts: items.length,
    totalQuantity: calculateItemsQuantity(items),
  };
};

/**
 * Cập nhật Cart với danh sách CartItem mới
 * @param cart - Cart hiện tại
 * @param items - Danh sách CartItem mới
 * @returns Cart đã được cập nhật
 */
export const updateCartWithItems = (cart: Cart, items: CartItem[]): Cart => {
  return {
    ...cart,
    products: items,
    total: calculateItemsTotal(items),
    discountedTotal: calculateItemsDiscountedTotal(items),
    totalProducts: items.length,
    totalQuantity: calculateItemsQuantity(items),
  };
};
