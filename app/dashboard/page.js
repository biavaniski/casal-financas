import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.coupleId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6F4] text-gray-500">
        Usuário não autenticado ou sem casal vinculado.
      </div>
    );
  }

  const coupleId = session.user.coupleId;

  // Busca dados em paralelo no banco Neon
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
