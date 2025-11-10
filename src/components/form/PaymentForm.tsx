import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField } from "./FormField";
import { formatCardNumber, formatExpiryDate } from "@utils/format.util";

/**
 * Component PaymentForm - Form thông tin thanh toán
 * Sử dụng useFormContext để kết nối với form cha
 */
export const PaymentForm: React.FC = () => {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  // Watch các giá trị payment
  const paymentMethod = watch("paymentMethod");
  const cardNumber = watch("cardNumber");
  const cardExpiry = watch("cardExpiry");
  const cardCVV = watch("cardCVV");

  // Xử lý thay đổi card number với auto-format
  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setValue("cardNumber", formatted);
  };

  // Xử lý thay đổi expiry date với auto-format
  const handleExpiryDateChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    setValue("cardExpiry", formatted);
  };

  // Xử lý thay đổi CVV (chỉ cho phép nhập số)
  const handleCVVChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").substring(0, 3);
    setValue("cardCVV", numericValue);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin thanh toán</h2>

      {/* Payment Method */}
      <FormField
        id="paymentMethod"
        label="Phương thức thanh toán"
        name="paymentMethod"
        value={paymentMethod}
        onChange={(e) => setValue("paymentMethod", e.target.value as "card" | "bank" | "cash")}
        error={errors.paymentMethod?.message as string}
        required
        options={[
          { value: "card", label: "Thẻ tín dụng" },
          { value: "bank", label: "Chuyển khoản" },
          { value: "cash", label: "Thanh toán khi nhận hàng (COD)" },
        ]}
      />

      {/* Card Payment Fields */}
      {paymentMethod === "card" && (
        <div className="space-y-4 mt-4">
          <FormField
            id="cardNumber"
            label="Số thẻ"
            value={cardNumber}
            onChange={(e) => handleCardNumberChange(e.target.value)}
            error={errors.cardNumber?.message as string}
            placeholder="1234-5678-9012-3456"
            maxLength={19}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="cardExpiry"
              label="Ngày hết hạn"
              value={cardExpiry}
              onChange={(e) => handleExpiryDateChange(e.target.value)}
              error={errors.cardExpiry?.message as string}
              placeholder="MM/YY"
              maxLength={5}
              required
            />

            <FormField
              id="cardCVV"
              label="CVV"
              value={cardCVV}
              onChange={(e) => handleCVVChange(e.target.value)}
              error={errors.cardCVV?.message as string}
              placeholder="123"
              maxLength={3}
              required
            />
          </div>
        </div>
      )}

      {/* Bank Transfer Info */}
      {paymentMethod === "bank" && (
        <div className="bg-blue-50 p-4 rounded-md mt-4">
          <h3 className="font-medium text-blue-900 mb-2">Thông tin chuyển khoản</h3>
          <p className="text-sm text-blue-800">
            Ngân hàng: Vietcombank
            <br />
            Số tài khoản: 1234567890
            <br />
            Chủ tài khoản: Cửa hàng Pawsy
            <br />
            Nội dung: &quot;Thanh toán đơn hàng [Mã đơn hàng]&quot;
          </p>
        </div>
      )}

      {/* COD Info */}
      {paymentMethod === "cash" && (
        <div className="bg-green-50 p-4 rounded-md mt-4">
          <h3 className="font-medium text-green-900 mb-2">Thanh toán khi nhận hàng (COD)</h3>
          <p className="text-sm text-green-800">
            Bạn sẽ thanh toán bằng tiền mặt khi nhận được hàng. Vui lòng chuẩn bị đủ số tiền để
            thanh toán cho nhân viên giao hàng.
          </p>
        </div>
      )}
    </div>
  );
};
