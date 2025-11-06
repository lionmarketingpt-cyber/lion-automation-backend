import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import SessionProvider from "@/components/session-provider";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Lion Board",
  description: "Planejamento de conteúdo inteligente para agências",
  icons: [{ rel: "icon", url: "/favicon.ico" }]
};

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt-br" className="bg-slate-100">
      <body className="min-h-screen font-sans text-slate-900">
        <SessionProvider session={session}>{children}</SessionProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
