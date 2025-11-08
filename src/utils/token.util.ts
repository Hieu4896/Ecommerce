/**
 * Utility functions để quản lý token và refresh logic
 */

import { NextRequest, NextResponse } from "next/server";
import { getRefreshTokenFromRequest, setAuthCookies, clearAuthCookies } from "./cookie.util";

/**
 * Kiểm tra xem JWT token có hết hạn không bằng cách decode payload
 * @param token - JWT token cần kiểm tra
 * @returns true nếu token hết hạn, false nếu còn hạn
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    // Decode payload của JWT token (phần giữa của token)
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("payload", payload);

    // Kiểm tra thời gian hết hạn (exp là timestamp tính bằng giây)
    const currentTime = Math.floor(Date.now() / 1000);

    // Log thời gian cụ thể để dễ đọc
    const expTime = new Date(payload.exp * 1000);
    const nowTime = new Date(currentTime * 1000);
    console.log("Token expiration time (Local):", expTime.toLocaleString());
    console.log("Current time (Local):", nowTime.toLocaleString());
    console.log("Timestamp exp:", payload.exp);
    console.log("Timestamp current:", currentTime);
    console.log("Is expired:", payload.exp < currentTime);

    return payload.exp < currentTime;
  } catch (error) {
    // Nếu không thể decode token, coi như đã hết hạn
    console.error("Lỗi khi kiểm tra token:", error);
    return true;
  }
};

/**
 * Kết quả của việc refresh token
 */
export interface RefreshTokenResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

/**
 * Gọi API để refresh token với error handling
 * @param request - NextRequest object
 * @returns Promise<RefreshTokenResult> - Kết quả của việc refresh token
 */
export const refreshAccessToken = async (request: NextRequest): Promise<RefreshTokenResult> => {
  try {
    // Lấy refresh token từ request
    const refreshToken = getRefreshTokenFromRequest(request);

    if (!refreshToken) {
      return {
        success: false,
        error: "Không tìm thấy refresh token",
      };
    }

    // Gọi API refresh token
    const response = await fetch(`${process.env.DUMMYJSON_API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
        expiresInMins: 60, // Mặc định 60 phút
      }),
    });

    if (!response.ok) {
      // Xử lý các loại lỗi khác nhau
      if (response.status === 401) {
        return {
          success: false,
          error: "Refresh token không hợp lệ hoặc đã hết hạn",
        };
      } else if (response.status >= 500) {
        return {
          success: false,
          error: "Lỗi server khi làm mới token",
        };
      } else {
        return {
          success: false,
          error: `Lỗi khi làm mới token: ${response.status}`,
        };
      }
    }

    // Parse response data
    const data = await response.json();

    return {
      success: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    console.error("Lỗi khi làm mới token:", error);
    return {
      success: false,
      error: "Lỗi không xác định khi làm mới token",
    };
  }
};

/**
 * Xử lý token refresh trong middleware với error handling
 * @param request - NextRequest object
 * @param response - NextResponse object
 * @returns Promise<boolean> - True nếu refresh thành công, false nếu thất bại
 */
export const handleTokenRefreshInMiddleware = async (
  request: NextRequest,
  response: NextResponse,
): Promise<boolean> => {
  console.log("Access token đã hết hạn, đang làm mới...");

  try {
    const refreshResult = await refreshAccessToken(request);

    if (refreshResult.success && refreshResult.accessToken && refreshResult.refreshToken) {
      // Set cookies mới vào response
      setAuthCookies(response, refreshResult.accessToken, refreshResult.refreshToken);
      console.log("Làm mới token thành công");
      return true;
    } else {
      // Xóa cookies cũ nếu refresh thất bại
      clearAuthCookies(response);
      console.log(`Không thể làm mới token: ${refreshResult.error}`);
      return false;
    }
  } catch (error) {
    console.error("Lỗi không xác định khi xử lý refresh token:", error);
    clearAuthCookies(response);
    return false;
  }
};

/**
 * Xử lý token refresh trong API route với error handling
 * @param request - NextRequest object
 * @returns Promise<NextResponse> - Response với cookies mới hoặc error
 */
export const handleTokenRefreshInApi = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const refreshResult = await refreshAccessToken(request);

    if (refreshResult.success && refreshResult.accessToken && refreshResult.refreshToken) {
      // Tạo response với data mới
      const apiResponse = NextResponse.json({
        accessToken: refreshResult.accessToken,
        refreshToken: refreshResult.refreshToken,
      });

      // Set cookies mới vào response
      setAuthCookies(apiResponse, refreshResult.accessToken, refreshResult.refreshToken);

      return apiResponse;
    } else {
      // Trả về error response
      return NextResponse.json(
        { error: refreshResult.error || "Không thể làm mới token" },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("Lỗi không xác định khi xử lý refresh token trong API:", error);
    return NextResponse.json({ error: "Lỗi server khi làm mới token" }, { status: 500 });
  }
};
