import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Image Armour",
  description: "Evaluate the structural integrity and trustworthiness of image files without relying on black-box AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${lexend.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="font-sans min-h-full flex flex-col bg-[var(--color-brand-bg)] text-[var(--color-brand-text)]">
        <Header />
        <main className="flex-1 flex flex-col w-full px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
