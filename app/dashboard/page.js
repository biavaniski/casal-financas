"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Home, ListChecks, Plus, CalendarDays, MoreHorizontal, CreditCard,
  Target, Wallet, Sun, Moon, TrendingUp, TrendingDown, Minus, AlertTriangle,
  Check, X, ChevronRight, PiggyBank, Users, Repeat, ArrowRightLeft,
  ShoppingBag, Car, HeartPulse, Popcorn, UtensilsCrossed, HomeIcon,
  Sparkles, Bell, Settings, ChevronLeft, Trash2
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from "recharts";

/* ---------------------------------------------------------------
   TOKENS & FONTS
------------------------------------------------------------------*/
const FONT_LINK_ID = "casal-financas-fonts";
function ensureFonts() {
  if (typeof window === "undefined") return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700;800&display=swap";
  document.head.appendChild(link);
}

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

const INCOME_CATS = {
  salario: { label: "Salário", color: "#2F8F5B" },
  freelance: { label: "Freelance", color: "#4A6B5A" },
  outros_receita: { label: "Outros", color: "#8A8A82" },
};

const brl = (v) =>
  (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const shortDate = (d) =>
  new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
const fullDate = (d) => new Date(d).toLocaleDateString("pt-BR");
const uid = () => Math.random().toString(36).slice(2, 10);

function addDays(base, n) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d.toISOString();
}
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}
function daysInMonthSoFar() {
  const now = new Date();
  return now.getDate();
}
function totalDaysInMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/* ---------------------------------------------------------------
   SEED DATA
------------------------------------------------------------------*/
function seedState(person1 = "Beatriz", person2 = "João") {
  const today = new Date();
  const accounts = [
    { id: "acc1", name: "Nubank", balance: 3200 },
    { id: "acc2", name: "Itaú", balance: 1450 },
    { id: "acc3", name: "Carteira", balance: 200 },
  ];
  const cards = [
    { id: "card1", name: "Nubank Ultravioleta", bank: "Nubank", limit: 5000, closingDay: 22, dueDay: 29 },
  ];
  const budgets = {
    alimentacao: 1500, transporte: 800, lazer: 500, compras: 600, moradia: 2200,
  };
  const goals = [
    { id: "g1", name: "Viagem para Bonito", target: 10000, saved: 6500, dueDate: addDays(today, 150) },
    { id: "g2", name: "Reserva de emergência", target: 15000, saved: 11400, dueDate: null },
  ];
  const debts = [
    { id: "d1", name: "Financiamento do carro", type: "financiamento", total: 42000, paid: 14000, rate: "1,2% a.m.", installments: "24/48", dueDay: 10 },
  ];
  const investments = [
    { id: "i1", name: "Tesouro Selic", institution: "Banco A", type: "Renda fixa", applied: 8000, current: 8420 },
    { id: "i2", name: "Fundo multimercado", institution: "Corretora B", type: "Fundo", applied: 3000, current: 3110 },
  ];
  const annualExpenses = [
    { id: "a1", name: "IPVA", yearlyValue: 2400, monthlyReserve: 200 },
    { id: "a2", name: "Seguro do carro", yearlyValue: 1800, monthlyReserve: 150 },
  ];

  const t = [];
  const push = (o) => t.push({ id: uid(), paid: true, person: "ambos", recurring: false, ...o });

  push({ type: "income", desc: "Salário", cat: "salario", value: 5000, date: addDays(startOfMonth(today), 4), person: "p1", account: "acc1", recurring: true });
  push({ type: "income", desc: "Salário", cat: "salario", value: 3500, date: addDays(startOfMonth(today), 4), person: "p2", account: "acc2", recurring: true });
  push({ type: "income", desc: "Projeto freelance", cat: "freelance", value: 700, date: addDays(startOfMonth(today), 10), person: "p1", account: "acc1" });

  const spent = [
    ["Aluguel", "moradia", 1200, 5, "p1"], ["Condomínio", "moradia", 420, 5, "ambos"],
    ["Energia", "moradia", 210, 12, "ambos"], ["Internet", "moradia", 130, 8, "ambos"],
    ["Supermercado", "alimentacao", 560, 6, "ambos"], ["Supermercado", "alimentacao", 380, 20, "ambos"],
    ["iFood", "alimentacao", 210, 14, "p2"], ["Padaria", "alimentacao", 90, 22, "p1"],
    ["Combustível", "transporte", 260, 9, "p1"], ["Uber", "transporte", 140, 16, "p2"],
    ["Plano de saúde", "saude", 480, 10, "ambos"], ["Farmácia", "saude", 95, 18, "p2"],
    ["Cinema", "lazer", 110, 15, "ambos"], ["Bar com amigos", "lazer", 180, 23, "p2"],
    ["Roupas", "compras", 260, 17, "p1"], ["Presente aniversário", "compras", 150, 24, "p2"],
    ["Netflix", "assinaturas", 59.9, 3, "ambos"], ["Spotify Família", "assinaturas", 34.9, 3, "ambos"],
    ["Academia", "assinaturas", 189.9, 5, "p1"],
  ];
  spent.forEach(([desc, cat, value, day, person]) =>
    push({ type: "expense", desc, cat, value, date: addDays(startOfMonth(today), day - 1), person, account: "acc1", paid: true })
  );

  push({ type: "expense", desc: "Notebook (parcela 3/10)", cat: "compras", value: 360, date: addDays(today, 0), person: "ambos", card: "card1", paid: true, installment: { current: 3, total: 10 } });
  push({ type: "expense", desc: "Fatura cartão Nubank", cat: "outros", value: 1840, date: addDays(today, 3), person: "ambos", paid: false, card: "card1" });
  push({ type: "expense", desc: "Água", cat: "moradia", value: 95, date: addDays(today, -2), person: "ambos", paid: false });
  push({ type: "expense", desc: "IPVA (parcela 2/3)", cat: "outros", value: 320, date: addDays(today, 6), person: "p1", paid: false });
  push({ type: "expense", desc: "Condomínio", cat: "moradia", value: 420, date: addDays(today, 12), person: "ambos", paid: false, recurring: true });
  push({ type: "expense", desc: "Internet", cat: "moradia", value: 130, date: addDays(today, 18), person: "ambos", paid: false, recurring: true });
  push({ type: "income", desc: "Salário", cat: "salario", value: 5000, date: addDays(today, 25), person: "p1", account: "acc1", paid: false, recurring: true });

  return {
    onboarded: true,
    couple: { person1, person2, name: `${person1} & ${person2}` },
    darkMode: false,
    accounts, cards, budgets, goals, debts, investments, annualExpenses,
    transactions: t,
  };
}

/* ---------------------------------------------------------------
   PERSISTENCE
------------------------------------------------------------------*/
function loadState() {
  if (typeof window === "undefined") return null;
  try {
    const res = localStorage.getItem("app-state");
    return res ? JSON.parse(res) : null;
  } catch {
    return null;
  }
}
function saveState(state) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("app-state", JSON.stringify(state));
  } catch {}
}

/* ---------------------------------------------------------------
   FINANCIAL ENGINE
------------------------------------------------------------------*/
function useFinance(state) {
  return useMemo(() => {
    if (!state) return null;
    const now = new Date();
    const mStart = startOfMonth(now), mEnd = endOfMonth(now);
    const inMonth = (d) => { const dt = new Date(d); return dt >= mStart && dt <= mEnd; };

    const monthTx = state.transactions.filter((tx) => inMonth(tx.date));
    const paidTx = monthTx.filter((tx) => tx.paid);

    const income = paidTx.filter((t) => t.type === "income").reduce((s, t) => s + t.value, 0);
    const expense = paidTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.value, 0);
    const balance = income - expense;

    const pendingIncome = monthTx.filter((t) => t.type === "income" && !t.paid).reduce((s, t) => s + t.value, 0);
    const pendingExpense = monthTx.filter((t) => t.type === "expense" && !t.paid).reduce((s, t) => s + t.value, 0);
    const projectedBalance = balance + pendingIncome - pendingExpense;

    const totalIncomeExpected = income + pendingIncome;
    const committedPct = totalIncomeExpected > 0 ? (expense + pendingExpense) / totalIncomeExpected * 100 : 0;

    const byCat = {};
    paidTx.filter((t) => t.type === "expense").forEach((t) => {
      byCat[t.cat] = (byCat[t.cat] || 0) + t.value;
    });

    const budgetStatus = Object.entries(state.budgets || {}).map(([cat, limit]) => {
      const spent = byCat[cat] || 0;
      return { cat, label: CATS[cat]?.label || cat, limit, spent, pct: limit ? (spent / limit) * 100 : 0, over: spent > limit };
    });
    const overBudget = budgetStatus.filter((b) => b.over);

    const bills = state.transactions
      .filter((t) => !t.paid)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const overdue = bills.filter((t) => new Date(t.date) < now && t.type === "expense");

    let score = 100;
    score -= Math.max(0, committedPct - 70) * 0.8;
    score -= overdue.length * 8;
    score -= overBudget.length * 6;
    score -= projectedBalance < 0 ? 20 : 0;
    score = Math.max(0, Math.min(100, Math.round(score)));

    let healthLabel = "Excelente";
    if (score < 40) healthLabel = "Atenção";
    else if (score < 65) healthLabel = "Razoável";
    else if (score < 85) healthLabel = "Saudável";

    return {
      now, income, expense, balance, pendingIncome, pendingExpense, projectedBalance,
      committedPct, budgetStatus, overBudget, overdue, score, healthLabel,
    };
  }, [state]);
}

/* ---------------------------------------------------------------
   UI PRIMITIVES
------------------------------------------------------------------*/
function Card({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-[var(--card)] rounded-2xl p-4 border border-[var(--border)] ${onClick ? "active:scale-[0.98] transition-transform cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

function Bar({ pct, color }) {
  return (
    <div className="h-2 rounded-full bg-[var(--track)] overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, pct)}%`, background: pct > 100 ? "#B3261E" : color }}
      />
    </div>
  );
}

/* ---------------------------------------------------------------
   MAIN DASHBOARD COMPONENT
------------------------------------------------------------------*/
export default function DashboardPage() {
  const [state, setState] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState("home");

  useEffect(() => {
    ensureFonts();
    const loaded = loadState();
    if (loaded) {
      setState(loaded);
    } else {
      const initial = seedState();
      setState(initial);
      saveState(initial);
    }
  }, []);

  const fin = useFinance(state);

  const handleSaveTx = (tx) => {
    const updated = { ...state, transactions: [tx, ...state.transactions] };
    setState(updated);
    saveState(updated);
  };

  if (!state || !fin) {
    return <div className="min-h-screen flex items-center justify-center">Carregando painel...</div>;
  }

  return (
    <div
      className="min-h-screen pb-20 max-w-md mx-auto"
      style={{
        "--bg": "#F5F6F3",
        "--card": "#FFFFFF",
        "--border": "#E2E8F0",
        "--brand": "#1B4332",
        "--text": "#1F2937",
        "--text-soft": "#6B7280",
        "--chip": "#E5E7EB",
        "--track": "#E5E7EB",
        "--pos": "#2F8F5B",
        "--neg": "#B3261E",
        "--info": "#2C6E9E",
        "--neg-bg": "#FEE2E2",
        background: "var(--bg)",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div className="px-4 pt-4 pb-6 space-y-4">
        <div className="pt-2 pb-1">
          <div className="text-[13px]" style={{ color: "var(--text-soft)" }}>{state.couple.name}</div>
          <h1 className="font-display text-[24px]" style={{ color: "var(--text)" }}>Como estamos este mês?</h1>
        </div>

        {/* Card Saldo */}
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[13px] mb-1" style={{ color: "var(--text-soft)" }}>Saldo do mês</div>
              <div className="font-display text-[32px]" style={{ color: fin.balance >= 0 ? "var(--pos)" : "var(--neg)" }}>
                {brl(fin.balance)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[12px]" style={{ color: "var(--text-soft)" }}>Previsto p/ o fim do mês</div>
              <div className="text-[16px] font-semibold" style={{ color: "var(--text)" }}>{brl(fin.projectedBalance)}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <div>
              <div className="text-[12px]" style={{ color: "var(--text-soft)" }}>Entrou</div>
              <div className="text-[17px] font-semibold" style={{ color: "var(--pos)" }}>{brl(fin.income)}</div>
            </div>
            <div>
              <div className="text-[12px]" style={{ color: "var(--text-soft)" }}>Saiu</div>
              <div className="text-[17px] font-semibold" style={{ color: "var(--neg)" }}>{brl(fin.expense)}</div>
            </div>
          </div>
        </Card>

        {/* Card Saúde Financeira */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>Saúde financeira</div>
            <span className="text-[12px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: "var(--chip)", color: "var(--brand)" }}>{fin.healthLabel}</span>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="font-display text-[30px]" style={{ color: "var(--text)" }}>{fin.score}</span>
            <span className="text-[14px] mb-1" style={{ color: "var(--text-soft)" }}>/100</span>
          </div>
          <Bar pct={fin.score} color="var(--brand)" />
          <p className="text-[13px] mt-3 leading-snug" style={{ color: "var(--text-soft)" }}>
            {fin.score >= 85
              ? "A situação está sob controle, com folga entre entradas e saídas."
              : fin.overBudget.length
              ? `Atenção redobrada em ${fin.overBudget[0].label.toLowerCase()} — já passou do orçamento definido.`
              : "A renda está comprometida acima do ideal neste mês. Vale revisar os gastos variáveis."}
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <div className="text-[12px] mb-1" style={{ color: "var(--text-soft)" }}>Renda comprometida</div>
            <div className="text-[20px] font-semibold" style={{ color: "var(--text)" }}>{fin.committedPct.toFixed(0)}%</div>
            <Bar pct={fin.committedPct} color="var(--info)" />
          </Card>
          <Card>
            <div className="text-[12px] mb-1" style={{ color: "var(--text-soft)" }}>Orçamentos excedidos</div>
            <div className="text-[20px] font-semibold" style={{ color: fin.overBudget.length ? "var(--neg)" : "var(--pos)" }}>
              {fin.overBudget.length}
            </div>
            <div className="text-[12px] mt-1" style={{ color: "var(--text-soft)" }}>
              {fin.overBudget.length ? "Atenção necessária" : "Tudo no limite"}
            </div>
          </Card>
        </div>
      </div>

      {/* Menu Inferior de Navegação */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center max-w-md mx-auto z-40">
        <button onClick={() => setTab("home")} className={`flex flex-col items-center gap-1 ${tab === "home" ? "text-[#1B4332]" : "text-gray-400"}`}>
          <Home size={20} />
          <span className="text-[11px] font-medium">Início</span>
        </button>
        <button onClick={() => setTab("lancamentos")} className={`flex flex-col items-center gap-1 ${tab === "lancamentos" ? "text-[#1B4332]" : "text-gray-400"}`}>
          <ListChecks size={20} />
          <span className="text-[11px] font-medium">Lançamentos</span>
        </button>
        <button onClick={() => setShowAdd(true)} className="w-12 h-12 bg-[#1B4332] text-white rounded-full flex items-center justify-center -mt-5 shadow-lg active:scale-95 transition-transform">
          <Plus size={24} />
        </button>
        <button onClick={() => setTab("planejamento")} className={`flex flex-col items-center gap-1 ${tab === "planejamento" ? "text-[#1B4332]" : "text-gray-400"}`}>
          <CalendarDays size={20} />
          <span className="text-[11px] font-medium">Planejamento</span>
        </button>
        <button onClick={() => setTab("mais")} className={`flex flex-col items-center gap-1 ${tab === "mais" ? "text-[#1B4332]" : "text-gray-400"}`}>
          <MoreHorizontal size={20} />
          <span className="text-[11px] font-medium">Mais</span>
        </button>
      </div>
    </div>
  );
}
