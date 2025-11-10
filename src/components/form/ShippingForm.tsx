import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField } from "./FormField";

/**
 * Component ShippingForm - Form thông tin giao hàng
 * Sử dụng useFormContext để kết nối với form cha
 */
export const ShippingForm: React.FC = () => {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  // Watch các giá trị shipping
  const recipientName = watch("recipientName");
  const phone = watch("phone");
  const email = watch("email");
  const postalCode = watch("postalCode");
  const streetAddress = watch("streetAddress");
  const detailedAddress = watch("detailedAddress");
  const deliveryNotes = watch("deliveryNotes");

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin giao hàng</h2>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="recipientName"
            label="Tên người nhận"
            value={recipientName}
            onChange={(e) => setValue("recipientName", e.target.value)}
            error={errors.recipientName?.message as string}
            placeholder="Nhập tên người nhận"
            required
          />

          <FormField
            id="phone"
            label="Số điện thoại"
            type="tel"
            value={phone}
            onChange={(e) => setValue("phone", e.target.value)}
            error={errors.phone?.message as string}
            placeholder="Nhập số điện thoại"
            required
          />

          <FormField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setValue("email", e.target.value)}
            error={errors.email?.message as string}
            placeholder="Nhập email"
            required
          />

          <FormField
            id="postalCode"
            label="Mã bưu chính"
            value={postalCode}
            onChange={(e) => setValue("postalCode", e.target.value)}
            error={errors.postalCode?.message as string}
            placeholder="Nhập mã bưu chính"
            required
          />
        </div>

        <FormField
          id="streetAddress"
          label="Địa chỉ giao hàng"
          value={streetAddress}
          onChange={(e) => setValue("streetAddress", e.target.value)}
          error={errors.streetAddress?.message as string}
          placeholder="Nhập địa chỉ giao hàng"
          required
        />

        <FormField
          id="detailedAddress"
          label="Địa chỉ chi tiết"
          value={detailedAddress}
          onChange={(e) => setValue("detailedAddress", e.target.value)}
          placeholder="Số nhà, tên đường, tòa nhà, etc."
        />

        <FormField
          id="deliveryNotes"
          label="Ghi chú giao hàng"
          value={deliveryNotes}
          onChange={(e) => setValue("deliveryNotes", e.target.value)}
          rows={3}
          placeholder="Ghi chú đặc biệt cho giao hàng (thời gian, hướng dẫn, etc.)"
        />
      </div>
    </div>
  );
};
