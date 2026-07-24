import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { Poppins, Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { ReduxProvider } from "@/store/ReduxProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins"
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat"
});

export const metadata: Metadata = {
  title: "Traveling Partner Portal",
  description: "Back-office portal for ride-hailing operations",
  icons: {
    icon: [
      { url: "/favicon.ico?v=5", sizes: "any" },
      { url: "/favicon.png?v=5", type: "image/png", sizes: "16x16" }
    ],
    shortcut: "/favicon.ico?v=5",
    apple: [{ url: "/favicon.png?v=5", type: "image/png", sizes: "16x16" }]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico?v=5" sizes="any" />
        <link rel="icon" href="/favicon.png?v=5" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/favicon.png?v=5" />
      </head>
      <body
        className={`${poppins.variable} ${montserrat.variable} min-h-full font-body antialiased bg-background text-foreground`}
        style={
          {
            // Fallback so styles persist on back/forward navigation
            backgroundColor: "hsl(var(--background))",
            color: "hsl(var(--foreground))"
          } as CSSProperties
        }
      >
        <ReduxProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="traveling-partner-theme">
            <div className="min-h-full bg-background text-foreground">
              {children}
            </div>
            <ToastProvider />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

