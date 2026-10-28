import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "KingdomFlow — Members. Ministry. Growth. One Platform.",
  description:
    "Modern church management platform for churches, campus fellowships and Christian ministries across Ghana, Africa and the world.",
  keywords: [
    "church management",
    "ministry software",
    "member management",
    "attendance tracking",
    "church giving",
    "Ghana churches",
    "Africa church software",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
