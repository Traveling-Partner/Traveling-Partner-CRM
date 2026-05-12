"use client";

import { useCallback } from "react";
import toast, {
  Toaster as HotToaster,
  type ToastOptions
} from "react-hot-toast";

export function useToast() {
  const showToast = useCallback(
    (message: string, options?: ToastOptions) => toast(message, options),
    []
  );

  const success = useCallback(
    (message: string, options?: ToastOptions) =>
      toast.success(message, options),
    []
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) => toast.error(message, options),
    []
  );

  return { toast: showToast, success, error };
}

export function ToastProvider() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: "linear-gradient(135deg, #fce001 0%, #fdb813 100%)",
          color: "#0f172a",
          border: "1px solid rgba(244,196,0,0.4)",
          borderRadius: "0.75rem",
          fontSize: "0.875rem",
          fontWeight: 500,
          boxShadow:
            "0 10px 25px -5px rgba(253,184,19,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)"
        },
        success: {
          iconTheme: {
            primary: "#0f172a",
            secondary: "#fce001"
          }
        },
        error: {
          iconTheme: {
            primary: "#b91c1c",
            secondary: "#fce001"
          }
        }
      }}
    />
  );
}
