"use client";

import React, { createContext, useEffect, useState } from "react";
import {
  AuthContextType,
  SessionUser,
  LoginCredentials,
  UserInfo,
  AuthResponse,
  AuthProviderProps,
} from "@src/types/auth.type";

/**
 * Context cho authentication
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Chuyển đổi thông tin user thành SessionUser
 * Hàm này có thể xử lý cả UserInfo và AuthResponse vì chúng có cùng cấu trúc
 * @param userData - Thông tin user từ API (UserInfo hoặc AuthResponse)
 * @returns SessionUser - Thông tin user cho session
 */
const toSessionUser = (userData: UserInfo | AuthResponse): SessionUser => {
  return {
    id: userData.id,
    username: userData.username,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    image: userData.image,
    name: `${userData.firstName} ${userData.lastName}`,
  };
};

/**
 * Provider component cho authentication
 * Quản lý trạng thái đăng nhập của người dùng
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Kiểm tra trạng thái xác thực khi component được mount
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Kiểm tra authentication state từ server-side bằng cách gọi API
        const response = await fetch("/api/auth/me");

        if (response.ok) {
          const userInfo = await response.json();
          const sessionUser = toSessionUser(userInfo);
          setUser(sessionUser);
        } else {
          // Nếu không có token hoặc token không hợp lệ, xóa state
          setUser(null);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái xác thực:", error);
        setError(error instanceof Error ? error.message : "Lỗi không xác định");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * Hàm đăng nhập
   * @param credentials - Thông tin đăng nhập
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Gọi API route để đăng nhập
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Đăng nhập thất bại");
      }

      const authResponse = await response.json();
      const sessionUser = toSessionUser(authResponse);
      setUser(sessionUser);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Đăng nhập thất bại";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Hàm đăng xuất
   */
  const logout = async (): Promise<void> => {
    setIsLoggingOut(true);
    setError(null);

    try {
      // Gọi API route để xóa cookies
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Xóa state trong context
      setUser(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Đăng xuất thất bại";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * Hàm làm mới token
   */
  const refreshAuth = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Gọi API route refresh để làm mới token
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Làm mới token thất bại");
      }

      // Lấy lại thông tin user sau khi làm mới token
      const userInfoResponse = await fetch("/api/auth/me");
      const userInfo = await userInfoResponse.json();
      const sessionUser = toSessionUser(userInfo);
      setUser(sessionUser);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Làm mới token thất bại";
      setError(errorMessage);

      // Nếu không thể làm mới token, đăng xuất người dùng
      if (errorMessage.includes("Không thể làm mới token")) {
        setUser(null);
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Giá trị của context
   */
  const value: AuthContextType = {
    user,
    isLoading,
    isLoggingOut,
    isAuthenticated: !!user,
    login,
    logout,
    refreshAuth,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
