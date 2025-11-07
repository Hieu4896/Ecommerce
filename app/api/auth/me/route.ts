import { NextRequest, NextResponse } from "next/server";

/**
 * API route để lấy thông tin user hiện tại
 * Kiểm tra token và gọi DummyJSON API nếu có token
 */
export async function GET(request: NextRequest) {
  try {
    // Lấy access token từ cookies
    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Không tìm thấy access token" }, { status: 401 });
    }

    // Gọi DummyJSON API để xác thực token
    const response = await fetch("https://dummyjson.com/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // Nếu token không hợp lệ, xóa cookies
      const apiResponse = NextResponse.json(
        { error: "Token không hợp lệ" },
        { status: response.status },
      );

      // Xóa cookies
      apiResponse.cookies.set("access_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });

      apiResponse.cookies.set("refresh_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });

      return apiResponse;
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
