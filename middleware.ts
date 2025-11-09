import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isTokenExpired } from "@utils/token.util";
import { getAccessTokenFromRequest } from "@utils/cookie.util";
import { handleTokenRefreshInMiddleware } from "@utils/token.util";

/**
 * Middleware để bảo vệ routes và xử lý redirect logic
 * Bảo vệ các routes trong (authenticated) folder và xử lý redirect dựa trên authentication status
 */
export async function middleware(request: NextRequest) {
  console.log("middleware đang khởi động");

  const { pathname } = request.nextUrl;

  // Lấy access token từ cookies để kiểm tra authentication status
  const accessToken = getAccessTokenFromRequest(request);
  // const accessToken =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoiY2FydGVyYiIsImVtYWlsIjoiY2FydGVyLmJha2VyQHguZHVtbXlqc29uLmNvbSIsImZpcnN0TmFtZSI6IkNhcnRlciIsImxhc3ROYW1lIjoiQmFrZXIiLCJnZW5kZXIiOiJtYWxlIiwiaW1hZ2UiOiJodHRwczovL2R1bW15anNvbi5jb20vaWNvbi9jYXJ0ZXJiLzEyOCIsImlhdCI6MTc2MjY2NzcyNSwiZXhwIjoxNzYyNjY3ODQ1fQ.kfD1b8d7xlX74Lr0gjVcWikS6ojf2Zm4ZIsaWAKz200";
  console.log("accessToken", accessToken);

  // Xác định user đã xác thực hay chưa
  let isAuthenticated = !!accessToken;

  const response = NextResponse.next();

  // Nếu có access token, kiểm tra xem nó có hết hạn không
  if (accessToken && isTokenExpired(accessToken)) {
    // Sử dụng utility function với error handling
    const refreshSuccess = await handleTokenRefreshInMiddleware(request, response);
    // Cập nhật authentication status dựa trên kết quả refresh
    if (!refreshSuccess) {
      console.log("Làm mới token thất bại, xóa cookies");
      isAuthenticated = false;
    }
  }

  // Danh sách các routes công khai (không cần authentication)
  const publicRoutes = ["/", "/login", "/api/auth"];

  // Kiểm tra nếu route là public route
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Xử lý redirect logic cho homepage
  if (pathname === "/" || pathname === "/login") {
    // Nếu đã xác thực, redirect đến trang products
    if (isAuthenticated) {
      const url = new URL("/products", request.url);
      return NextResponse.redirect(url);
    }
    // Nếu chưa xác thực, cho phép truy cập homepage (sẽ hiển thị login form)
    return response;
  }

  // Bảo vệ các routes trong (authenticated) folder
  if (
    pathname.startsWith("/products") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout")
  ) {
    // Nếu chưa xác thực, redirect đến login page với callbackUrl
    if (!isAuthenticated) {
      const url = new URL("/login", request.url);
      // Thêm callbackUrl để redirect về trang gốc sau khi login thành công
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    // Nếu đã xác thực, cho phép truy cập
    return response;
  }

  // Cho phép truy cập các routes công khai khác
  if (isPublicRoute) {
    return response;
  }

  // Mặc định cho phép truy cập
  return response;
}

/**
 * Cấu hình matcher để middleware chỉ chạy trên các routes cần thiết
 * Bỏ qua các routes không cần kiểm tra như API routes, static assets, etc.
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
