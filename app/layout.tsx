import type { Metadata } from "next";
import { Inter, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"], variable : "--font-inter" });
const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ['400','700'],
  variable: "--font-ibm-plex-serif",
});

export const metadata: Metadata = {
  title: "NexBank",
  description: "A next-generation banking solution offering secure, fast, and seamless financial services with modern technology.",
  icons : {
    icon : '/icons/logo.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${ibmPlexSerif.variable} antialiased`}
      >
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
