"use client";

import { useTheme } from "next-themes";
import { Menu, MoonStar, SunMedium, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { HeaderAuditLogBell } from "@/components/layout/HeaderAuditLogBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ROLE_LABELS, ROLES } from "@/lib/roles";
import { toAppRole } from "@/lib/rbac";

interface HeaderProps {
  title?: string;
  onToggleSidebarMobile?: () => void;
}

export function Header({ title, onToggleSidebarMobile }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const displayName = user?.name?.trim() || user?.mobileNumber || "User";
  const appRole = toAppRole(user?.role);
  const showAuditBell = appRole === ROLES.ADMIN;

  const isDark = theme === "dark";

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
        {showAuditBell ? <HeaderAuditLogBell /> : null}
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
                {displayName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") ?? "TP"}
              </span>
              <div className="hidden flex-col text-left text-xs md:flex">
                <span className="font-semibold leading-tight text-foreground">
                  {displayName}
                </span>
                <span className="text-[0.68rem] uppercase tracking-wide text-muted-foreground">
                  {ROLE_LABELS[toAppRole(user?.role) ?? "AGENT"] ?? user?.role ?? "User"}
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
              <span className="text-muted-foreground">{user?.email}</span>
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
