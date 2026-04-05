import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-sky-600 text-white shadow-sm hover:bg-sky-500 focus-visible:outline-sky-500 focus-visible:outline-offset-2 focus-visible:outline-2 dark:bg-sky-500 dark:hover:bg-sky-400",
  secondary:
    "bg-white text-sky-600 border border-sky-600 hover:bg-sky-50 focus-visible:outline-sky-500 focus-visible:outline-offset-2 focus-visible:outline-2 dark:bg-slate-900 dark:text-sky-400 dark:border-slate-800",
  ghost:
    "bg-transparent text-slate-900 hover:bg-slate-100 focus-visible:outline-sky-500 focus-visible:outline-offset-2 focus-visible:outline-2 dark:text-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-3 text-lg",
};

const baseClasses =
  "inline-flex items-center justify-center font-semibold rounded-lg transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-60";

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
      {...props}
    />
  );
}
