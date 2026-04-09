import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 via-slate-50/80 to-slate-100 px-4 py-8 dark:from-slate-950 dark:via-slate-950/95 dark:to-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-b from-[#fce001] to-[#fdb813]" />
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Traveling Partner
            </span>
            <h1 className="text-lg font-heading font-semibold">
              Traveling Partner Portal
            </h1>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

