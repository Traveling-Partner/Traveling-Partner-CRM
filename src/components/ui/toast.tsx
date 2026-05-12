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
          background: "linear-gradient(90deg, #fce001 0%, #fdb813 100%)",
          color: "#0f172a",
          border: "1px solid #f4c400",
          borderRadius: "calc(var(--radius) - 2px)",
          boxShadow:
            "0 10px 30px -12px rgba(15,23,42,0.35), 0 8px 12px -8px rgba(15,23,42,0.25)"
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

