import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100/80 px-4 py-8 dark:from-slate-950 dark:via-slate-950/98 dark:to-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#fce001] to-[#fdb813] shadow-lg shadow-yellow-500/20">
            <span className="text-sm font-bold text-slate-900">TP</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Traveling Partner
            </span>
            <h1 className="text-lg font-heading font-bold text-foreground">
              Traveling Partner Portal
            </h1>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
