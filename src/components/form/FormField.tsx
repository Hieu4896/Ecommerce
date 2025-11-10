import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

/**
 * Props cho FormField component
 */
interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  // Props cho radio button
  options?: { value: string; label: string }[];
  name?: string;
}

/**
 * Component FormField tái sử dụng cho các input field
 * Hỗ trợ cả input và textarea
 */
export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = "text",
  placeholder,
  required = false,
  error,
  value,
  onChange,
  onBlur,
  className = "",
  rows,
  maxLength,
  disabled = false,
  options,
  name,
}) => {
  const baseClassName = `w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
    error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-primary"
  } ${className}`;

  // Render radio buttons nếu có options
  if (options && name) {
    return (
      <div className="space-y-2">
        <Label>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {options.map((option: { value: string; label: string }) => (
            <Label key={option.value} className="flex items-center" htmlFor={option.value}>
              <input
                id={option.value}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                className="mr-2"
              />
              <span>{option.label}</span>
            </Label>
          ))}
        </div>
        {error && <p className="mt-1 text-sm text-red-500 font-medium animate-fade-in">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {rows ? (
        <Textarea
          id={id}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={baseClassName}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={baseClassName}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-500 font-medium animate-fade-in">{error}</p>}
    </div>
  );
};
