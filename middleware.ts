import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Middleware để bảo vệ routes và xử lý redirect logic
 * Bảo vệ các routes trong (authenticated) folder và xử lý redirect dựa trên authentication status
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lấy token từ request để kiểm tra authentication status
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log("token", token);

  // Xác định user đã xác thực hay chưa
  const isAuthenticated = !!token;

  // Danh sách các routes công khai (không cần authentication)
  const publicRoutes = ["/login", "/api/auth"];

  // Kiểm tra nếu route là public route
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Kiểm tra nếu route là API route
  const isApiRoute = pathname.startsWith("/api");

  // Kiểm tra nếu route là static asset
  const isStaticAsset =
    pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".");

  // Bỏ qua middleware cho API routes và static assets
  if (isApiRoute || isStaticAsset) {
    return NextResponse.next();
  }

  // Xử lý redirect logic cho homepage
  if (pathname === "/") {
    // Nếu đã xác thực, redirect đến trang products
    if (isAuthenticated) {
      const url = new URL("/products", request.url);
      return NextResponse.redirect(url);
    }
    // Nếu chưa xác thực, cho phép truy cập homepage (sẽ hiển thị login form)
    return NextResponse.next();
  }

  // Xử lý redirect logic cho login page
  if (pathname === "/login") {
    // Nếu đã xác thực, redirect đến trang products
    if (isAuthenticated) {
      const url = new URL("/products", request.url);
      return NextResponse.redirect(url);
    }
    // Nếu chưa xác thực, cho phép truy cập login page
    return NextResponse.next();
  }

  // Bảo vệ các routes trong (authenticated) folder
  if (pathname.startsWith("/products") || pathname.startsWith("/cart")) {
    // Nếu chưa xác thực, redirect đến login page với callbackUrl
    if (!isAuthenticated) {
      const url = new URL("/login", request.url);
      // Thêm callbackUrl để redirect về trang gốc sau khi login thành công
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    // Nếu đã xác thực, cho phép truy cập
    return NextResponse.next();
  }

  // Cho phép truy cập các routes công khai khác
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Mặc định cho phép truy cập
  return NextResponse.next();
}

/**
 * Cấu hình matcher để middleware chỉ chạy trên các routes cần thiết
 * Bỏ qua các routes không cần kiểm tra như API routes, static assets, etc.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
