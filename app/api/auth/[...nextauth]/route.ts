import NextAuth from "next-auth";
import { authOptions } from "@services/auth.service";

/**
 * API route handler cho NextAuth
 * Xử lý tất cả các request authentication (login, logout, session, etc.)
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
