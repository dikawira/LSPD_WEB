import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Los Santos Police Department - Command Portal",
  description: "LSPD Command and Personnel Management Portal"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="dark"><body>{children}</body></html>;
}
