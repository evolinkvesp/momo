"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-2 ml-4 text-[11px] font-bold uppercase tracking-widest"
      style={{ color: "#555" }}
    >
      {children}
    </h2>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[20px] ${className}`}
      style={{ background: "#1a1a1a", border: "1px solid #2d2d2d" }}
    >
      {children}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="ml-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#555" }}>
        {label}
      </label>
      {children}
      {hint && <p className="ml-1 text-[11px] font-medium" style={{ color: "#555" }}>{hint}</p>}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  readOnly,
  inputMode,
  min,
  step,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  readOnly?: boolean;
  inputMode?: "text" | "numeric" | "decimal";
  min?: number;
  step?: number;
}) {
  return (
    <input
      type={type}
      className={`input-standard ${readOnly ? "cursor-not-allowed opacity-50" : ""}`}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      readOnly={readOnly}
      inputMode={inputMode}
      min={min}
      step={step}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      className="input-standard appearance-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function SaveButton({
  loading,
  children = "Salvar alterações",
  onClick,
  disabled,
}: {
  loading?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="btn-primary mt-2 w-full py-4"
    >
      {loading ? <LoadingSpinner size="sm" /> : children}
    </button>
  );
}
