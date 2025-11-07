"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

/**
 * Provider component cho NextAuth Session
 * @param children - Các component con
 * @returns JSX Element
 */
export default function AuthSessionProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
