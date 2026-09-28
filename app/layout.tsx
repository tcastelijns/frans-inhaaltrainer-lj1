import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inhaaltrainer Frans",
  description: "Een inhaaltrainer Frans met losse modules voor leerjaar 1.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
