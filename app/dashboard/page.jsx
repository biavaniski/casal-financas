import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/DashboardClient"; // O código atual refatorado para receber props

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.coupleId) {
    return null; // Ou redirecionar para /login
  }

  const coupleId = session.user.coupleId;

  // Busca dados em paralelo no Neon DB
  const [couple, transactions, accounts, categories] = await Promise.all([
    prisma.couple.findUnique({ where: { id: coupleId } }),
    prisma.transaction.findMany({
      where: { coupleId },
      orderBy: { date: "desc" },
    }),
    prisma.account.findMany({ where: { coupleId } }),
    prisma.category.findMany({ where: { coupleId } }),
  ]);

  return (
    <DashboardClient
      initialCouple={couple}
      initialTransactions={transactions}
      initialAccounts={accounts}
      initialCategories={categories}
    />
  );
}
