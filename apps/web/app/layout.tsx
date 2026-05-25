import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TrpcProvider } from "./trpc-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "News Tabs — Web",
  description: "Web companion to the Expo News Tabs app.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TrpcProvider>{children}</TrpcProvider>
      </body>
    </html>
  );
}
