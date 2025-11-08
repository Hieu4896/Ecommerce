import { NextRequest } from "next/server";
import { handleTokenRefreshInApi } from "@utils/token.util";

/**
 * API route để làm mới access token
 * Sử dụng refresh token để lấy access token mới
 * Sử dụng utility function với error handling
 */
export async function POST(request: NextRequest) {
  return handleTokenRefreshInApi(request);
}
