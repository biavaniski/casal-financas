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
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Wallet,
  CreditCard,
  Landmark,
  PiggyBank,
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
    fixedIncomes: [
      { id: "fi1", desc: "Salário Bia", value: 4500 },
      { id: "fi2", desc: "Salário Alex", value: 5000 },
    ],
    fixedExpenses: [
      { id: "fe1", desc: "Aluguel", value: 2200 },
      { id: "fe2", desc: "Condomínio e Internet", value: 450 },
    ],
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
        date: "2026-08-25",
        person: "Bia",
        paid: false,
      },
      {
        id: "t2",
        type: "expense",
        desc: "Supermercado",
        cat: "alimentacao",
        value: 450.0,
        date: today,
        person: "Alex",
        paid: true,
      },
      {
        id: "t3",
        type: "income",
        desc: "Projeto Freelance",
        cat: "outros",
        value: 1200.0,
        date: today,
        person: "Bia",
        paid: true,
      },
    ],
    cards: [
      { id: "c1", name: "Nubank Ultravioleta", limit: 5000, used: 360 },
    ],
    installments: [
      { id: "i1", name: "Notebook", current: 3, total: 10, value: 360 },
    ],
    financing: [
      {
        id: "f1",
        name: "Financiamento do Carro",
        remaining: 28000,
        installmentValue: 976.31,
      },
    ],
    savings: [
      { id: "s1", name: "Reserva de Emergência", value: 11530 },
      { id: "s2", name: "Caixinha Viagem", value: 3200 },
    ],
  };
}

export default function DashboardPage() {
  const [state, setState] = useState(null);
  const [tab, setTab] = useState("home");

  // Nome do Casal
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // Filtro de Lançamentos
  const [txFilter, setTxFilter] = useState("all");

  // Form Lançamento
  const [type, setType] = useState("expense");
  const [value, setValue] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("alimentacao");
  const [person, setPerson] = useState("Bia");
  const [date, setDate] = useState("2026-09-01");
  const [paid, setPaid] = useState(false);

  // Form Planejamento
  const [editingBudgets, setEditingBudgets] = useState({});
  const [newFixedIncDesc, setNewFixedIncDesc] = useState("");
  const [newFixedIncVal, setNewFixedIncVal] = useState("");
  const [newFixedExpDesc, setNewFixedExpDesc] = useState("");
  const [newFixedExpVal, setNewFixedExpVal] = useState("");

  // Forms na Aba Mais
  const [newSavDesc, setNewSavDesc] = useState("");
  const [newSavVal, setNewSavVal] = useState("");
  const [newCardName, setNewCardName] = useState("");
  const [newCardUsed, setNewCardUsed] = useState("");
  const [newInstName, setNewInstName] = useState("");
  const [newInstCurr, setNewInstCurr] = useState("");
  const [newInstTot, setNewInstTot] = useState("");
  const [newInstVal, setNewInstVal] = useState("");
  const [newFinName, setNewFinName] = useState("");
  const [newFinRem, setNewFinRem] = useState("");
  const [newFinVal, setNewFinVal] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("app-financas-v4");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
        setEditingBudgets(parsed.budgets || {});
      } catch {
        const init = seedState();
        setState(init);
        setEditingBudgets(init.budgets);
        localStorage.setItem("app-financas-v4", JSON.stringify(init));
      }
    } else {
      const init = seedState();
      setState(init);
      setEditingBudgets(init.budgets);
      localStorage.setItem("app-financas-v4", JSON.stringify(init));
    }
  }, []);

  const saveState = (newState) => {
    setState(newState);
    localStorage.setItem("app-financas-v4", JSON.stringify(newState));
  };

  const handleClearData = () => {
    if (confirm("Deseja zerar todos os lançamentos e dados de teste?")) {
      const emptyState = {
        couple: { name: "Bia & Alex", person1: "Bia", person2: "Alex" },
        fixedIncomes: [],
        fixedExpenses: [],
        budgets: {
          alimentacao: 0,
          transporte: 0,
          lazer: 0,
          compras: 0,
          moradia: 0,
        },
        transactions: [],
        cards: [],
        installments: [],
        financing: [],
        savings: [],
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

  /* HANDLERS LANÇAMENTOS */
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

  /* HANDLERS PLANEJAMENTO */
  const handleAddFixedIncome = (e) => {
    e.preventDefault();
    if (!newFixedIncDesc || !newFixedIncVal) return;
    const item = {
      id: uid(),
      desc: newFixedIncDesc,
      value: parseFloat(newFixedIncVal),
    };
    saveState({
      ...state,
      fixedIncomes: [...(state.fixedIncomes || []), item],
    });
    setNewFixedIncDesc("");
    setNewFixedIncVal("");
  };

  const handleDeleteFixedIncome = (id) => {
    saveState({
      ...state,
      fixedIncomes: state.fixedIncomes.filter((i) => i.id !== id),
    });
  };

  const handleAddFixedExpense = (e) => {
    e.preventDefault();
    if (!newFixedExpDesc || !newFixedExpVal) return;
    const item = {
      id: uid(),
      desc: newFixedExpDesc,
      value: parseFloat(newFixedExpVal),
    };
    saveState({
      ...state,
      fixedExpenses: [...(state.fixedExpenses || []), item],
    });
    setNewFixedExpDesc("");
    setNewFixedExpVal("");
  };

  const handleDeleteFixedExpense = (id) => {
    saveState({
      ...state,
      fixedExpenses: state.fixedExpenses.filter((i) => i.id !== id),
    });
  };

  const handleBudgetChange = (catKey, val) => {
    const updated = { ...editingBudgets, [catKey]: parseFloat(val) || 0 };
    setEditingBudgets(updated);
  };

  const handleSaveBudgets = () => {
    saveState({ ...state, budgets: editingBudgets });
    alert("Orçamentos salvos com sucesso!");
  };

  /* HANDLERS ABA MAIS */
  const handleAddSavings = (e) => {
    e.preventDefault();
    if (!newSavDesc || !newSavVal) return;
    const item = { id: uid(), name: newSavDesc, value: parseFloat(newSavVal) };
    saveState({ ...state, savings: [...(state.savings || []), item] });
    setNewSavDesc("");
    setNewSavVal("");
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCardName || !newCardUsed) return;
    const item = {
      id: uid(),
      name: newCardName,
      used: parseFloat(newCardUsed),
    };
    saveState({ ...state, cards: [...(state.cards || []), item] });
    setNewCardName("");
    setNewCardUsed("");
  };

  const handleAddInstallment = (e) => {
    e.preventDefault();
    if (!newInstName || !newInstVal) return;
    const item = {
      id: uid(),
      name: newInstName,
      current: parseInt(newInstCurr) || 1,
      total: parseInt(newInstTot) || 1,
      value: parseFloat(newInstVal),
    };
    saveState({
      ...state,
      installments: [...(state.installments || []), item],
    });
    setNewInstName("");
    setNewInstCurr("");
    setNewInstTot("");
    setNewInstVal("");
  };

  const handleAddFinancing = (e) => {
    e.preventDefault();
    if (!newFinName || !newFinRem) return;
    const item = {
      id: uid(),
      name: newFinName,
      remaining: parseFloat(newFinRem),
      installmentValue: parseFloat(newFinVal) || 0,
    };
    saveState({ ...state, financing: [...(state.financing || []), item] });
    setNewFinName("");
    setNewFinRem("");
    setNewFinVal("");
  };

  /* MÉTRICAS CALCULADAS DO DASHBOARD */
  const fin = useMemo(() => {
    if (!state) return null;
    const today = new Date().toISOString().split("T")[0];

    const paidTx = state.transactions.filter((t) => t.paid);
    const incomeTotal = state.transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.value, 0);
    const incomePaid = paidTx
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.value, 0);

    const expensePaid = paidTx
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.value, 0);
    const currentBalance = incomePaid - expensePaid;

    // Saídas previstas (gastos não pagos)
    const upcomingExpenses = state.transactions
      .filter((t) => t.type === "expense" && !t.paid)
      .reduce((s, t) => s + t.value, 0);

    // Contas em Atraso (não pagas e com data anterior a hoje)
    const overdueExpenses = state.transactions.filter(
      (t) => t.type === "expense" && !t.paid && t.date < today
    );

    // Maiores Gastos do Mês (todas as despesas ordenadas por valor)
    const topExpenses = [...state.transactions]
      .filter((t) => t.type === "expense")
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    // Dinheiro Guardado Total
    const totalSavings = (state.savings || []).reduce(
      (s, item) => s + item.value,
      0
    );

    return {
      currentBalance,
      incomeTotal,
      incomePaid,
      expensePaid,
      upcomingExpenses,
      overdueExpenses,
      topExpenses,
      totalSavings,
    };
  }, [state]);

  const filteredTransactions = useMemo(() => {
    if (!state) return [];
    if (txFilter === "all") return state.transactions;
    return state.transactions.filter((t) => t.type === txFilter);
  }, [state, txFilter]);

  if (!state || !fin)
    return <div className="p-8 text-center text-gray-500">Carregando...</div>;

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-[#F5F6F4] text-gray-800 font-sans">
      {/* TOPO SIMPLES (CABEÇALHO ÚNICO) */}
      <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Casal
          </span>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">
            {state.couple.name}
          </h2>
        </div>
        <div className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-medium">
          Financeiro
        </div>
      </div>

      {/* ABA 1: INÍCIO */}
      {tab === "home" && (
        <div className="p-4 space-y-4">
          {/* Card Saldo do Mês */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-gray-500 mb-1">Saldo Atual</div>
                <div
                  className={`text-3xl font-bold ${
                    fin.currentBalance >= 0
                      ? "text-[#2F8F5B]"
                      : "text-[#B3261E]"
                  }`}
                >
                  {brl(fin.currentBalance)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Saídas Previstas</div>
                <div className="text-base font-semibold text-[#B3261E]">
                  -{brl(fin.upcomingExpenses)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Entradas Totais</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {brl(fin.incomeTotal)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                  <TrendingDown size={18} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Despesas Pagas</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {brl(fin.expensePaid)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ALERTA: CONTAS EM ATRASO */}
          {fin.overdueExpenses.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                <AlertTriangle size={18} />
                <span>Contas em Atraso ({fin.overdueExpenses.length})</span>
              </div>
              <div className="space-y-2">
                {fin.overdueExpenses.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-red-100 text-xs shadow-sm"
                  >
                    <div>
                      <div className="font-semibold text-gray-800">
                        {tx.desc}
                      </div>
                      <div className="text-red-500">Vencimento: {tx.date}</div>
                    </div>
                    <div className="font-bold text-red-600">
                      {brl(tx.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAIORES GASTOS */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-gray-800">
              Maiores Gastos do Mês
            </h3>
            {fin.topExpenses.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhum gasto registrado.</p>
            ) : (
              <div className="space-y-2">
                {fin.topExpenses.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0 text-xs"
                  >
                    <div>
                      <div className="font-medium text-gray-800">
                        {tx.desc}
                      </div>
                      <div className="text-gray-400">
                        {CATS[tx.cat] || "Geral"} • {tx.person}
                      </div>
                    </div>
                    <div className="font-bold text-[#B3261E]">
                      {brl(tx.value)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 2: LANÇAMENTOS (COM FILTROS E TRANSFERÊNCIAS) */}
      {tab === "lancamentos" && (
        <div className="p-4 space-y-4">
          <h1 className="text-2xl font-bold">Lançamentos</h1>

          {/* Form Novo Lançamento */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h2 className="font-semibold text-sm text-gray-800">
              Novo Lançamento
            </h2>

            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-800"
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Entrada (Receita)</option>
                  <option value="transfer">Transferência</option>
                </select>

                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor (R$)"
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
                    Concluído/Pago
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1B4332] text-white rounded-xl font-semibold text-sm shadow hover:bg-[#123023] transition"
              >
                Salvar Lançamento
              </button>
            </form>
          </div>

          {/* FILTROS DE LANÇAMENTOS */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setTxFilter("all")}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                txFilter === "all"
                  ? "bg-[#1B4332] text-white"
                  : "bg-white border text-gray-600"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTxFilter("income")}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                txFilter === "income"
                  ? "bg-[#1B4332] text-white"
                  : "bg-white border text-gray-600"
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => setTxFilter("expense")}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                txFilter === "expense"
                  ? "bg-[#1B4332] text-white"
                  : "bg-white border text-gray-600"
              }`}
            >
              Despesas
            </button>
            <button
              onClick={() => setTxFilter("transfer")}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                txFilter === "transfer"
                  ? "bg-[#1B4332] text-white"
                  : "bg-white border text-gray-600"
              }`}
            >
              Transferências
            </button>
          </div>

          {/* LISTA DE TRANSAÇÕES */}
          <div className="space-y-2">
            {filteredTransactions.map((t) => (
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
                    {t.paid ? "pago" : "pendente"}
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <div
                      className={`text-sm font-bold ${
                        t.type === "income"
                          ? "text-[#2F8F5B]"
                          : t.type === "expense"
                          ? "text-[#B3261E]"
                          : "text-blue-600"
                      }`}
                    >
                      {t.type === "income"
                        ? "+"
                        : t.type === "expense"
                        ? "-"
                        : "↔ "}
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

      {/* ABA 3: PLANEJAMENTO (SALÁRIOS FIXOS + CONTAS FIXAS + ORÇAMENTOS) */}
      {tab === "planejamento" && (
        <div className="p-4 space-y-4">
          <h1 className="text-2xl font-bold">Planejamento</h1>

          {/* 1. Salários Fixos */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h2 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
              <Wallet size={16} className="text-emerald-600" /> Salários e
              Rendas Fixas
            </h2>
            <form
              onSubmit={handleAddFixedIncome}
              className="flex gap-2 text-sm"
            >
              <input
                type="text"
                placeholder="Ex: Salário Bia"
                value={newFixedIncDesc}
                onChange={(e) => setNewFixedIncDesc(e.target.value)}
                className="flex-1 p-2 border rounded-xl"
              />
              <input
                type="number"
                placeholder="R$"
                value={newFixedIncVal}
                onChange={(e) => setNewFixedIncVal(e.target.value)}
                className="w-24 p-2 border rounded-xl"
              />
              <button
                type="submit"
                className="p-2 bg-[#1B4332] text-white rounded-xl"
              >
                <Plus size={16} />
              </button>
            </form>
            <div className="space-y-1">
              {(state.fixedIncomes || []).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-xs py-1 border-b border-gray-100"
                >
                  <span>{item.desc}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-600">
                      {brl(item.value)}
                    </span>
                    <button
                      onClick={() => handleDeleteFixedIncome(item.id)}
                      className="text-gray-300 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Contas Fixas */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h2 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
              <Landmark size={16} className="text-red-600" /> Contas e Despesas
              Fixas
            </h2>
            <form
              onSubmit={handleAddFixedExpense}
              className="flex gap-2 text-sm"
            >
              <input
                type="text"
                placeholder="Ex: Aluguel"
                value={newFixedExpDesc}
                onChange={(e) => setNewFixedExpDesc(e.target.value)}
                className="flex-1 p-2 border rounded-xl"
              />
              <input
                type="number"
                placeholder="R$"
                value={newFixedExpVal}
                onChange={(e) => setNewFixedExpVal(e.target.value)}
                className="w-24 p-2 border rounded-xl"
              />
              <button
                type="submit"
                className="p-2 bg-[#1B4332] text-white rounded-xl"
              >
                <Plus size={16} />
              </button>
            </form>
            <div className="space-y-1">
              {(state.fixedExpenses || []).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-xs py-1 border-b border-gray-100"
                >
                  <span>{item.desc}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-red-600">
                      {brl(item.value)}
                    </span>
                    <button
                      onClick={() => handleDeleteFixedExpense(item.id)}
                      className="text-gray-300 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Orçamento Por Categoria */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3 shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-sm text-gray-700">
                Limites Por Categoria
              </h2>
              <button
                onClick={() => setEditingBudgets(SUGGESTIONS)}
                className="flex items-center gap-1 text-xs font-semibold text-[#1B4332] bg-emerald-50 px-2.5 py-1 rounded-lg"
              >
                <Sparkles size={12} /> Sugerir
              </button>
            </div>

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
              Salvar Planejamento
            </button>
          </div>
        </div>
      )}

      {/* ABA 4: MAIS (PARCELAMENTOS, FINANCIAMENTOS, CARTÕES, DINHEIRO GUARDADO) */}
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

          {/* Nome do Casal */}
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

          {/* Dinheiro Guardado */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
            <h2 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
              <PiggyBank size={16} className="text-emerald-600" /> Dinheiro
              Guardado / Poupança
            </h2>
            <form onSubmit={handleAddSavings} className="flex gap-2 text-sm">
              <input
                type="text"
                placeholder="Ex: Caixinha Viagem"
                value={newSavDesc}
                onChange={(e) => setNewSavDesc(e.target.value)}
                className="flex-1 p-2 border rounded-xl"
              />
              <input
                type="number"
                placeholder="R$"
                value={newSavVal}
                onChange={(e) => setNewSavVal(e.target.value)}
                className="w-24 p-2 border rounded-xl"
              />
              <button
                type="submit"
                className="p-2 bg-[#1B4332] text-white rounded-xl"
              >
                <Plus size={16} />
              </button>
            </form>
            <div className="space-y-1">
              {(state.savings || []).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-xs py-1 border-b border-gray-100"
                >
                  <span>{item.name}</span>
                  <span className="font-bold text-emerald-600">
                    {brl(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cartões de Crédito */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
            <h2 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
              <CreditCard size={16} className="text-blue-600" /> Cartões de
              Crédito
            </h2>
            <form onSubmit={handleAddCard} className="flex gap-2 text-sm">
              <input
                type="text"
                placeholder="Nome do Cartão"
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
                className="flex-1 p-2 border rounded-xl"
              />
              <input
                type="number"
                placeholder="Fatura Atual R$"
                value={newCardUsed}
                onChange={(e) => setNewCardUsed(e.target.value)}
                className="w-28 p-2 border rounded-xl"
              />
              <button
                type="submit"
                className="p-2 bg-[#1B4332] text-white rounded-xl"
              >
                <Plus size={16} />
              </button>
            </form>
            <div className="space-y-1">
              {(state.cards || []).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-xs py-1 border-b border-gray-100"
                >
                  <span>{item.name}</span>
                  <span className="font-semibold text-gray-800">
                    {brl(item.used)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Compras Parceladas */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
            <h2 className="font-semibold text-sm text-gray-800">
              Compras Parceladas
            </h2>
            <form
              onSubmit={handleAddInstallment}
              className="grid grid-cols-2 gap-2 text-sm"
            >
              <input
                type="text"
                placeholder="Item (Ex: Tv)"
                value={newInstName}
                onChange={(e) => setNewInstName(e.target.value)}
                className="p-2 border rounded-xl col-span-2"
              />
              <input
                type="number"
                placeholder="Parc. Atual / Tot"
                value={newInstCurr}
                onChange={(e) => setNewInstCurr(e.target.value)}
                className="p-2 border rounded-xl"
              />
              <input
                type="number"
                placeholder="Total Parcela"
                value={newInstTot}
                onChange={(e) => setNewInstTot(e.target.value)}
                className="p-2 border rounded-xl"
              />
              <input
                type="number"
                placeholder="Valor da Parcela R$"
                value={newInstVal}
                onChange={(e) => setNewInstVal(e.target.value)}
                className="p-2 border rounded-xl col-span-2"
              />
              <button
                type="submit"
                className="py-2 bg-[#1B4332] text-white rounded-xl font-semibold col-span-2"
              >
                Adicionar Parcelamento
              </button>
            </form>
            <div className="space-y-1">
              {(state.installments || []).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-xs py-1 border-b border-gray-100"
                >
                  <div>
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-gray-400">
                      {item.current}/{item.total}x
                    </div>
                  </div>
                  <span className="font-bold text-gray-800">
                    {brl(item.value)}/mês
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financiamentos */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
            <h2 className="font-semibold text-sm text-gray-800">
              Financiamentos e Empréstimos
            </h2>
            <form
              onSubmit={handleAddFinancing}
              className="space-y-2 text-sm"
            >
              <input
                type="text"
                placeholder="Nome do Financiamento"
                value={newFinName}
                onChange={(e) => setNewFinName(e.target.value)}
                className="w-full p-2 border rounded-xl"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Saldo Devedor R$"
                  value={newFinRem}
                  onChange={(e) => setNewFinRem(e.target.value)}
                  className="p-2 border rounded-xl"
                />
                <input
                  type="number"
                  placeholder="Parcela R$/mês"
                  value={newFinVal}
                  onChange={(e) => setNewFinVal(e.target.value)}
                  className="p-2 border rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#1B4332] text-white rounded-xl font-semibold"
              >
                Adicionar Financiamento
              </button>
            </form>
            <div className="space-y-1">
              {(state.financing || []).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-xs py-1 border-b border-gray-100"
                >
                  <div>
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-red-500">
                      Restante: {brl(item.remaining)}
                    </div>
                  </div>
                  <span className="font-semibold text-gray-800">
                    {brl(item.installmentValue)}/mês
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO INFERIOR PÁGINA */}
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
