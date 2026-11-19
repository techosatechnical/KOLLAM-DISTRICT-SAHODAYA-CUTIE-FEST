import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/common/ToastNotifications";

export const metadata: Metadata = {
  title: "Kollam District Sahodaya Cuties' Fest 2026–27 | Live Scoreboard",
  description:
    "Official Real-Time Competition Management and Live Scoreboard for Kollam District Sahodaya Cuties' Fest 2026–27 involving 20 participating schools across Category I (LKG & UKG) and Category II (Class I & II).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

