"use client";

import { useEffect } from "react";
import { decodeToken } from "@/lib/decodeToken";
import { useAppDispatch } from "@/store/hooks";
import { logout, markAuthInitialized, restoreAuth } from "@/store/slices/authSlice";
import { normalizeRole } from "@/lib/rbac";

export function AuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userRaw = localStorage.getItem("user");

      if (!token) return;

      const decoded = decodeToken(token);
      const now = Math.floor(Date.now() / 1000);

      if (!decoded || decoded.exp <= now) {
        dispatch(logout());
        return;
      }

      let persistedUser: Record<string, unknown> | null = null;
      if (userRaw) {
        try {
          persistedUser = JSON.parse(userRaw) as Record<string, unknown>;
        } catch {
          persistedUser = null;
        }
      }

      const user = persistedUser
        ? {
            id: String(persistedUser.id ?? decoded.id),
            role: normalizeRole(String(persistedUser.role ?? decoded.role)),
            name: String(persistedUser.name ?? ""),
            email: String(persistedUser.email ?? ""),
            mobileNumber: String(persistedUser.mobileNumber ?? decoded.mobileNumber ?? "")
          }
        : {
            id: String(decoded.id),
            role: normalizeRole(decoded.role),
            name: "",
            email: "",
            mobileNumber: decoded.mobileNumber
          };

      dispatch(restoreAuth({ token, user }));
    } finally {
      dispatch(markAuthInitialized());
    }
  }, [dispatch]);

  return null;
}
