import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const variantClasses: Record<Variant, string> = {
  primary: "bg-button-background text-inverted-text hover:bg-button-hover",
  secondary:
    "bg-input-background text-secondary-text hover:bg-hover-background",
  danger: "bg-error text-inverted-text hover:opacity-90",
  ghost: "bg-transparent text-primary-text hover:bg-hover-background",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={[
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
