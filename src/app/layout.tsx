import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import AuthProvider from "@/providers/auth-provider";

export const metadata: Metadata = {
  title: "FleetTrack Dashboard",
  description: "Modern Fleet Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="transition-colors duration-300">
        <AuthProvider>
          <ThemeProvider>
            {children}

            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={3000}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}