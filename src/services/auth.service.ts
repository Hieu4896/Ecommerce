import { SessionUser, LoginCredentials } from "@src/types/auth.type";
import BaseService from "./base.service";

/**
 * Auth Service Class kế thừa từ Base Service
 * Cung cấp các phương thức để tương tác với Authentication API
 */
class AuthService extends BaseService {
  private static instance: AuthService;

  /**
   * Singleton pattern để đảm bảo chỉ có một instance
   * @returns Instance của AuthService
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Đăng nhập người dùng
   * @param credentials - Thông tin đăng nhập
   * @returns Promise<SessionUser> - Thông tin user sau khi đăng nhập
   */
  public async login(credentials: LoginCredentials): Promise<SessionUser> {
    this.logDebug("Đang thực hiện đăng nhập", { credentials });
    return await this.fetchPostWithTimeout<SessionUser>("/api/auth/login", credentials);
  }

  /**
   * Đăng xuất người dùng
   * @param clearLocalStorage - Có xóa localStorage không
   * @returns Promise<void>
   */
  public async logout(clearLocalStorage = false): Promise<void> {
    this.logDebug("Đang thực hiện đăng xuất", { clearLocalStorage });
    const data = await this.fetchPostWithTimeout<{ clearLocalStorage: boolean }>(
      "/api/auth/logout",
      {},
    );
    // Nếu API trả về flag clearLocalStorage, xóa localStorage (chỉ trên client)
    if (data.clearLocalStorage && typeof window !== "undefined") {
      localStorage.removeItem("auth-storage");
      this.logDebug("Đã xóa localStorage theo yêu cầu của API");
    }
  }

  /**
   * Làm mới token authentication
   * @returns Promise<SessionUser> - Thông tin user mới
   */
  public async refreshToken(): Promise<SessionUser> {
    this.logDebug("Đang làm mới token");
    // Sử dụng retry cho việc refresh token vì đây là background operation quan trọng
    return await this.fetchPostWithRetry<SessionUser>("/api/auth/refresh", {});
  }

  /**
   * Lấy thông tin user hiện tại
   * @returns Promise<SessionUser> - Thông tin user
   */
  public async getCurrentUser(): Promise<SessionUser> {
    this.logDebug("Đang lấy thông tin user hiện tại");

    // Sử dụng retry cho việc lấy thông tin user vì có thể thất bại do network tạm thời
    return await this.fetchGetWithRetry<SessionUser>("/api/auth/me", 3, 1000);
  }
}

// Export instance để sử dụng trong toàn bộ ứng dụng
export const authService = AuthService.getInstance();
