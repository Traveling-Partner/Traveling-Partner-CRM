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
  return <HotToaster position="top-right" />;
}

