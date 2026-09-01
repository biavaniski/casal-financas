"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Home,
  ListChecks,
  Plus,
  CalendarDays,
  MoreHorizontal,
  Trash2,
  Edit3,
  Sparkles,
  Check,
} from "lucide-react";

/* ---------------------------------------------------------------
   UTILITÁRIOS E DADOS INICIAIS
------------------------------------------------------------------*/
const CATS = {
  alimentacao: "Alimentação",
  moradia: "Moradia",
  transporte: "Transporte",
  lazer: "Lazer",
  compras: "Compras",
  saude: "Saúde",
  assinaturas: "Assinaturas",
  outros: "Outros",
};

const SUGGESTIONS = {
  alimentacao: 1400,
  moradia: 2000,
  transporte: 750,
  lazer: 450,
  compras: 500,
  saude: 400,
  assinaturas: 150,
  outros: 300,
};

const brl = (v) =>
  (Number(v) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const uid = () => Math.random().toString(36).slice(2, 10);

function seedState() {
  const today = "2026-09-01";
  return {
    couple: { name: "Bia & Alex", person1: "Bia", person2: "Alex" },
    budgets: {
      alimentacao: 1500,
      transporte: 800,
      lazer: 500,
      compras: 600,
      moradia: 2200,
    },
    transactions: [
      {
        id: "t1",
        type: "expense",
        desc: "Financiamento Carro",
        cat: "outros",
        value: 976.31,
        date: today,
        person: "Bia",
        paid: false,
      },
    ],
    accounts: [
      { name: "Nubank", balance: 3200 },
      { name: "Itaú", balance: 1450 },
      { name: "Carteira", balance: 200 },
    ],
    cards: [
      {
        name: "Nubank Ultravioleta",
        closeDay: 22,
        dueDay: 29,
        used: 360,
        available: 4640,
      },
    ],
    installments: [{ name: "Notebook", current: 3, total: 10, value: 360 }],
    subscriptions: [
      { name: "Netflix", value: 59.9 },
      { name: "Spotify Família", value: 34.9 },
      { name: "Academia", value: 189.9 },
    ],
    debts: [
      {
        name: "Financiamento do carro",
        rate: "1,2% a.m.",
        installment: "24/48",
        dueDay: 10,
        paid: 14000,
        remaining: 28000,
      },
    ],
    investments: 11530,
  };
}

export default function DashboardPage() {
  const [state, setState] = useState(null);
  const [tab, setTab] = useState("home");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // Planejamento (edição)
  const [editingBudgets, setEditingBudgets] = useState({});

  // Form Lançamento
  const [type, setType] = useState("expense");
  const [value, setValue] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("alimentacao");
  const [person, setPerson] = useState("Bia");
  const [date, setDate] = useState("2026-09-01");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("app-financas-v3");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
        setEditingBudgets(parsed.budgets || {});
      } catch {
        const init = seedState();
        setState(init);
        setEditingBudgets(init.budgets);
        localStorage.setItem("app-financas-v3", JSON.stringify(init));
      }
    } else {
      const init = seedState();
      setState(init);
      setEditingBudgets(init.budgets);
      localStorage.setItem("app-financas-v3", JSON.stringify(init));
    }
  }, []);

  const saveState = (newState) => {
    setState(newState);
    localStorage.setItem("app-financas-v3", JSON.stringify(newState));
  };

  const handleClearData = () => {
    if (
      confirm(
        "Deseja zerar todos os lançamentos e resetar para o padrão limpo?"
      )
    ) {
      const emptyState = {
        couple: { name: "Bia & Alex", person1: "Bia", person2: "Alex" },
        budgets: {
          alimentacao: 0,
          transporte: 0,
          lazer: 0,
          compras: 0,
          moradia: 0,
        },
        transactions: [],
        accounts: [],
        cards: [],
        installments: [],
        subscriptions: [],
        debts: [],
        investments: 0,
      };
      saveState(emptyState);
      setEditingBudgets(emptyState.budgets);
    }
  };

  const handleSaveCoupleName = () => {
    if (!tempName.trim()) return;
    const parts = tempName.split("&").map((s) => s.trim());
    const updated = {
      ...state,
      couple: {
        name: tempName,
        person1: parts[0] || "Bia",
        person2: parts[1] || "Alex",
      },
    };
    saveState(updated);
    setIsEditingName(false);
  };

  const handleBudgetChange = (catKey, val) => {
    const updated = { ...editingBudgets, [catKey]: parseFloat(val) || 0 };
    setEditingBudgets(updated);
  };

  const handleSaveBudgets = () => {
    const updatedState = { ...state, budgets: editingBudgets };
    saveState(updatedState);
    alert("Orçamentos atualizados com sucesso!");
  };

  const handleApplySuggestions = () => {
    setEditingBudgets(SUGGESTIONS);
    const updatedState = { ...state, budgets: SUGGESTIONS };
    saveState(updatedState);
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
      person: person || state.couple.person1,
      paid,
    };

    saveState({ ...state, transactions: [newTx, ...state.transactions] });
    setDesc("");
    setValue("");
  };

  const togglePaid = (id) => {
    const updated = state.transactions.map((t) =>
      t.id === id ? { ...t, paid: !t.paid } : t
    );
    saveState({ ...state, transactions: updated });
  };

  const deleteTx = (id) => {
    const updated = state.transactions.filter((t) => t.id !== id);
    saveState({ ...state, transactions: updated });
  };

  const fin = useMemo(() => {
    if (!state) return null;
    const paidTx = state.transactions.filter((t) => t.paid);
    const income = paidTx
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.value, 0);
    const expense = paidTx
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.value, 0);
    const balance = income - expense;

    const pendingExpense = state.transactions
      .filter((t) => t.type === "expense" && !t.paid)
      .reduce((s, t) => s + t.value, 0);
    const totalAccounts = (state.accounts || []).reduce(
      (s, a) => s + a.balance,
      0
    );
    const totalDebts = (state.debts || []).reduce(
      (s, d) => s + d.remaining,
      0
    );
    const netWorth = totalAccounts + (state.investments || 0) - totalDebts;
    const totalSubscriptions = (state.subscriptions || []).reduce(
      (s, sub) => s + sub.value,
      0
    );

    return {
      income,
      expense,
      balance,
      projectedBalance: balance - pendingExpense,
      totalAccounts,
      totalDebts,
      netWorth,
      totalSubscriptions,
    };
  }, [state]);

  if (!state || !fin)
    return (
      <div className="p-8 text-center text-gray-500">Carregando...</div>
    );

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-[#F5F6F4] text-gray-800 font-sans">
      {/* NAVEGAÇÃO SUPERIOR */}
      <div className="flex justify-between items-center p-4 bg-[#F5F6F4]">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("home")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              tab === "home" ? "bg-[#1B4332] text-white" : "text-gray-700"
            }`}
          >
            Início
          </button>
          <button
            onClick={() => setTab("lancamentos")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              tab === "lancamentos"
                ? "bg-[#1B4332] text-white"
                : "text-gray-700"
            }`}
          >
            Lançamentos
          </button>
        </div>
        <button
          onClick={() => setTab("mais")}
          className="text-sm font-medium text-gray-600 hover:text-black"
        >
          Sair
        </button>
      </div>

      {/* ABA 1: INÍCIO */}
      {tab === "home" && (
        <div className="p-4 space-y-4">
          <div>
            <div className="text-xs text-gray-500">{state.couple.name}</div>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              Como estamos este mês?
            </h1>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-gray-500 mb-1">Saldo do mês</div>
                <div
                  className={`text-3xl font-bold ${
                    fin.balance >= 0 ? "text-[#2F8F5B]" : "text-[#B3261E]"
                  }`}
                >
                  {brl(fin.balance)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  Previsto p/ o fim do mês
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  {brl(fin.projectedBalance)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
              <div>
                <div className="text-xs text-gray-500">Entrou</div>
                <div className="text-base font-semibold text-[#2F8F5B]">
                  {brl(fin.income)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Saiu</div>
                <div className="text-base font-semibold text-[#B3261E]">
                  {brl(fin.expense)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: LANÇAMENTOS */}
      {tab === "lancamentos" && (
        <div className="p-4 space-y-4">
          <h1 className="text-2xl font-bold">Lançamentos</h1>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h2 className="font-semibold text-sm text-gray-800">
              Novo lançamento
            </h2>

            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-800"
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>

                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor (ex: 150,00)"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-800"
                />
              </div>

              <input
                type="text"
                placeholder="Descrição"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-800"
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-800"
                >
                  {Object.entries(CATS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>

                <select
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-800"
                >
                  <option value={state.couple.person1}>
                    {state.couple.person1}
                  </option>
                  <option value={state.couple.person2}>
                    {state.couple.person2}
                  </option>
                  <option value="Ambos">Ambos</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-800"
                />
                <div className="flex items-center gap-2 px-1">
                  <input
                    type="checkbox"
                    id="paid"
                    checked={paid}
                    onChange={(e) => setPaid(e.target.checked)}
                    className="w-4 h-4 text-[#1B4332] rounded"
                  />
                  <label htmlFor="paid" className="text-xs text-gray-700">
                    Já foi pago/recebido
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1B4332] text-white rounded-xl font-semibold text-sm shadow hover:bg-[#123023] transition"
              >
                Salvar lançamento
              </button>
            </form>
          </div>

          <div className="space-y-2">
            {state.transactions.map((t) => (
              <div
                key={t.id}
                className="bg-white p-3.5 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm"
              >
                <div>
                  <div className="font-semibold text-sm text-gray-800">
                    {t.desc}
                  </div>
                  <div className="text-xs text-gray-400">
                    {CATS[t.cat] || "Geral"} • {t.date} •{" "}
                    {t.paid ? "pago" : "a pagar"}
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <div
                      className={`text-sm font-bold ${
                        t.type === "income"
                          ? "text-[#2F8F5B]"
                          : "text-[#B3261E]"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {brl(t.value)}
                    </div>
                    <button
                      onClick={() => togglePaid(t.id)}
                      className="text-xs text-gray-500 underline"
                    >
                      {t.paid ? "marcar pendente" : "marcar pago"}
                    </button>
                  </div>
                  <button
                    onClick={() => deleteTx(t.id)}
                    className="text-gray-300 hover:text-red-500"
                  >
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
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Planejamento</h1>
            <button
              onClick={handleApplySuggestions}
              className="flex items-center gap-1 text-xs font-semibold text-[#1B4332] bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg"
            >
              <Sparkles size={14} /> Sugerir Orçamentos
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3 shadow-sm">
            <h2 className="font-semibold text-sm text-gray-700">
              Editar Limites por Categoria
            </h2>

            {Object.keys(CATS).map((categoryKey) => (
              <div
                key={categoryKey}
                className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0"
              >
                <span className="text-gray-700 font-medium">
                  {CATS[categoryKey]}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">R$</span>
                  <input
                    type="number"
                    value={
                      editingBudgets[categoryKey] !== undefined
                        ? editingBudgets[categoryKey]
                        : ""
                    }
                    onChange={(e) =>
                      handleBudgetChange(categoryKey, e.target.value)
                    }
                    placeholder="0"
                    className="w-24 p-1.5 border border-gray-300 rounded-lg text-right text-sm bg-white"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={handleSaveBudgets}
              className="w-full mt-2 py-2.5 bg-[#1B4332] text-white rounded-xl font-semibold text-sm hover:bg-[#123023] transition"
            >
              Salvar Alterações do Planejamento
            </button>
          </div>
        </div>
      )}

      {/* ABA 4: MAIS */}
      {tab === "mais" && (
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Mais</h1>
            <button
              onClick={handleClearData}
              className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg"
            >
              Limpar dados de teste
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2">
            <div className="text-xs text-gray-500 font-medium">
              Nome do Casal
            </div>
            {isEditingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="flex-1 p-2 border rounded-xl text-sm"
                  placeholder="Ex: Bia & Alex"
                />
                <button
                  onClick={handleSaveCoupleName}
                  className="p-2 bg-[#1B4332] text-white rounded-xl"
                >
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="font-semibold text-base">
                  {state.couple.name}
                </span>
                <button
                  onClick={() => {
                    setTempName(state.couple.name);
                    setIsEditingName(true);
                  }}
                  className="text-xs text-gray-500 flex items-center gap-1 border px-2 py-1 rounded-lg"
                >
                  <Edit3 size={12} /> Alterar
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2">
            <div className="text-xs text-gray-500 font-medium">
              Patrimônio líquido
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {brl(fin.netWorth)}
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-xs">
              <div>
                <div className="font-semibold text-gray-800">
                  {brl(fin.totalAccounts)}
                </div>
                <div className="text-gray-400">Em contas</div>
              </div>
              <div>
                <div className="font-semibold text-gray-800">
                  {brl(state.investments || 0)}
                </div>
                <div className="text-gray-400">Investido</div>
              </div>
              <div>
                <div className="font-semibold text-[#B3261E]">
                  {brl(fin.totalDebts)}
                </div>
                <div className="text-gray-400">Dívidas</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO INFERIOR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center max-w-md mx-auto z-40">
        <button
          onClick={() => setTab("home")}
          className={`flex flex-col items-center gap-1 ${
            tab === "home" ? "text-[#1B4332]" : "text-gray-400"
          }`}
        >
          <Home size={20} />
          <span className="text-[10px] font-medium">Início</span>
        </button>
        <button
          onClick={() => setTab("lancamentos")}
          className={`flex flex-col items-center gap-1 ${
            tab === "lancamentos" ? "text-[#1B4332]" : "text-gray-400"
          }`}
        >
          <ListChecks size={20} />
          <span className="text-[10px] font-medium">Lançamentos</span>
        </button>
        <button
          onClick={() => setTab("lancamentos")}
          className="w-12 h-12 bg-[#1B4332] text-white rounded-full flex items-center justify-center -mt-5 shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
        <button
          onClick={() => setTab("planejamento")}
          className={`flex flex-col items-center gap-1 ${
            tab === "planejamento" ? "text-[#1B4332]" : "text-gray-400"
          }`}
        >
          <CalendarDays size={20} />
          <span className="text-[10px] font-medium">Planejamento</span>
        </button>
        <button
          onClick={() => setTab("mais")}
          className={`flex flex-col items-center gap-1 ${
            tab === "mais" ? "text-[#1B4332]" : "text-gray-400"
          }`}
        >
          <MoreHorizontal size={20} />
          <span className="text-[10px] font-medium">Mais</span>
        </button>
      </div>
    </div>
  );
}
