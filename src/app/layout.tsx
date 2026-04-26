import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "linkdnforge - Organize Your Links Like Never Before",
  description: "Powerful link management and organization tool for modern teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
