import { NextRequest, NextResponse } from "next/server";

/**
 * API route để làm mới access token
 * Sử dụng refresh token để lấy access token mới
 */
export async function POST(request: NextRequest) {
  try {
    // Lấy refresh token từ cookies
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "Không tìm thấy refresh token" }, { status: 401 });
    }

    // Gọi DummyJSON API để làm mới token
    const response = await fetch("https://dummyjson.com/auth/refresh", {
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
      return NextResponse.json({ error: "Không thể làm mới token" }, { status: response.status });
    }

    const data = await response.json();

    // Tạo response với cookies mới
    const apiResponse = NextResponse.json(data);

    // Set cookies mới
    apiResponse.cookies.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 60 phút
      path: "/",
    });

    apiResponse.cookies.set("refresh_token", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 7, // Refresh token có thời gian sống lâu hơn
      path: "/",
    });

    return apiResponse;
  } catch (error) {
    console.error("Lỗi khi làm mới token:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
