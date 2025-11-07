import { NextResponse } from "next/server";

/**
 * API route để xử lý đăng xuất
 * Xóa cookies và trả về response thành công
 */
export async function POST() {
  try {
    // Tạo response để xóa cookies
    const response = NextResponse.json({ success: true });

    // Xóa access token cookie
    response.cookies.set("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Xóa cookie ngay lập tức
      path: "/",
    });

    // Xóa refresh token cookie
    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Xóa cookie ngay lập tức
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
