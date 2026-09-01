"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Home, ListChecks, Plus, CalendarDays, MoreHorizontal,
  CreditCard, Target, Wallet, UtensilsCrossed, Car,
  HeartPulse, Popcorn, ShoppingBag, Repeat, HomeIcon, X, Check, Trash2
} from "lucide-react";

/* ---------------------------------------------------------------
   UTILITÁRIOS E CONSTANTES
------------------------------------------------------------------*/
const CATS = {
  moradia: { label: "Moradia", color: "#4A6B5A", icon: HomeIcon },
  alimentacao: { label: "Alimentação", color: "#B3261E", icon: UtensilsCrossed },
  transporte: { label: "Transporte", color: "#2C6E9E", icon: Car },
  saude: { label: "Saúde", color: "#8C5FBF", icon: HeartPulse },
  lazer: { label: "Lazer", color: "#B8860B", icon: Popcorn },
  compras: { label: "Compras", color: "#C2703D", icon: ShoppingBag },
  assinaturas: { label: "Assinaturas", color: "#5B7FBF", icon: Repeat },
  outros: { label: "Outros", color: "#8A8A82", icon: MoreHorizontal },
};

const brl = (v) => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fullDate = (d) => new Date(d).toLocaleDateString("pt-BR");
const uid = () => Math.random().toString(36).slice(2, 10);

function seedState() {
  const today = new Date().toISOString();
  return {
    couple: { person1: "Beatriz", person2: "João", name: "Beatriz & João" },
    budgets: { alimentacao: 1500, transporte: 800, lazer: 500, compras: 600, moradia: 2200 },
    goals: [
      { id: "g1", name: "Viagem para Bonito", target: 10000, saved: 6500 },
      { id: "g2", name: "Reserva de emergência", target: 15000, saved: 11400 },
    ],
    transactions: [
      { id: "t1", type: "income", desc: "Salário", cat: "salario", value: 5000, date: today, person: "Beatriz", paid: true },
      { id: "t2", type: "income", desc: "Salário", cat: "salario", value: 4200, date: today, person: "João", paid: true },
      { id: "t3", type: "expense", desc: "Supermercado", cat: "alimentacao", value: 560, date: today, person: "Ambos", paid: true },
      { id: "t4", type: "expense", desc: "Aluguel", cat: "moradia", value: 1800, date: today, person: "Ambos", paid: true },
      { id: "t5", type: "expense", desc: "Academia", cat: "assinaturas", value: 190, date: today, person: "Beatriz", paid: false },
    ],
  };
}

/* ---------------------------------------------------------------
   COMPONENTE PRINCIPAL
------------------------------------------------------------------*/
export default function DashboardPage() {
  const [state, setState] = useState(null);
  const [tab, setTab] = useState("home");
  const [showAdd, setShowAdd] = useState(false);

  // Formulário do Modal
  const [desc, setDesc] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("expense");
  const [cat, setCat] = useState("alimentacao");
  const [person, setPerson] = useState("Ambos");

  useEffect(() => {
    const saved = localStorage.getItem("app-state");
    if (saved) {
      try { setState(JSON.parse(saved)); } catch { setState(seedState()); }
    } else {
      const initial = seedState();
      setState(initial);
      localStorage.setItem("app-state", JSON.stringify(initial));
    }
  }, []);

  const saveAndSetState = (newState) => {
    setState(newState);
    localStorage.setItem("app-state", JSON.stringify(newState));
  };

  const fin = useMemo(() => {
    if (!state) return null;
    const paidTx = state.transactions.filter((t) => t.paid);
    const income = paidTx.filter((t) => t.type === "income").reduce((s, t) => s + t.value, 0);
    const expense = paidTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.value, 0);
    const balance = income - expense;

    const pendingExpense = state.transactions.filter((t) => t.type === "expense" && !t.paid).reduce((s, t) => s + t.value, 0);
    const projectedBalance = balance - pendingExpense;

    const byCat = {};
    paidTx.filter((t) => t.type === "expense").forEach((t) => {
      byCat[t.cat] = (byCat[t.cat] || 0) + t.value;
    });

    const budgetStatus = Object.entries(state.budgets || {}).map(([c, limit]) => {
      const spent = byCat[c] || 0;
      return { cat: c, label: CATS[c]?.label || c, limit, spent, over: spent > limit };
    });

    return { income, expense, balance, projectedBalance, budgetStatus, overBudget: budgetStatus.filter((b) => b.over) };
  }, [state]);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!desc || !value) return;

    const newTx = {
      id: uid(),
      type,
      desc,
      cat,
      value: parseFloat(value),
      date: new Date().toISOString(),
      person,
      paid: true,
    };

    const updated = { ...state, transactions: [newTx, ...state.transactions] };
    saveAndSetState(updated);
    setDesc("");
    setValue("");
    setShowAdd(false);
  };

  const togglePaid = (id) => {
    const updatedTx = state.transactions.map((t) => (t.id === id ? { ...t, paid: !t.paid } : t));
    saveAndSetState({ ...state, transactions: updatedTx });
  };

  const deleteTx = (id) => {
    const updatedTx = state.transactions.filter((t) => t.id !== id);
    saveAndSetState({ ...state, transactions: updatedTx });
  };

  if (!state || !fin) return <div className="p-8 text-center text-gray-500">Carregando painel...</div>;

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-[#F5F6F3] text-gray-800 font-sans">
      
      {/* ABA 1: INÍCIO */}
      {tab === "home" && (
        <div className="p-4 space-y-4">
          <div className="pt-2">
            <div className="text-xs text-gray-500">{state.couple.name}</div>
            <h1 className="text-2xl font-bold text-gray-900">Como estamos este mês?</h1>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-gray-500 mb-1">Saldo do mês</div>
                <div className={`text-3xl font-bold ${fin.balance >= 0 ? "text-[#2F8F5B]" : "text-[#B3261E]"}`}>
                  {brl(fin.balance)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Previsto fim do mês</div>
                <div className="text-sm font-semibold text-gray-800">{brl(fin.projectedBalance)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
              <div>
                <div className="text-xs text-gray-500">Entrou</div>
                <div className="text-base font-semibold text-[#2F8F5B]">{brl(fin.income)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Saiu</div>
                <div className="text-base font-semibold text-[#B3261E]">{brl(fin.expense)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Saúde financeira</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-[#1B4332] font-medium">Excelente</span>
            </div>
            <div className="text-2xl font-bold">86 <span className="text-xs text-gray-400 font-normal">/100</span></div>
            <div className="h-2 rounded-full bg-gray-100 mt-2 overflow-hidden">
              <div className="h-full bg-[#1B4332] rounded-full" style={{ width: "86%" }} />
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: LANÇAMENTOS */}
      {tab === "lancamentos" && (
        <div className="p-4 space-y-4">
          <h1 className="text-xl font-bold">Lançamentos</h1>
          <div className="space-y-2">
            {state.transactions.map((t) => (
              <div key={t.id} className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => togglePaid(t.id)}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      t.paid ? "bg-[#1B4332] border-[#1B4332] text-white" : "border-gray-300"
                    }`}
                  >
                    {t.paid && <Check size={14} />}
                  </button>
                  <div>
                    <div className="font-semibold text-sm">{t.desc}</div>
                    <div className="text-xs text-gray-400">{t.person} • {fullDate(t.date)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${t.type === "income" ? "text-[#2F8F5B]" : "text-[#B3261E]"}`}>
                    {t.type === "income" ? "+" : "-"}{brl(t.value)}
                  </span>
                  <button onClick={() => deleteTx(t.id)} className="text-gray-300 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: PLANEJAMENTO */}
      {tab === "planejamento" && (
        <div className="p-4 space-y-4">
          <h1 className="text-xl font-bold">Orçamentos & Metas</h1>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
            <h2 className="font-semibold text-sm text-gray-600">Limites por Categoria</h2>
            {fin.budgetStatus.map((b) => (
              <div key={b.cat} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{b.label}</span>
                  <span className={b.over ? "text-red-600 font-bold" : "text-gray-500"}>
                    {brl(b.spent)} / {brl(b.limit)}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${b.over ? "bg-red-500" : "bg-[#1B4332]"}`}
                    style={{ width: `${Math.min(100, (b.spent / b.limit) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: MAIS */}
      {tab === "mais" && (
        <div className="p-4 space-y-4">
          <h1 className="text-xl font-bold">Configurações</h1>
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            <div className="p-4 flex justify-between items-center text-sm font-medium">
              <span>Casal</span>
              <span className="text-gray-500">{state.couple.name}</span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("app-state");
                setState(seedState());
              }}
              className="w-full p-4 text-left text-sm text-red-600 font-medium"
            >
              Resetar dados de teste
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE ADICIONAR (+ ) */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Novo Lançamento</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${type === "expense" ? "bg-white text-red-600 shadow-sm" : "text-gray-500"}`}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${type === "income" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500"}`}
                >
                  Receita
                </button>
              </div>

              <div>
                <label className="text-xs text-gray-500">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Supermercado"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Categoria</label>
                  <select
                    value={cat}
                    onChange={(e) => setCat(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white"
                  >
                    {Object.entries(CATS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Responsável</label>
                  <select
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white"
                  >
                    <option value="Ambos">Ambos</option>
                    <option value={state.couple.person1}>{state.couple.person1}</option>
                    <option value={state.couple.person2}>{state.couple.person2}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1B4332] text-white rounded-xl font-semibold text-sm shadow-md active:scale-[0.98] transition-transform mt-2"
              >
                Salvar Lançamento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO INFERIOR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center max-w-md mx-auto z-40">
        <button onClick={() => setTab("home")} className={`flex flex-col items-center gap-1 ${tab === "home" ? "text-[#1B4332]" : "text-gray-400"}`}>
          <Home size={20} />
          <span className="text-[10px] font-medium">Início</span>
        </button>
        <button onClick={() => setTab("lancamentos")} className={`flex flex-col items-center gap-1 ${tab === "lancamentos" ? "text-[#1B4332]" : "text-gray-400"}`}>
          <ListChecks size={20} />
          <span className="text-[10px] font-medium">Lançamentos</span>
        </button>
        <button onClick={() => setShowAdd(true)} className="w-12 h-12 bg-[#1B4332] text-white rounded-full flex items-center justify-center -mt-5 shadow-lg active:scale-95 transition-transform">
          <Plus size={24} />
        </button>
        <button onClick={() => setTab("planejamento")} className={`flex flex-col items-center gap-1 ${tab === "planejamento" ? "text-[#1B4332]" : "text-gray-400"}`}>
          <CalendarDays size={20} />
          <span className="text-[10px] font-medium">Planejamento</span>
        </button>
        <button onClick={() => setTab("mais")} className={`flex flex-col items-center gap-1 ${tab === "mais" ? "text-[#1B4332]" : "text-gray-400"}`}>
          <MoreHorizontal size={20} />
          <span className="text-[10px] font-medium">Mais</span>
        </button>
      </div>

    </div>
  );
}
