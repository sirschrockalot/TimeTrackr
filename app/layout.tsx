import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { LayoutProvider } from "./contexts/LayoutContext";
import AuthGuard from "./components/auth/AuthGuard";
import SessionProvider from "./components/auth/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TimeTrackr - Time Tracking Application",
  description: "Professional time tracking and project management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SessionProvider>
          <AuthProvider>
            <DataProvider>
              <LayoutProvider>
                <AuthGuard>
                  {children}
                </AuthGuard>
              </LayoutProvider>
            </DataProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
