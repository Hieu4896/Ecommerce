import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { shippingSchema } from "../schema/checkout.schema";
import { FormField } from "./FormField";
import type { ShippingAddress } from "@src/types/checkout.type";

/**
 * Props cho ShippingForm component
 */
interface ShippingFormProps {
  onSubmit: (data: ShippingAddress) => void;
  defaultValues?: Partial<ShippingAddress>;
}

/**
 * Component ShippingForm - Form thông tin giao hàng
 * Sử dụng react-hook-form và yup validation
 */
export const ShippingForm: React.FC<ShippingFormProps> = ({ onSubmit, defaultValues }) => {
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(shippingSchema),
    defaultValues: {
      recipientName: "",
      phone: "",
      email: "",
      postalCode: "",
      streetAddress: "",
      detailedAddress: "",
      deliveryNotes: "",
      ...defaultValues,
    },
    mode: "onBlur",
  });

  // Watch tất cả các giá trị để truyền vào FormField
  const formValues = watch();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin giao hàng</h2>

      <form
        onSubmit={handleSubmit((data) => onSubmit(data as ShippingAddress))}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="recipientName"
            label="Tên người nhận"
            value={formValues.recipientName}
            onChange={(e) => setValue("recipientName", e.target.value)}
            error={errors.recipientName?.message}
            placeholder="Nhập tên người nhận"
            required
          />

          <FormField
            id="phone"
            label="Số điện thoại"
            type="tel"
            value={formValues.phone}
            onChange={(e) => setValue("phone", e.target.value)}
            error={errors.phone?.message}
            placeholder="Nhập số điện thoại"
            required
          />

          <FormField
            id="email"
            label="Email"
            type="email"
            value={formValues.email}
            onChange={(e) => setValue("email", e.target.value)}
            error={errors.email?.message}
            placeholder="Nhập email"
            required
          />

          <FormField
            id="postalCode"
            label="Mã bưu chính"
            value={formValues.postalCode}
            onChange={(e) => setValue("postalCode", e.target.value)}
            error={errors.postalCode?.message}
            placeholder="Nhập mã bưu chính"
            required
          />
        </div>

        <FormField
          id="streetAddress"
          label="Địa chỉ giao hàng"
          value={formValues.streetAddress}
          onChange={(e) => setValue("streetAddress", e.target.value)}
          error={errors.streetAddress?.message}
          placeholder="Nhập địa chỉ giao hàng"
          required
        />

        <FormField
          id="detailedAddress"
          label="Địa chỉ chi tiết"
          value={formValues.detailedAddress}
          onChange={(e) => setValue("detailedAddress", e.target.value)}
          placeholder="Số nhà, tên đường, tòa nhà, etc."
        />

        <FormField
          id="deliveryNotes"
          label="Ghi chú giao hàng"
          value={formValues.deliveryNotes}
          onChange={(e) => setValue("deliveryNotes", e.target.value)}
          rows={3}
          placeholder="Ghi chú đặc biệt cho giao hàng (thời gian, hướng dẫn, etc.)"
        />
      </form>
    </div>
  );
};
