/**
 * Cấu hình cookies mặc định cho ứng dụng
 */
export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
} as const;

/**
 * Thời gian sống của cookies (tính bằng giây)
 */
export const COOKIE_EXPIRES = {
  ACCESS_TOKEN: 60 * 60, // 60 phút
  REFRESH_TOKEN: 60 * 60 * 7, // 7 ngày
} as const;

/**
 * Tên cookies trong ứng dụng
 */
export const COOKIE_NAMES = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;
