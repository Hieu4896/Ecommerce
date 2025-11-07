"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@components/button";
import { Input } from "@components/input";
import { Label } from "@components/label";
import { LoginFormProps } from "@src/types/auth.type";

/**
 * Schema validation cho form đăng nhập sử dụng Yup
 */
const loginSchema = yup
  .object({
    username: yup.string().required("Tên đăng nhập là bắt buộc"),
    password: yup.string().required("Mật khẩu là bắt buộc"),
  })
  .required();

/**
 * Type cho form data dựa trên schema
 */
type LoginFormData = yup.InferType<typeof loginSchema>;

/**
 * Component LoginForm để hiển thị form đăng nhập
 * Sử dụng React Hook Form và Yup validation
 */
export default function LoginForm({ callbackUrl = "/products" }: LoginFormProps) {
  const router = useRouter();

  // State để quản lý việc hiển thị/ẩn mật khẩu
  const [showPassword, setShowPassword] = useState(false);

  // Khởi tạo React Hook Form với Yup resolver
  const {
    register,
    handleSubmit,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: "emilys", // Test credentials theo yêu cầu
      password: "emilyspass", // Test credentials theo yêu cầu
    },
  });

  /**
   * Xử lý submit form đăng nhập
   * @param data - Dữ liệu form đã được validate
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        console.log("errors", result.error);

        // Sử dụng setError từ react-hook-form để hiển thị lỗi ở cấp độ form
        setFormError("root", {
          message: "Tên đăng nhập hoặc mật khẩu không đúng",
        });
      } else {
        // Đăng nhập thành công, chuyển hướng đến trang được chỉ định trong callbackUrl
        router.push(callbackUrl);
      }
    } catch {
      // Sử dụng setError từ react-hook-form để hiển thị lỗi ở cấp độ form
      setFormError("root", {
        message: "Có lỗi xảy ra, vui lòng thử lại",
      });
    }
  };

  return (
    <div className="max-w-[70%] m-auto min-h-screen p-12 flex items-center justify-center">
      <div className="w-full space-y-8 ">
        <div className="text-center">
          <h1>Đăng nhập vào tài khoản</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sử dụng tài khoản test: emilys / emilyspass
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 [&_label]:text-primary-foreground [&_input]:text-primary-foreground">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                {...register("username")}
                type="text"
                placeholder="Nhập tên đăng nhập"
              />
              {errors.username && (
                <p className="text-destructive text-sm">{errors.username.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-4 [&_label]:text-primary-foreground [&_input]:text-primary-foreground">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-primary-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password.message}</p>
              )}
            </div>
          </div>

          {errors.root && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md text-sm">
              {errors.root.message}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
      </div>
    </div>
  );
}
