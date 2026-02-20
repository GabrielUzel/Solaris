import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Store } from "@tauri-apps/plugin-store";

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    async function initTheme() {
      try {
        const storeInstance = await Store.load("settings.json");
        setStore(storeInstance);

        const savedTheme = await storeInstance.get<string>("theme");

        if (savedTheme === "dark") {
          setIsDark(true);
          document.documentElement.classList.add("dark");
        } else {
          setIsDark(false);
          document.documentElement.classList.remove("dark");
        }
      } catch (error) {
        console.error("Erro ao carregar tema:", error);
      } finally {
        setIsLoading(false);
      }
    }

    initTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);

      if (newTheme) {
        document.documentElement.classList.add("dark");
        await store?.set("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        await store?.set("theme", "light");
      }

      await store?.save();
    } catch (error) {
      console.error("Erro ao salvar tema:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return context;
}
