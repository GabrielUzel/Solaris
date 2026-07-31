import { useTheme } from "../hooks/useTheme";
import Button from "./Button";
import Sun from "../assets/icons/sun.svg?react";
import Moon from "../assets/icons/moon.svg?react";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <Button
      variant="ghost"
      onClick={toggle}
      className="h-8 w-8 p-0 text-secondary-text hover:text-primary-text"
      aria-label="Alternar tema"
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
    </Button>
  );
}
