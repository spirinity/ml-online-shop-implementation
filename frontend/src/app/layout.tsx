import { Inter } from "next/font/google";
import type { Metadata } from "next";

import { AppFrame } from "@/components/app-frame";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Customer Segmentation Shop",
  description: "Online shop simulation for customer segmentation inference.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn(inter.variable)}>
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
