import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb-client";
import connectDB from "@/lib/mongodb";
import TeamMember from "@/models/TeamMember";

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Check if this is the default admin user
        if (user.email === 'joel.schrock@presidentialdigs.com') {
          token.role = 'admin';
        } else {
          // Check team members database for role assignment
          try {
            await connectDB();
            const teamMember = await TeamMember.findOne({ email: user.email });
            if (teamMember) {
              token.role = teamMember.role;
            } else {
              token.role = (user as any).role || 'employee';
            }
          } catch (error) {
            console.error('Error checking team member role:', error);
            token.role = (user as any).role || 'employee';
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).id = token.sub as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST }; 