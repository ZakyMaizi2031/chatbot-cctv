import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { sql } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login", // Redirect back to login with error query param
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        const result = await sql`SELECT * FROM users WHERE email = ${user.email} LIMIT 1`;
        
        if (result.length > 0) {
          await sql`
            UPDATE users 
            SET name = ${user.name}, image = ${user.image} 
            WHERE email = ${user.email}
          `;
          return true; 
        } else {
          return false;
        }
      } catch (error) {
        console.error("Error checking user during signIn:", error);
        return false;
      }
    },
    async session({ session }) {
      if (session.user && session.user.email) {
        try {
          const result = await sql`SELECT role FROM users WHERE email = ${session.user.email} LIMIT 1`;
          if (result.length > 0) {
            (session.user as any).role = result[0].role;
          } else {
            (session.user as any).role = 'viewer';
          }
        } catch (error) {
          console.error("Error fetching user role for session:", error);
          (session.user as any).role = 'viewer';
        }
      }
      return session;
    },
  },
};
