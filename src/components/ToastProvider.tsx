"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Snackbar, Alert } from "@mui/material";

interface ToastContextValue {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showError: (msg: string) => console.error("[Toast]", msg),
      showSuccess: (msg: string) => console.log("[Toast]", msg),
    };
  }
  return ctx;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: "error" | "success";
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "error",
  });

  const showError = useCallback((message: string) => {
    setToast({ open: true, message, severity: "error" });
  }, []);

  const showSuccess = useCallback((message: string) => {
    setToast({ open: true, message, severity: "success" });
  }, []);

  const handleClose = useCallback(() => {
    setToast((t) => ({ ...t, open: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showError, showSuccess }}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}
