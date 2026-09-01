import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addTransaction, togglePaid } from "@/app/actions";

function brl(v) {
  return (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function shortDate(d) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default async function Lancamentos() {
  const session = await getServerSession(authOptions);
  const coupleId = session.user.coupleId;

  const [couple, categories, accounts, users] = await Promise.all([
    prisma.couple.findUnique({
      where: { id: coupleId },
      include: { transactions: { include: { category: true }, orderBy: { date: "desc" }, take: 100 } },
    }),
    prisma.category.findMany({ where: { coupleId }, orderBy: { name: "asc" } }),
    prisma.account.findMany({ where: { coupleId } }),
    prisma.user.findMany({ where: { coupleId } }),
  ]);

  async function togglePaidAction(formData) {
    "use server";
    await togglePaid(formData.get("id"));
  }

  return (
    <div className="pt-4 space-y-5">
      <h1 className="text-2xl font-semibold">Lançamentos</h1>

      <form action={addTransaction} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <div className="text-sm font-semibold mb-1">Novo lançamento</div>
        <div className="flex gap-2">
          <select name="type" defaultValue="expense" className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm">
            <option value="expense">Despesa</option>
            <option value="income">Entrada</option>
          </select>
          <input name="value" required placeholder="Valor (ex: 150,00)" inputMode="decimal"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm" />
        </div>
        <input name="description" required placeholder="Descrição"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
        <div className="flex gap-2">
          <select name="categoryId" className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select name="accountId" className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm">
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <select name="personId" defaultValue={session.user.id} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm">
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            <option value="ambos">Ambos</option>
          </select>
          <input name="date" type="date" defaultValue={todayStr()} required
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="paid" defaultChecked className="w-4 h-4" /> Já foi pago/recebido
        </label>
        <button className="w-full py-2.5 rounded-lg bg-brand text-white font-semibold text-sm">
          Salvar lançamento
        </button>
      </form>

      <div className="space-y-2">
        {couple.transactions.length === 0 && (
          <div className="text-center text-gray-500 py-10 text-sm">Nenhum lançamento ainda.</div>
        )}
        {couple.transactions.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{t.description}</div>
              <div className="text-xs text-gray-500">
                {t.category?.name || "Sem categoria"} · {shortDate(t.date)}
                {!t.paid && (t.type === "expense" ? " · a pagar" : " · a receber")}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-semibold ${t.type === "income" ? "text-pos" : "text-neg"}`}>
                {t.type === "income" ? "+" : "−"}{brl(t.value)}
              </div>
              {!t.paid && (
                <form action={togglePaidAction}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="text-xs font-medium text-brand mt-0.5">marcar pago</button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
