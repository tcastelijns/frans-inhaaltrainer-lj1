import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Frans-inhaaltrainer | Module 1",
  description: "Een eerste werkende trainer voor Bonjour, je me presente.",
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
