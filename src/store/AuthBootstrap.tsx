"use client";

import { useEffect } from "react";
import { decodeToken } from "@/lib/decodeToken";
import { useAppDispatch } from "@/store/hooks";
import { logout, restoreAuth } from "@/store/slices/authSlice";

export function AuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    if (!token) return;

    const decoded = decodeToken(token);
    const now = Math.floor(Date.now() / 1000);

    if (!decoded || decoded.exp <= now) {
      dispatch(logout());
      return;
    }

    const persistedUser = userRaw ? JSON.parse(userRaw) : null;
    const user = persistedUser
      ? {
          id: String(persistedUser.id ?? decoded.id),
          role: persistedUser.role ?? decoded.role,
          name: persistedUser.name ?? "",
          email: persistedUser.email ?? "",
          mobileNumber: persistedUser.mobileNumber ?? decoded.mobileNumber
        }
      : {
          id: String(decoded.id),
          role: decoded.role,
          name: "",
          email: "",
          mobileNumber: decoded.mobileNumber
        };

    dispatch(restoreAuth({ token, user }));
  }, [dispatch]);

  return null;
}
