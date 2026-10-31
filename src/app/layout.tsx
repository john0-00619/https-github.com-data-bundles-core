import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KingdomFlow — Church Management Platform",
  description: "Your people, gatherings and ministry plans, together in one place. Private, role-based ministry workspaces.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#fdfcfa] text-ink-900 antialiased">
        {children}
      </body>
    </html>
  );
}
