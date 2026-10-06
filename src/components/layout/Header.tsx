"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Menu, MoonStar, SunMedium, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useAppDispatch } from "@/store/hooks";
import { patchAuthProfile } from "@/store/slices/authSlice";
import { usePortalUserDetailQuery } from "@/hooks/queries/use-portal-users";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ROLE_LABELS } from "@/lib/roles";
import { toAppRole } from "@/lib/rbac";

interface HeaderProps {
  title?: string;
  onToggleSidebarMobile?: () => void;
}

function looksLikePhone(value: string): boolean {
  return /^\d{8,}$/.test(value.replace(/[\s()+-]/g, ""));
}

function readableName(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || looksLikePhone(trimmed)) return "";
  return trimmed;
}

function nameInitials(name: string): string {
  const letters = name
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z]/g, "")[0])
    .filter(Boolean)
    .slice(0, 2);
  return letters.join("").toUpperCase() || "TP";
}

export function Header({ title, onToggleSidebarMobile }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const { user, logout } = useAuthStore();
  const storedName = readableName(user?.name);
  const profileQuery = usePortalUserDetailQuery(storedName ? undefined : user?.id);
  const profile = profileQuery.data;
  const personName = storedName || readableName(profile?.name);
  const displayName = personName || "User";
  const phone = user?.mobileNumber?.trim() || profile?.mobileNumber?.trim() || "";
  const appRole = toAppRole(user?.role);
  const roleLabel = appRole ? ROLE_LABELS[appRole] : user?.role?.replace(/_/g, " ") || "User";
  const isDark = theme === "dark";

  useEffect(() => {
    if (!profile || storedName) return;
    const name = readableName(profile.name);
    if (!name && !profile.email && !profile.mobileNumber) return;
    dispatch(
      patchAuthProfile({
        name,
        email: profile.email ?? undefined,
        mobileNumber: profile.mobileNumber ?? undefined
      })
    );
  }, [dispatch, profile, storedName]);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/98 px-3 backdrop-blur-xl sm:px-4 md:px-5">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden"
          aria-label="Open navigation menu"
          onClick={onToggleSidebarMobile}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex flex-col gap-0.5 min-w-0">
          {title && (
            <h1 className="truncate text-base font-heading font-semibold leading-tight text-foreground md:text-lg">
              {title}
            </h1>
          )}
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="rounded-lg"
        >
          {isDark ? (
            <SunMedium className="h-4 w-4" />
          ) : (
            <MoonStar className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-xl border border-border/60 px-2.5 py-1 text-sm hover:bg-[var(--brand-light-hover)] hover:border-[#fdb813]/20"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-b from-[#fce001] to-[#fdb813] text-xs font-bold text-slate-900 shadow-sm">
                {nameInitials(personName)}
              </span>
              <div className="hidden flex-col text-left text-xs md:flex">
                <span className="font-semibold leading-tight text-foreground">
                  {displayName}
                </span>
                <span className="text-[0.68rem] uppercase tracking-wide text-muted-foreground">
                  {roleLabel}
                </span>
              </div>
              <ChevronDown className="ml-0.5 h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="flex flex-col items-start gap-0.5 py-2 text-xs">
              <span className="font-semibold text-foreground">{displayName}</span>
              {phone ? <span className="text-muted-foreground">{phone}</span> : null}
              {user?.email ? <span className="text-muted-foreground">{user.email}</span> : null}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
              className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/40 dark:focus:text-red-300"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
