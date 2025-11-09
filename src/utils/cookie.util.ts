/**
 * Utility functions để quản lý cookies
 */

import { COOKIE_CONFIG, COOKIE_EXPIRES, COOKIE_NAMES } from "@constants/cookie.constant";
import { NextRequest, NextResponse } from "next/server";

/**
 * Set access token vào cookies
 * @param response - NextResponse object
 * @param token - Access token value
 */
export const setAccessTokenCookie = (response: NextResponse, token: string): void => {
  response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, token, {
    ...COOKIE_CONFIG,
    maxAge: COOKIE_EXPIRES.ACCESS_TOKEN,
  });
};

/**
 * Set refresh token vào cookies
 * @param response - NextResponse object
 * @param token - Refresh token value
 */
export const setRefreshTokenCookie = (response: NextResponse, token: string): void => {
  response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, token, {
    ...COOKIE_CONFIG,
    maxAge: COOKIE_EXPIRES.REFRESH_TOKEN,
  });
};

/**
 * Set cả access token và refresh token vào cookies
 * @param response - NextResponse object
 * @param accessToken - Access token value
 * @param refreshToken - Refresh token value
 */
export const setAuthCookies = (
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
): void => {
  setAccessTokenCookie(response, accessToken);
  setRefreshTokenCookie(response, refreshToken);
};

/**
 * Xóa access token cookie
 * @param response - NextResponse object
 */
export const clearAccessTokenCookie = (response: NextResponse): void => {
  response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, "", {
    ...COOKIE_CONFIG,
    maxAge: 0,
  });
};

/**
 * Xóa refresh token cookie
 * @param response - NextResponse object
 */
export const clearRefreshTokenCookie = (response: NextResponse): void => {
  response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, "", {
    ...COOKIE_CONFIG,
    maxAge: 0,
  });
};

/**
 * Xóa tất cả authentication cookies
 * @param response - NextResponse object
 */
export const clearAuthCookies = (response: NextResponse): void => {
  clearAccessTokenCookie(response);
  clearRefreshTokenCookie(response);
};

/**
 * Lấy access token từ request cookies
 * @param request - NextRequest object
 * @returns Access token value hoặc undefined
 */
export const getAccessTokenFromRequest = (request: NextRequest): string | undefined => {
  return request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
};

/**
 * Lấy refresh token từ request cookies
 * @param request - NextRequest object
 * @returns Refresh token value hoặc undefined
 */
export const getRefreshTokenFromRequest = (request: NextRequest): string | undefined => {
  return request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;
};
