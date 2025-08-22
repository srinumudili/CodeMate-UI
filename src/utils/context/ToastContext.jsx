import { createContext, useState, useEffect } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => {
        setToast({ message: "", type: "success" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Global toast container in top-right */}
      {toast.message && (
        <div className="toast toast-top toast-end z-50">
          <div
            className={`alert ${
              toast.type === "error" ? "alert-error" : "alert-success"
            } shadow-lg`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export default ToastContext;
