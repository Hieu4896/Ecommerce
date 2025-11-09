"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SessionUser, LoginCredentials } from "@src/types/auth.type";
import { authenticatedFetch } from "@src/utils/fetch.util";
import { toSessionUser } from "@src/utils/auth.util";

/**
 * Interface cho state của giỏ hàng
 */
interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

/**
 * Interface cho Auth Store state
 */
interface AuthActions {
  // Thêm các phương thức để cập nhật state
  setUser: (user: SessionUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setLoggingOut: (isLoggingOut: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  restoreSessionFromCookies: () => Promise<boolean>;
}

type AuthStore = AuthState & AuthActions;

/**
 * Auth Store sử dụng Zustand với persist middleware
 * Lưu trữ trạng thái authentication trong localStorage
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State ban đầu
      user: null,
      isLoading: false,
      isLoggingOut: false,
      isAuthenticated: false,
      error: null,

      // Actions để cập nhật state
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      setLoggingOut: (isLoggingOut) => set({ isLoggingOut }),
      setError: (error) => set({ error }),

      /**
       * Hàm đăng nhập
       * @param credentials - Thông tin đăng nhập
       */
      login: async (credentials: LoginCredentials): Promise<void> => {
        set({ isLoading: true, error: null });

        try {
          // Gọi API route để đăng nhập
          const response = await authenticatedFetch("/api/auth/login", {
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

          // Cập nhật state
          set({
            user: sessionUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Đăng nhập thất bại";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Hàm đăng xuất
       */
      logout: async (): Promise<void> => {
        set({ isLoggingOut: true, error: null });

        try {
          // Gọi API route để xóa cookies
          const response = await authenticatedFetch("/api/auth/logout", {
            method: "POST",
          });

          if (response.ok) {
            const data = await response.json();
            // Nếu API trả về flag clearLocalStorage, xóa localStorage
            if (data.clearLocalStorage) {
              localStorage.removeItem("auth-storage");
            }
          }

          // Xóa state trong store
          get().clearAuth();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Đăng xuất thất bại";
          set({
            error: errorMessage,
            isLoggingOut: false,
          });
          throw error;
        } finally {
          set({ isLoggingOut: false });
          // Chuyển hướng về trang đăng nhập
          window.location.href = "/login";
        }
      },

      /**
       * Hàm làm mới token
       */
      refreshAuth: async (): Promise<void> => {
        set({ isLoading: true, error: null });

        try {
          // Gọi API route refresh để làm mới token
          const response = await authenticatedFetch("/api/auth/refresh", {
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
          const userInfoResponse = await authenticatedFetch("/api/auth/me");
          const userInfo = await userInfoResponse.json();
          const sessionUser = toSessionUser(userInfo);

          set({
            user: sessionUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Làm mới token thất bại";
          set({
            error: errorMessage,
            isLoading: false,
          });

          // Nếu không thể làm mới token, đăng xuất người dùng
          if (errorMessage.includes("Không thể làm mới token")) {
            get().clearAuth();
          }

          throw error;
        }
      },

      /**
       * Xóa toàn bộ authentication state
       */
      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
          isLoggingOut: false,
        });
      },

      /**
       * Khôi phục session từ cookies nếu localStorage trống
       */
      restoreSessionFromCookies: async (): Promise<boolean> => {
        // Kiểm tra xem localStorage có trống không
        const hasLocalStorageData = localStorage.getItem("auth-storage");

        if (!hasLocalStorageData) {
          try {
            // Thử gọi API /auth/me để kiểm tra cookies
            const response = await fetch("/api/auth/me");

            if (response.ok) {
              const userInfo = await response.json();
              const sessionUser = toSessionUser(userInfo);

              // Khôi phục lại state trong store
              set({
                user: sessionUser,
                isAuthenticated: true,
                isLoading: false,
              });

              console.log("Đã khôi phục session từ cookies");
              return true;
            }
          } catch (error) {
            console.log("Không thể khôi phục session từ cookies:", error);
          }
        }
        return false;
      },
    }),
    {
      name: "auth-storage", // Tên key trong localStorage
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist các trường cần thiết
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Xử lý khi hydrate state từ localStorage
      onRehydrateStorage: () => (state) => {
        // console.log("Auth state hydrated from localStorage:", state);
      },
    },
  ),
);
