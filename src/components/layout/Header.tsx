"use client";

import { useTheme } from "next-themes";
import { Menu, MoonStar, SunMedium, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
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

interface HeaderProps {
  title?: string;
  onToggleSidebarMobile?: () => void;
}

export function Header({ title, onToggleSidebarMobile }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();

  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border/80 bg-card/95 px-4 shadow-sm backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onToggleSidebarMobile}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex flex-col gap-1">
          {title && (
            <h1 className="text-base font-heading font-semibold leading-tight md:text-lg">
              {title}
            </h1>
          )}
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(isDark ? "light" : "dark")}
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
              className="flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-sm"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-[#fce001] to-[#fdb813] text-xs font-semibold text-slate-900">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") ?? "TP"}
              </span>
              <div className="hidden flex-col text-left text-xs md:flex">
                <span className="font-medium leading-tight">
                  {user?.name ?? "User"}
                </span>
                <span className="text-[0.68rem] uppercase tracking-wide text-muted-foreground">
                  {user?.role === "ADMIN" ? "Admin" : "Sales Agent"}
                </span>
              </div>
              <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="flex flex-col items-start gap-0.5 text-xs">
              <span className="font-medium">{user?.name}</span>
              <span className="text-muted-foreground">{user?.email}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
              className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

