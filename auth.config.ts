import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const isPublic =
        path === "/login" || path === "/register" ||
        path === "/soft/login" || path === "/soft/register";
      const isSoftPublic = path === "/soft/login" || path === "/soft/register";

      if (!isLoggedIn && !isPublic) return Response.redirect(new URL("/login", nextUrl));
      if (isLoggedIn && isPublic) return Response.redirect(new URL(isSoftPublic ? "/soft" : "/", nextUrl));
      return true;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
};
