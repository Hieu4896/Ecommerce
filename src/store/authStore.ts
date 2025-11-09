"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SessionUser, LoginCredentials } from "@src/types/auth.type";
import { authService } from "@services/auth.service";
import { getErrorMessage } from "@src/utils/error.util";

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
  restoreSession: () => Promise<boolean>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
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
          // Sử dụng AuthService để đăng nhập
          const sessionUser = await authService.login(credentials);

          // Cập nhật state
          set({
            user: sessionUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = getErrorMessage(error);
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
          // Sử dụng AuthService để đăng xuất
          await authService.logout();

          // Xóa state trong store
          get().clearAuth();
        } catch (error) {
          const errorMessage = getErrorMessage(error);
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
          // Sử dụng AuthService để làm mới token
          const sessionUser = await authService.refreshToken();

          set({
            user: sessionUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = getErrorMessage(error);
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
      restoreSession: async (): Promise<boolean> => {
        // Kiểm tra xem localStorage có trống không
        const hasLocalStorageData = localStorage.getItem("auth-storage");

        if (!hasLocalStorageData) {
          try {
            // Lấy thông tin user sau khi khôi phục thành công
            const sessionUser = await authService.getCurrentUser();
            console.log("sessionUser", sessionUser);

            if (sessionUser) {
              // Cập nhật state
              set({
                user: sessionUser,
                isAuthenticated: true,
                isLoading: false,
              });
            }
            return true;
          } catch (error) {
            console.log("Không thể khôi phục session từ cookies:", getErrorMessage(error));
            return false;
          }
        }
        return false;
      },
    }),
    {
      name: "auth-storage", // Tên key trong localStorage
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist các trường cần thiết
      partialize: (state) => {
        // Nếu không có user hoặc chưa authenticated, không persist gì cả
        if (!state.user || !state.isAuthenticated) {
          return undefined; // Sẽ xóa key khỏi localStorage
        }

        return {
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        };
      },
      // Xử lý khi hydrate state từ localStorage
      onRehydrateStorage: () => (state) => {
        // Nếu không có state hoặc không có user, reset về mặc định
        if (!state || !state.user) {
          return {
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isLoggingOut: false,
            error: null,
          };
        }
        return state;
      },
    },
  ),
);
