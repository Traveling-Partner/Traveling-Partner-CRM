"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import {
  LOGIN_ROUTE,
  getRedirectForRoleOnProtectedRoute
} from "@/lib/rbac";

/** Full-page loader using only inline styles so it always looks correct before Tailwind loads (e.g. on reload). */
function InlineLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "hsl(222.2 84% 4.9%)",
        color: "hsl(210 40% 98%)",
        fontFamily: "var(--font-montserrat), system-ui, sans-serif"
      }}
      aria-hidden
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid hsl(46 100% 52% / 0.3)",
            borderTopColor: "hsl(46 100% 52%)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }}
        />
        <span style={{ fontSize: 14, opacity: 0.9 }}>Loading…</span>
      </div>
      <style dangerouslySetInnerHTML={{ __html: "@keyframes spin { to { transform: rotate(360deg); } }" }} />
    </div>
  );
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [shellReady, setShellReady] = useState(false);

  const { user, isAuthenticated } = useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated
  }));

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Delay rendering the app shell so CSS (Tailwind) is applied before first paint of dashboard/sidebar
  useEffect(() => {
    if (!hydrated || !user) return;
    const t = setTimeout(() => setShellReady(true), 120);
    return () => clearTimeout(t);
  }, [hydrated, user]);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated || !user) {
      router.replace(LOGIN_ROUTE);
      return;
    }

    const redirect = getRedirectForRoleOnProtectedRoute(user.role, pathname);
    if (redirect && redirect !== pathname) {
      router.replace(redirect);
    }
  }, [hydrated, isAuthenticated, user, pathname, router]);

  if (!hydrated) {
    return <InlineLoader />;
  }

  if (!isAuthenticated || !user) {
    return <InlineLoader />;
  }

  if (!shellReady) {
    return <InlineLoader />;
  }

  return <>{children}</>;
}

