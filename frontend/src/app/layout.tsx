import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import "./globals.css";

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
    <html lang="id">
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
