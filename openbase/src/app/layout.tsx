import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NotionClone - Your Workspace",
  description: "A powerful workspace for your notes, docs, and databases",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
