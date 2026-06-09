import { type ButtonHTMLAttributes, type ReactNode } from "react";

export function PrimaryButton({
  children,
  icon,
  fullWidth = false,
  className = "",
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-all duration-150 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      style={{
        background: "linear-gradient(135deg, #ff6500, #cc4c00)",
        boxShadow: "0 4px 16px rgba(255,101,0,0.35)",
        ...style,
      }}
    >
      {icon}
      {children}
    </button>
  );
}
