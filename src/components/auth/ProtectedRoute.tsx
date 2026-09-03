"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout as logoutAction } from "@/store/slices/authSlice";
import { decodeToken } from "@/lib/decodeToken";
import {
  LOGIN_ROUTE,
  normalizeRole,
  getRedirectForRoleOnProtectedRoute
} from "@/lib/rbac";
import TPLoader from "@/components/TPLoader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [hydrated, setHydrated] = useState(false);

  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authInitialized = useAppSelector((state) => state.auth.authInitialized);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !authInitialized) return;

    const localToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const activeToken = token ?? localToken;

    if (!activeToken || !isAuthenticated || !user) {
      router.replace(LOGIN_ROUTE);
      return;
    }

    const decoded = decodeToken(activeToken);
    const now = Math.floor(Date.now() / 1000);

    if (!decoded || decoded.exp <= now) {
      dispatch(logoutAction());
      router.replace(LOGIN_ROUTE);
      return;
    }

    const normalizedDecodedRole = normalizeRole(decoded.role);
    const normalizedAllowedRoles = allowedRoles?.map((role) => normalizeRole(role));
    if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(normalizedDecodedRole)) {
      router.replace("/403");
      return;
    }

    const redirect = getRedirectForRoleOnProtectedRoute(user.role, pathname);
    if (redirect && redirect !== pathname) {
      router.replace(redirect);
    }
  }, [
    hydrated,
    authInitialized,
    isAuthenticated,
    user,
    pathname,
    router,
    token,
    allowedRoles,
    dispatch
  ]);

  if (!hydrated || !authInitialized) {
    return <TPLoader variant="fullscreen" />;
  }

  if (!isAuthenticated || !user) {
    return <TPLoader variant="fullscreen" />;
  }

  return <>{children}</>;
}
