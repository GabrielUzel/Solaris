import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastType = "error" | "success" | "warning" | "info";

type ToastData = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast deve ser usado dentro de ToastProvider");
  }
  return ctx;
}

const colors: Record<ToastType, string> = {
  error: "bg-card-background border-error text-error",
  success: "bg-card-background border-success text-success",
  warning: "bg-card-background border-warning text-warning",
  info: "bg-card-background border-info text-info",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = "error") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed left-4 top-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: (id: number) => void;
}) {
  const [visible, setVisible] = useState(true);
  const dismissRef = useRef(() => {});

  dismissRef.current = () => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => dismissRef.current(), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => dismissRef.current();

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-2xl transition-all duration-300 ${
        visible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
      } ${colors[toast.type]}`}
    >
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={handleClose}
        className="text-lg leading-none opacity-70 hover:opacity-100"
        aria-label="Fechar notificação"
      >
        ✕
      </button>
    </div>
  );
}
