import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        console.log('Authorize called with:', { 
          email: credentials?.email, 
          hasPassword: !!credentials?.password,
          requestMethod: req?.method,
          headers: req?.headers
        });
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          console.log('Attempting database connection...');
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1);

          console.log('Database query result:', { userFound: user.length > 0 });

          if (user.length === 0) {
            console.log('User not found');
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user[0].passwordHash
          );

          console.log('Password validation:', { isValid: isPasswordValid });

          if (!isPasswordValid) {
            console.log('Invalid password');
            return null;
          }

          console.log('User authenticated successfully');
          return {
            id: user[0].id.toString(),
            email: user[0].email,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  secret: process.env.NEXTAUTH_SECRET || 'pearl-anniversary-secret-key-2025',
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback:', { hasUser: !!user, tokenId: token.id });
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback:', { sessionUser: !!session.user, tokenId: token.id });
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  debug: true, // Sempre ativo para debug
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', code, metadata);
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
