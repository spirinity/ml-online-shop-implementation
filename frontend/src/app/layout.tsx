import { Manrope } from "next/font/google";
import type { Metadata } from "next";

import { AppFrame } from "@/components/app-frame";
import { cn } from "@/lib/utils";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Segmenta — Customer Segmentation Playground",
  description:
    "Segmenta: simulasi belanja interaktif untuk segmentasi pelanggan (RFM + PCA + K-Means), reimplementasi paper Wang (2025) untuk tugas Machine Learning Kelompok 5.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn(manrope.variable)}>
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
