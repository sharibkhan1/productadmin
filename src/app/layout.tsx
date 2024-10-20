import "./globals.css";
import{ SessionProvider }from 'next-auth/react';
import { Toaster } from "@/components/ui/sonner"
import { Kanit } from "next/font/google"; // Import the Kanit font from next/font/google
import type { Metadata } from "next";
import { Providers } from "@/components/stateMangement/store/provider";

const kanit = Kanit({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Consumewise",
  description: "Generated by create next app",
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`h-full ${kanit.className}`}>
      <SessionProvider>
        <Providers>

        {children}
        </Providers>
        <Toaster />
      </SessionProvider>
      </body>
    </html>
  )
}