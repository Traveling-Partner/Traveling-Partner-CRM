"use client";

import { useCallback, type CSSProperties } from "react";
import toast, {
  Toaster as HotToaster,
  type ToastOptions
} from "react-hot-toast";

const baseToastStyle: CSSProperties = {
  borderRadius: "0.75rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  padding: "12px 16px",
  maxWidth: "420px",
  boxShadow:
    "0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)"
};

export function useToast() {
  const showToast = useCallback(
    (message: string, options?: ToastOptions) => toast(message, options),
    []
  );

  const success = useCallback(
    (message: string, options?: ToastOptions) =>
      toast.success(message, {
        ...options,
        style: {
          ...baseToastStyle,
          background: "hsl(142 76% 36%)",
          color: "#ffffff",
          border: "1px solid hsl(142 70% 30%)",
          ...options?.style
        }
      }),
    []
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) =>
      toast.error(message, {
        ...options,
        style: {
          ...baseToastStyle,
          background: "hsl(0 72% 51%)",
          color: "#ffffff",
          border: "1px solid hsl(0 65% 45%)",
          ...options?.style
        }
      }),
    []
  );

  return { toast: showToast, success, error };
}

export function ToastProvider() {
  return (
    <HotToaster
      position="top-right"
      gutter={12}
      containerClassName="!top-16"
      toastOptions={{
        duration: 4000,
        style: {
          ...baseToastStyle,
          background: "linear-gradient(135deg, #fce001 0%, #fdb813 100%)",
          color: "#0f172a",
          border: "1px solid rgba(244, 196, 0, 0.4)"
        },
        success: {
          iconTheme: {
            primary: "#ffffff",
            secondary: "hsl(142 76% 36%)"
          }
        },
        error: {
          iconTheme: {
            primary: "#ffffff",
            secondary: "hsl(0 72% 51%)"
          }
        }
      }}
    />
  );
}
