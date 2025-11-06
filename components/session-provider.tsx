"use client";

import { Session } from "next-auth";
import { SessionProvider as NextSessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function SessionProvider({
  children,
  session
}: {
  children: ReactNode;
  session: Session | null;
}) {
  return <NextSessionProvider session={session}>{children}</NextSessionProvider>;
}
