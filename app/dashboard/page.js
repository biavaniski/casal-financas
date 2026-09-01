import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function brl(v) {
  return (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function startOfMonth() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59); }

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const coupleId = session.user.coupleId;

  const couple = await prisma.couple.findUnique({
    where: { id: coupleId },
    include: {
      accounts: true,
      transactions: {
        where: { date: { gte: startOfMonth(), lte: endOfMonth() } },
        include: { category: true },
        orderBy: { date: "desc" },
      },
    },
  });

  const paid = couple.transactions.filter((t) => t.paid);
  const income = paid.filter((t) => t.type === "income").reduce((s, t) => s + t.value, 0);
  const expense = paid.filter((t) => t.type === "expense").reduce((s, t) => s + t.value, 0);
  const balance = income - expense;

  const pending = couple.transactions.filter((t) => !t.paid).sort((a, b) => new Date(a.date) - new Date(b.date));
  const overdue = pending.filter((t) => t.type === "expense" && new Date(t.date) < new Date());

  const byCat = {};
  paid.filter((t) => t.type === "expense").forEach((t) => {
    const label = t.category?.name || "Outros";
    byCat[label] = (byCat[label] || 0) + t.value;
  });
  const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  const accountsTotal = couple.accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="pt-4 space-y-4">
      <div>
        <div className="text-sm text-gray-500">{couple.name}</div>
        <h1 className="text-2xl font-semibold">Como estamos este mês?</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="text-sm text-gray-500 mb-1">Saldo do mês</div>
        <div className={`text-3xl font-semibold ${balance >= 0 ? "text-pos" : "text-neg"}`}>{brl(balance)}</div>
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div><div className="text-xs text-gray-500">Entrou</div><div className="font-semibold text-pos">{brl(income)}</div></div>
          <div><div className="text-xs text-gray-500">Saiu</div><div className="font-semibold text-neg">{brl(expense)}</div></div>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="font-semibold text-neg text-sm">{overdue.length} conta(s) em atraso</div>
          <div className="text-sm text-gray-600">Total de {brl(overdue.reduce((s, t) => s + t.value, 0))} pendente.</div>
        </div>
      )}

      {topCat && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="text-sm font-semibold mb-1">Maior categoria de gasto</div>
          <div className="text-sm text-gray-600">
            {topCat[0]} — {brl(topCat[1])} ({((topCat[1] / expense) * 100).toFixed(0)}% das despesas)
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="text-sm font-semibold mb-2">Contas bancárias</div>
        {couple.accounts.map((a) => (
          <div key={a.id} className="flex justify-between text-sm py-1">
            <span>{a.name}</span><span className="font-medium">{brl(a.balance)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm pt-2 mt-1
