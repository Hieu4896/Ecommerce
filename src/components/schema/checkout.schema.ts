import * as yup from "yup";

/**
 * Schema validation cho thông tin giao hàng
 */
export const shippingSchema = yup.object().shape({
  recipientName: yup
    .string()
    .required("Vui lòng nhập tên người nhận")
    .min(2, "Tên phải có ít nhất 2 ký tự"),
  phone: yup
    .string()
    .required("Vui lòng nhập số điện thoại")
    .matches(/^(0[3-9][0-9]{8}|(\+84)[3-9][0-9]{8})$/, "Số điện thoại không hợp lệ"),
  email: yup.string().required("Vui lòng nhập email").email("Email không hợp lệ"),
  postalCode: yup
    .string()
    .required("Vui lòng nhập mã bưu chính")
    .matches(/^\d{5,6}$/, "Mã bưu chính phải gồm 5-6 chữ số"),
  streetAddress: yup.string().required("Vui lòng nhập địa chỉ giao hàng"),
  detailedAddress: yup.string().optional(),
  deliveryNotes: yup.string().optional(),
});

/**
 * Schema validation cho thông tin thanh toán
 */
export const paymentSchema = yup.object().shape({
  paymentMethod: yup
    .string()
    .oneOf(["card", "bank", "cash"], "Phương thức thanh toán không hợp lệ")
    .required("Vui lòng chọn phương thức thanh toán"),
  cardNumber: yup.string().when("paymentMethod", {
    is: "card",
    then: (schema) =>
      schema
        .required("Vui lòng nhập số thẻ")
        .matches(
          /^\d{4}-\d{4}-\d{4}-\d{4}$/,
          "Số thẻ không hợp lệ. Định dạng đúng: 1234-5678-9012-3456",
        ),
    otherwise: (schema) => schema.optional(),
  }),
  cardExpiry: yup.string().when("paymentMethod", {
    is: "card",
    then: (schema) =>
      schema
        .required("Vui lòng nhập ngày hết hạn")
        .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, "Ngày hết hạn không hợp lệ. Định dạng đúng: MM/YY")
        .test("expiry-date", "Thẻ đã hết hạn", (value) => {
          if (!value) return false;
          const [month, year] = value.split("/");
          const currentYear = new Date().getFullYear() % 100;
          const currentMonth = new Date().getMonth() + 1;
          const expiryYear = parseInt(year);
          const expiryMonth = parseInt(month);

          return !(
            expiryYear < currentYear ||
            (expiryYear === currentYear && expiryMonth < currentMonth)
          );
        }),
    otherwise: (schema) => schema.optional(),
  }),
  cardCVV: yup.string().when("paymentMethod", {
    is: "card",
    then: (schema) =>
      schema
        .required("Vui lòng nhập CVV")
        .matches(/^\d{3}$/, "CVV không hợp lệ. Phải gồm 3 chữ số"),
    otherwise: (schema) => schema.optional(),
  }),
});

/**
 * Schema validation cho toàn bộ form checkout
 */
export const checkoutSchema = yup.object().shape({
  // Shipping Address
  recipientName: yup
    .string()
    .required("Vui lòng nhập tên người nhận")
    .min(2, "Tên phải có ít nhất 2 ký tự"),
  phone: yup
    .string()
    .required("Vui lòng nhập số điện thoại")
    .matches(/^(0[3-9][0-9]{8}|(\+84)[3-9][0-9]{8})$/, "Số điện thoại không hợp lệ"),
  email: yup.string().required("Vui lòng nhập email").email("Email không hợp lệ"),
  postalCode: yup
    .string()
    .required("Vui lòng nhập mã bưu chính")
    .matches(/^\d{5,6}$/, "Mã bưu chính phải gồm 5-6 chữ số"),
  streetAddress: yup.string().required("Vui lòng nhập địa chỉ giao hàng"),
  detailedAddress: yup.string().optional(),
  deliveryNotes: yup.string().optional(),

  // Payment Info
  paymentMethod: yup
    .string()
    .oneOf(["card", "bank", "cash"], "Phương thức thanh toán không hợp lệ")
    .required("Vui lòng chọn phương thức thanh toán"),
  cardNumber: yup.string().when("paymentMethod", {
    is: "card",
    then: (schema) =>
      schema
        .required("Vui lòng nhập số thẻ")
        .matches(
          /^\d{4}-\d{4}-\d{4}-\d{4}$/,
          "Số thẻ không hợp lệ. Định dạng đúng: 1234-5678-9012-3456",
        ),
    otherwise: (schema) => schema.optional(),
  }),
  cardExpiry: yup.string().when("paymentMethod", {
    is: "card",
    then: (schema) =>
      schema
        .required("Vui lòng nhập ngày hết hạn")
        .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, "Ngày hết hạn không hợp lệ. Định dạng đúng: MM/YY")
        .test("expiry-date", "Thẻ đã hết hạn", (value) => {
          if (!value) return false;
          const [month, year] = value.split("/");
          const currentYear = new Date().getFullYear() % 100;
          const currentMonth = new Date().getMonth() + 1;
          const expiryYear = parseInt(year);
          const expiryMonth = parseInt(month);

          return !(
            expiryYear < currentYear ||
            (expiryYear === currentYear && expiryMonth < currentMonth)
          );
        }),
    otherwise: (schema) => schema.optional(),
  }),
  cardCVV: yup.string().when("paymentMethod", {
    is: "card",
    then: (schema) =>
      schema
        .required("Vui lòng nhập CVV")
        .matches(/^\d{3}$/, "CVV không hợp lệ. Phải gồm 3 chữ số"),
    otherwise: (schema) => schema.optional(),
  }),
});
