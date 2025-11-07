import { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import BaseService from "@src/services/base.service";
import {
  LoginCredentials,
  AuthResponse,
  UserInfo,
  CustomSession,
  SessionUser,
  RefreshTokenResponse,
  ExtendedJWT,
  ExtendedUser,
  ExtendedSession,
} from "@src/types/auth.type";

/**
 * Service xử lý authentication
 */
class AuthService extends BaseService {
  /**
   * Đăng nhập với DummyJSON API
   * @param credentials - Thông tin đăng nhập
   * @returns Promise<AuthResponse> - Thông tin user và tokens
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    this.logDebug("Bắt đầu đăng nhập", { username: credentials.username });

    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Đăng nhập thất bại");
      }

      const data: AuthResponse = await response.json();
      this.logDebug("Đăng nhập thành công", { userId: data.id });
      return data;
    } catch (error) {
      this.logError(
        {
          message: error instanceof Error ? error.message : "Lỗi không xác định",
          status: 0,
        },
        "/auth/login",
      );
      throw error;
    }
  }

  /**
   * Lấy thông tin user hiện tại
   * @param token - Access token
   * @returns Promise<UserInfo> - Thông tin chi tiết user
   */
  async getCurrentUser(token: string): Promise<UserInfo> {
    this.logDebug("Lấy thông tin user hiện tại");

    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Không thể lấy thông tin user");
      }

      const data: UserInfo = await response.json();
      this.logDebug("Lấy thông tin user thành công", { userId: data.id });
      return data;
    } catch (error) {
      this.logError(
        {
          message: error instanceof Error ? error.message : "Lỗi không xác định",
          status: 0,
        },
        "/auth/me",
      );
      throw error;
    }
  }

  /**
   * Làm mới access token
   * @param refreshToken - Refresh token
   * @returns Promise<RefreshTokenResponse> - Tokens mới
   */
  async refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
    this.logDebug("Làm mới access token");

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Không thể làm mới token");
      }

      const data: RefreshTokenResponse = await response.json();
      this.logDebug("Làm mới token thành công");
      return data;
    } catch (error) {
      this.logError(
        {
          message: error instanceof Error ? error.message : "Lỗi không xác định",
          status: 0,
        },
        "/auth/refresh",
      );
      throw error;
    }
  }
}

const authService = new AuthService();

/**
 * Cấu hình NextAuth với Credentials Provider
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      /**
       * Xác thực credentials với DummyJSON API
       * @param credentials - Thông tin đăng nhập từ form
       * @returns Promise<User | null> - Thông tin user hoặc null nếu thất bại
       */
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Sử dụng test credentials theo yêu cầu
          const loginData: LoginCredentials = {
            username: credentials.username,
            password: credentials.password,
          };

          const authResponse = await authService.login(loginData);

          // Tạo user object cho session với thêm thông tin token
          // Sử dụng trực tiếp thông tin từ response login thay vì gọi getCurrentUser
          const user: ExtendedUser = {
            id: String(authResponse.id),
            name: `${authResponse.firstName} ${authResponse.lastName}`,
            email: authResponse.email,
            image: authResponse.image,
            username: authResponse.username,
            firstName: authResponse.firstName,
            lastName: authResponse.lastName,
          };

          // Lưu trữ token và thông tin khác vào user object để sử dụng trong JWT callback
          user.accessToken = authResponse.token;
          user.refreshToken = authResponse.refreshToken;

          return user;
        } catch (error) {
          console.error("Lỗi xác thực:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  },
  callbacks: {
    /**
     * JWT callback - được gọi khi tạo/mở rộng JWT
     * @param token - Token hiện tại
     * @param user - User từ authorize
     * @param account - Account từ provider
     * @returns Promise<JWT> - JWT đã được cập nhật
     */
    async jwt({ token, user, account }): Promise<JWT> {
      const extendedToken = token as ExtendedJWT;

      // Khi đăng nhập thành công
      if (account && user) {
        const extendedUser = user as ExtendedUser;

        // Lưu thông tin user vào token
        extendedToken.user = {
          id: Number(user.id),
          username: extendedUser.username || "",
          email: user.email || "",
          firstName: extendedUser.firstName || "",
          lastName: extendedUser.lastName || "",
          image: user.image || "",
          name: user.name || "",
        };

        // Sử dụng tokens đã lưu từ user object
        if (extendedUser.accessToken) {
          extendedToken.accessToken = extendedUser.accessToken;
          extendedToken.refreshToken = extendedUser.refreshToken;
          extendedToken.expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 ngày
        } else {
          console.error("Không tìm thấy access token trong user object");
          extendedToken.error = "TokenError";
        }

        return extendedToken;
      }

      // Kiểm tra và làm mới token nếu cần (chỉ khi token sắp hết hạn)
      if (
        extendedToken.refreshToken &&
        extendedToken.expiresAt &&
        Date.now() >= extendedToken.expiresAt - 5 * 60 * 1000 // 5 phút trước khi hết hạn
      ) {
        try {
          const refreshResponse = await authService.refreshAccessToken(extendedToken.refreshToken);

          // Cập nhật tokens mới
          extendedToken.accessToken = refreshResponse.token;
          extendedToken.refreshToken = refreshResponse.refreshToken;
          extendedToken.expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 ngày
        } catch (error) {
          console.error("Lỗi làm mới token:", error);
          extendedToken.error = "RefreshAccessTokenError";
        }
      }

      return extendedToken;
    },

    /**
     * Session callback - được gọi khi tạo/mở rộng session
     * @param session - Session hiện tại
     * @param token - Token từ JWT callback
     * @returns Promise<CustomSession> - Session đã được cập nhật
     */
    async session({ session, token }): Promise<CustomSession> {
      const extendedToken = token as ExtendedJWT;
      const extendedSession = session as ExtendedSession;

      // Cập nhật session với thông tin từ token
      if (extendedToken.user) {
        extendedSession.user = extendedToken.user;
      }

      // Thêm các thuộc tính tùy chỉnh vào session
      const customSession: CustomSession = {
        ...session,
        user: extendedToken.user as SessionUser,
        accessToken: extendedToken.accessToken || "",
        refreshToken: extendedToken.refreshToken || "",
        error: extendedToken.error,
      };

      return customSession;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authService;
