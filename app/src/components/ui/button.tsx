import { Icon } from "./icon";

interface ButtonIconProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  children: React.ReactNode;
  icon?: ButtonIconProps;
  iconPosition?: "left" | "right";
}

export default function Button({
  variant = "primary",
  children,
  icon,
  iconPosition = "left",
  ...props
}: ButtonProps) {
  const baseStyles =
    "px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";

  const variants = {
    primary:
      "bg-button-background text-inverted-text hover:bg-button-hover shadow-default hover:shadow-lg active:scale-[0.98]",
    outline:
      "bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-inverted-text",
    ghost:
      "bg-transparent text-primary hover:bg-primary hover:text-inverted-text border border-primary-border",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]}`} {...props}>
      {icon && iconPosition === "left" && (
        <Icon
          src={icon.src}
          alt={icon.alt}
          width={icon.width}
          height={icon.height}
        />
      )}
      {children}
      {icon && iconPosition === "right" && (
        <Icon
          src={icon.src}
          alt={icon.alt}
          width={icon.width}
          height={icon.height}
        />
      )}
    </button>
  );
}
