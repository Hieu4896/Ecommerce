"use client";

import { useContext } from "react";
import { AuthContextType } from "@src/types/auth.type";
import { AuthContext } from "@providers/auth.provider";

/**
 * Hook để sử dụng AuthContext
 * @returns AuthContextType - Giá trị của AuthContext
 * @throws Error nếu được sử dụng ngoài AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }
  return context;
}
