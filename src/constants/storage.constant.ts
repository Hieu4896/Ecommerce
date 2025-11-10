// Secret key để mã hóa
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || "pawsy-ecommerce-secret-key-2024";

// Danh sách các key cần bảo vệ
const PROTECTED_KEYS = ["auth-storage", "cart-storage", "checkout-storage", "order-storage"];

export { ENCRYPTION_KEY, PROTECTED_KEYS };
