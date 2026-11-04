import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Los Santos Police Department - High Command & Personnel System",
  description: "LSPD High Command and Personnel Management Portal"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id" className="dark"><body>{children}</body></html>;
}
