import React from "react";

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
  const baseClassName = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
    error ? "border-red-500" : "border-gray-300"
  } ${className}`;

  // Render radio buttons nếu có options
  if (options && name) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="grid grid-cols-3 gap-4">
          {options.map((option: { value: string; label: string }) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                className="mr-2"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {rows ? (
        <textarea
          id={id}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={baseClassName}
          rows={rows}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      ) : (
        <input
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
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
