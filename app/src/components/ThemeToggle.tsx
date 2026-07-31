import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-8 h-8 rounded-lg text-secondary-text hover:bg-hover-background hover:text-primary-text transition-colors"
      aria-label="Alternar tema"
    >
      <img
        src={theme === "dark" ? "/icons/sun.svg" : "/icons/moon.svg"}
        alt={theme === "dark" ? "Tema claro" : "Tema escuro"}
        className="w-5 h-5"
      />
    </button>
  );
}
