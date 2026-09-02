import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Preencha o e-mail e a senha.");
        }

        const email = credentials.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error("E-mail ou senha inválidos.");
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) {
          throw new Error("E-mail ou senha inválidos.");
        }

        // Retorna o usuário incluindo explicitamente o coupleId para uso posterior
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          coupleId: user.coupleId,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Insere os dados do usuário no token JWT no momento do login
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.coupleId = user.coupleId;
      }
      return token;
    },
    // Repassa os dados do token para a sessão ativa em qualquer dispositivo
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          name: token.name,
          email: token.email,
          coupleId: token.coupleId,
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
