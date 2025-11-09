import * as yup from "yup";

/**
 * Schema validation cho form đăng nhập sử dụng Yup
 */
export const loginSchema = yup
  .object({
    username: yup.string().required("Tên đăng nhập là bắt buộc"),
    password: yup.string().required("Mật khẩu là bắt buộc"),
  })
  .required();
