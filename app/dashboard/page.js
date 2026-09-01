"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Home, ListChecks, Plus, CalendarDays, MoreHorizontal,
  CreditCard, Check, Trash2, Edit3, X
} from "lucide-react";

/* ---------------------------------------------------------------
   UTILITÁRIOS E DADOS INICIAIS
------------------------------------------------------------------*/
const CATS = {
  moradia: "Moradia",
  alimentacao: "Alimentação",
  transporte: "Transporte",
  saude: "Saúde",
  lazer: "Lazer",
  compras: "Compras",
  assinaturas: "Assinaturas",
  outros: "Outros",
};

const brl = (v) => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const uid = () => Math.random().toString(36).slice(2, 10);

function seedState() {
  const today = "2026-09-01";
  return {
    couple: { name: "Beatriz & João", person1: "Beatriz", person2: "João" },
    budgets: { alimentacao: 1500, transporte: 800, lazer: 500, compras: 600, moradia: 2200 },
    transactions: [
      { id: "t1", type: "expense", desc: "Financiamento Carro", cat: "outros", value: 976.31, date: today, person: "Beatriz", paid: false },
    ],
    accounts: [
      { name: "Nubank", balance: 3200 },
      { name: "Itaú", balance: 1450 },
      { name: "Carteira", balance: 200 },
    ],
    cards: [
      { name: "Nubank Ultravioleta", closeDay: 22, dueDay: 29, used: 360, available: 4640 },
    ],
    installments: [
      { name: "Notebook", current: 3, total: 10, value: 360 },
    ],
    subscriptions: [
      { name: "Netflix", value: 59.90 },
      { name: "Spotify Família", value: 34.90 },
      { name: "Academia", value: 189.90 },
    ],
    debts: [
      { name: "Financiamento do carro", rate: "1,2% a.m.", installment: "24/48", dueDay: 10, paid: 14000, remaining: 28000 },
    ],
    investments: 11530,
  };
}

export default function DashboardPage() {
  const [state, setState] = useState(null);
  const [tab, setTab] = useState("home");
  const [showAdd, setShowAdd] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // Form Lançamento
  const [type, setType] = useState("expense");
  const [value, setValue] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("alimentacao");
  const [person, setPerson] = useState("Beatriz");
  const [date, setDate] = useState("2026-09-01");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("app-state-v2");
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch {
        const init = seedState();
        setState(init);
        localStorage.setItem("app-state-v2", JSON.stringify(init));
      }
    } else {
      const init = seedState();
      setState(init);
      localStorage.setItem("app-state-v2", JSON.stringify(init));
    }
  }, []);

  const saveState = (newState) => {
    setState(newState);
    localStorage.setItem("app-state-v2", JSON.stringify(newState));
  };

  const handleClearData = () => {
    if (confirm("Tem certeza de que deseja limpar todos os dados e restaurar o estado padrão?")) {
      localStorage.removeItem("app-state-v2");
      const fresh = seedState();
      setState(fresh);
    }
  };

  const handleSaveCoupleName = () => {
    if (!tempName.trim()) return;
    const parts = tempName.split("&").map((s) => s.trim());
    const updated = {
      ...state,
      couple: {
        name: tempName,
        person1: parts[0] || "Pessoa 1",
        person2: parts[1] || "Pessoa 2",
      },
    };
    saveState(updated);
    setIsEditingName(false);
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!desc || !value) return;

    const newTx = {
      id: uid(),
      type,
      desc,
      cat,
      value: parseFloat(value),
      date,
      person,
      paid,
    };

    saveState({ ...state, transactions: [newTx, ...state.transactions] });
    setDesc("");
    setValue("");
    setShowAdd(false);
  };

  const togglePaid = (id) => {
    const updated = state.transactions.map((t) => (t.id === id ? { ...t, paid: !t.paid } : t));
    saveState({ ...state, transactions: updated });
  };

  const deleteTx = (id) => {
    const updated = state.transactions.filter((t) => t.id !== id);
    saveState({ ...state, transactions: updated });
  };

  const fin = useMemo(() => {
    if (!state) return null;
    const paidTx = state.transactions.filter((t) => t.paid);
    const income = paidTx.filter((t) => t.type === "income").reduce((s, t) => s + t.value, 0);
    const expense = paidTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.value, 0);
    const balance = income - expense;

    const pendingExpense = state.transactions.filter((t) => t.type === "expense" && !t.paid).reduce((s, t) => s + t.value, 0);
    const totalAccounts = state.accounts.reduce((s, a) => s + a.balance, 0);
    const totalDebts = state.debts.reduce((s, d) => s + d.remaining, 0);
    const netWorth = totalAccounts + state.investments - totalDebts;
    const totalSubscriptions = state.subscriptions.reduce((s, sub) => s + sub.value, 0);

    return { income, expense, balance, projectedBalance: balance - pendingExpense, totalAccounts, totalDebts, netWorth, totalSubscriptions };
  }, [state]);

  if (!state || !fin) return <div className="p-8 text-center text-gray-500">Carregando...</div>;

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-[#F5F6F4] text-gray-800 font-sans">
      {/* NAVEGAÇÃO SUPERIOR */}
      <div className="flex justify-between items-center p-4 bg-[#F5F6F4] sticky top-0 z-30">
        <div className="flex gap-2">
          <button onClick={() => setTab("home")} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${tab === "home" ? "bg-[#1B4332] text-white" : "text-gray-700"}`}>
            Início
          </button>
          <button onClick={() => setTab("lancamentos")} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${tab === "lancamentos" ? "bg-[#1B4332] text-white" : "text-gray-700"}`}>
            Lançamentos
          </button>
        </div>
        <button onClick={() => setTab("mais")} className="text-sm font-medium text-gray-600 hover:text-black">
          Sair
        </button>
      </div>

      {/* ABA 1: INÍCIO */}
      {tab === "home" && (
        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{state.couple.name}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Como estamos este mês?</h1>
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
                <div className="text-xs text-gray-500">Previsto p/ o fim do mês</div>
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
        </div>
      )}

      {/* ABA 2: LANÇAMENTOS */}
      {tab === "lancamentos" && (
        <div className="p-4 space-y-4">
          <h1 className="text-2xl font-bold">Lançamentos</h1>

          {/* FORMULÁRIO DE NOVO LANÇAMENTO */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h2 className="font-semibold text-sm text-gray-800">Novo lançamento</h2>

            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-800">
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>

                <input type="number" step="0.01" placeholder="Valor (ex: 150,00)" value={value} onChange={(e) => setValue(e.target.value)} required className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-800" />
              </div>

              <input type="text" placeholder="Descrição" value={desc} onChange={(e) => setDesc(e.target.value)} required className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-800" />

              <div className="grid grid-cols-2 gap-2">
                <select value={cat} onChange={(e) => setCat(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-800">
                  {Object.entries(CATS).map(([k, label]) => (
                    <option key={k} value={k}>{label}</option>
                  ))}
                </select>

                <select value={person} onChange={(e) => setPerson(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-800">
                  <option value={state.couple.person1}>{state.couple.person1}</option>
                  <option value={state.couple.person2}>{state.couple.person2}</option>
                  <option value="Ambos">Ambos</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-800" />
                <div className="flex items-center gap-2 px-1">
                  <input type="checkbox" id="paid" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="w-4 h-4 text-[#1B4332] rounded" />
                  <label htmlFor="paid" className="text-xs text-gray-700">Já foi pago/recebido</label>
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-[#1B4332] text-white rounded-xl font-semibold text-sm shadow hover:bg-[#123023] transition">
                Salvar lançamento
              </button>
            </form>
          </div>

          {/* LISTA DE LANÇAMENTOS */}
          <div className="space-y-2">
            {state.transactions.map((t) => (
              <div key={t.id} className="bg-white p-3.5 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm">
                <div>
                  <div className="font-semibold text-sm text-gray-800">{t.desc}</div>
                  <div className="text-xs text-gray-400">
                    {CATS[t.cat] || "Geral"} • {t.date} • {t.paid ? "pago" : "a pagar"}
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className={`text-sm font-bold ${t.type === "income" ? "text-[#2F8F5B]" : "text-[#B3261E]"}`}>
                      {t.type === "income" ? "+" : "-"}{brl(t.value)}
                    </div>
                    <button onClick={() => togglePaid(t.id)} className="text-xs text-gray-500 underline">
                      {t.paid ? "marcar pendente" : "marcar pago"}
                    </button>
                  </div>
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
          <h1 className="text-2xl font-bold">Planejamento</h1>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
            <h2 className="font-semibold text-sm text-gray-700">Orçamentos Definidos</h2>
            {Object.entries(state.budgets).map(([category, limit]) => (
              <div key={category} className="flex justify-between items-center text-sm border-b pb-2 border-gray-100">
                <span className="capitalize">{CATS[category] || category}</span>
                <span className="font-semibold">{brl(limit)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: MAIS (PATRIMÔNIO, CARTÕES, CONTAS, ASSINATURAS, DÍVIDAS) */}
      {tab === "mais" && (
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Mais</h1>
            <button onClick={handleClearData} className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
              Limpar dados de teste
            </button>
          </div>

          {/* EDITAR NOME DO CASAL */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2">
            <div className="text-xs text-gray-500 font-medium">Nome do Casal</div>
            {isEditingName ? (
              <div className="flex gap-2">
                <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="flex-1 p-2 border rounded-xl text-sm" placeholder="Ex: Beatriz & João" />
                <button onClick={handleSaveCoupleName} className="p-2 bg-[#1B4332] text-white rounded-xl">
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="font-semibold text-base">{state.couple.name}</span>
                <button onClick={() => { setTempName(state.couple.name); setIsEditingName(true); }} className="text-xs text-gray-500 flex items-center gap-1 border px-2 py-1 rounded-lg">
                  <Edit3 size={12} /> Alterar
                </button>
              </div>
            )}
          </div>

          {/* PATRIMÔNIO LÍQUIDO */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2">
            <div className="text-xs text-gray-500 font-medium">Patrimônio líquido</div>
            <div className="text-2xl font-bold text-gray-900">{brl(fin.netWorth)}</div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-xs">
              <div>
                <div className="font-semibold text-gray-800">{brl(fin.totalAccounts)}</div>
                <div className="text-gray-400">Em contas</div>
              </div>
              <div>
                <div className="font-semibold text-gray-800">{brl(state.investments)}</div>
                <div className="text-gray-400">Investido</div>
              </div>
              <div>
                <div className="font-semibold text-[#B3261E]">{brl(fin.totalDebts)}</div>
                <div className="text-gray-400">Dívidas</div>
              </div>
            </div>
          </div>

          {/* CARTÕES */}
          <div className="space-y-2">
            <h2 className="font-bold text-sm text-gray-800">Cartões</h2>
            {state.cards.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">{c.name}</span>
                  <CreditCard size={18} className="text-gray-400" />
                </div>
                <div className="text-xs text-gray-400">Fecha dia {c.closeDay} • Vence dia {c.dueDay}</div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[#2C6E9E]" style={{ width: `${(c.used / (c.used + c.available)) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500 pt-1">
                  <span>Usado: {brl(c.used)}</span>
                  <span>Disponível: {brl(c.available)}</span>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-700 mb-2">Parcelamentos em andamento</div>
              {state.installments.map((inst, i) => (
                <div key={i} className="flex justify-between items-center text-xs text-gray-600">
                  <span>{inst.name}</span>
                  <span className="font-semibold">{inst.current}/{inst.total} • {brl(inst.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CONTAS BANCÁRIAS */}
          <div className="space-y-2">
            <h2 className="font-bold text-sm text-gray-800">Contas bancárias</h2>
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm divide-y divide-gray-100">
              {state.accounts.map((a, i) => (
                <div key={i} className="flex justify-between items-center py-2 text-xs">
                  <span className="font-medium text-gray-700">{a.name}</span>
                  <span className="font-bold">{brl(a.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 text-xs font-bold text-gray-900">
                <span>Total</span>
                <span>{brl(fin.totalAccounts)}</span>
              </div>
            </div>
          </div>

          {/* ASSINATURAS */}
          <div className="space-y-2">
            <h2 className="font-bold text-sm text-gray-800">Assinaturas</h2>
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm divide-y divide-gray-100">
              {state.subscriptions.map((s, i) => (
                <div key={i} className="flex justify-between items-center py-2 text-xs">
                  <span className="text-gray-700">{s.name}</span>
                  <span className="text-gray-500">{brl(s.value)}/mês</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 text-xs font-bold text-gray-900">
                <span>Total mensal</span>
                <span>{brl(fin.totalSubscriptions)}</span>
              </div>
            </div>
          </div>

          {/* DÍVIDAS E FINANCIAMENTOS */}
          <div className="space-y-2">
            <h2 className="font-bold text-sm text-gray-800">Dívidas e financiamentos</h2>
            {state.debts.map((d, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2">
                <div className="font-semibold text-sm">{d.name}</div>
                <div className="text-xs text-gray-400">{d.rate} • parcela {d.installment} • vence dia {d.dueDay}</div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[#2C6E9E]" style={{ width: `${(d.paid / (d.paid + d.remaining)) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500 pt-1">
                  <span>Pago: {brl(d.paid)}</span>
                  <span>Restante: {brl(d.remaining)}</span>
                </div>
              </div>
            ))}
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
        <button onClick={() => { setTab("lancamentos"); }} className="w-12 h-12 bg-[#1B4332] text-white rounded-full flex items-center justify-center -mt-5 shadow-lg active:scale-95 transition-transform">
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
