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
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/** How long the redirect may spin before the user gets something to act on. */
const REDIRECT_FALLBACK_MS = 8000;

function SessionExpiredScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div>
        <h1 className="font-heading text-lg font-semibold">Your session has ended</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We could not confirm your login. Please sign in again to continue.
        </p>
      </div>
      <Button type="button" onClick={() => window.location.assign(LOGIN_ROUTE)}>
        Go to login
      </Button>
    </div>
  );
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [hydrated, setHydrated] = useState(false);
  const [redirectStalled, setRedirectStalled] = useState(false);

  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authInitialized = useAppSelector((state) => state.auth.authInitialized);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // A redirect that never lands would otherwise spin forever with no way out
  useEffect(() => {
    if (!hydrated || !authInitialized) return;
    if (isAuthenticated && user) {
      setRedirectStalled(false);
      return;
    }
    const timer = setTimeout(() => setRedirectStalled(true), REDIRECT_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [hydrated, authInitialized, isAuthenticated, user]);

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
    return redirectStalled ? <SessionExpiredScreen /> : <TPLoader variant="fullscreen" />;
  }

  return <>{children}</>;
}
