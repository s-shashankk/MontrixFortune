import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

const TOAST_TYPES = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-amber-200 bg-amber-50 text-amber-800",
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const toast = { id, message, type };

    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      dismissToast(id);
    }, 3200);
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-20 right-4 z-[70] w-[calc(100%-2rem)] max-w-sm space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm animate-[fadeIn_0.25s_ease-out] ${
              TOAST_TYPES[toast.type] || TOAST_TYPES.info
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
              <button
                type="button"
                className="text-xs font-semibold opacity-70 hover:opacity-100"
                onClick={() => dismissToast(toast.id)}
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
