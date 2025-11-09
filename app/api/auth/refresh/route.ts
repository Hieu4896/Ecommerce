import { NextRequest, NextResponse } from "next/server";
import { getRefreshTokenFromRequest, setAuthCookies } from "@utils/cookie.util";
import { EXPIRESINMINS } from "@src/constants/token.constant";

/**
 * API route để làm mới access token
 * Sử dụng refresh token để lấy access token mới
 */
export async function POST(request: NextRequest) {
  try {
    // Lấy refresh token từ cookies
    const refreshToken = getRefreshTokenFromRequest(request);
    if (!refreshToken) {
      return NextResponse.json({ error: "Không tìm thấy refresh token" }, { status: 401 });
    }

    // Gọi DummyJSON API để làm mới token
    const response = await fetch(`${process.env.DUMMYJSON_API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
        expiresInMins: EXPIRESINMINS || 60, // Mặc định 60 phút
      }),
      credentials: "include",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Không thể làm mới token" }, { status: response.status });
    }

    // Lấy data trên response
    const data = await response.json();

    // Tạo response với cookies mới
    const apiResponse = NextResponse.json(data);

    // Set cookies mới
    setAuthCookies(apiResponse, data.accessToken, data.refreshToken);

    return apiResponse;
  } catch (error) {
    console.error("Lỗi khi làm mới token:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
