import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wallet AI",
  description: "AI-powered personal finance tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0d1117] text-[#e6edf3] min-h-screen">
        {children}
      </body>
    </html>
  );
}
