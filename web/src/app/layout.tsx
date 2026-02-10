import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/session-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nova V2 | Enterprise AI Agent Platform",
  description: "Next-generation cloud browser automation powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-[#020617]`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
