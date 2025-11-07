import { NextRequest, NextResponse } from "next/server";

/**
 * API route để xử lý đăng nhập với DummyJSON API
 * Chuyển request từ client đến DummyJSON API và trả về response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, expiresInMins = 60 } = body;

    // Gọi DummyJSON API từ server-side
    const response = await fetch("https://dummyjson.com/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        expiresInMins,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Đăng nhập thất bại" },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Tạo response với cookies
    const apiResponse = NextResponse.json(data);

    // Set cookies trong response
    apiResponse.cookies.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresInMins * 60, // Chuyển phút sang giây
      path: "/",
    });

    apiResponse.cookies.set("refresh_token", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresInMins * 60 * 7, // Refresh token có thời gian sống lâu hơn
      path: "/",
    });

    return apiResponse;
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
