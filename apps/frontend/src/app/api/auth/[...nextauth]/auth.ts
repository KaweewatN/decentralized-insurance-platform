import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export type AuthResponse = {
  session: any;
  response: "Session found";
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      fullName: string;
      role: string;
      accessToken: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        walletAddress: {
          label: "Wallet Address",
          type: "text",
          placeholder: "0x1234567890abcdef",
        },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        // Use fetch to call the backend API
        const response = await fetch("http://localhost:3001/api/auth/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress: "0xc724B6892AAbC09e5f4e053717c4F37e32484a08",
          }),
        });

        if (!response.ok) {
          throw new Error("Invalid wallet address");
        }

        const user = await response.json();

        // You may want to validate the user object here
        if (user) {
          return {
            id: user.user.walletAddress,
            role: user.user.role,
            accessToken: user.accessToken,
            username: user.user.username,
            fullName: user.user.fullName,
          };
        } else {
          throw new Error("Invalid wallet address");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt: async ({ token, user }: { token: any; user: any }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.username = user.username;
        token.fullName = user.fullName;
      }
      return token;
    },
    session: async ({ session, token }: { session: any; token: any }) => {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.accessToken = token.accessToken;
        session.user.username = token.username;
        session.user.fullName = token.fullName;
      }
      return session;
    },
    async redirect({ baseUrl }: { baseUrl: string }) {
      return `${baseUrl}/`;
    },
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);

export async function authenticateUser(): Promise<AuthResponse> {
  const session = await getServerAuthSession();
  if (!session) {
    throw { response: "No session found" };
  }
  return { session, response: "Session found" };
}

export async function authenticateAdmin(): Promise<AuthResponse> {
  const session = await getServerAuthSession();
  if (!session) {
    throw { response: "No session found" };
  }
  const SessionUser = session.user as unknown as { role: string };
  if (SessionUser?.role !== "ADMIN") {
    throw { response: "Unauthorized role" };
  }
  return { session, response: "Session found" };
}

export async function getWalletAddress(): Promise<string> {
  const session = await getServerAuthSession();
  if (!session) {
    throw { response: "No session found" };
  }
  const SessionUser = session.user as unknown as { id: string };
  return SessionUser?.id;
}
