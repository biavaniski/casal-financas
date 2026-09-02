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
  Wallet,
  CreditCard,
  Landmark,
  PiggyBank,
  AlertCircle,
  Info,
  Layers,
  ArrowRightCircle,
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

const getToday = () => new Date().toISOString().split("T")[0];

function seedState() {
  const today = getToday();
  return {
    couple: { name: "Bia & Alex", person1: "Bia", person2: "Alex" },
    fixedIncomes: [
      { id: "fi1", desc: "Salário Bia", value: 4500 },
      { id: "fi2", desc: "Salário Alex", value: 5000 },
    ],
    fixedExpenses: [
      { id: "fe1", desc: "Aluguel", value: 2200, dueDay: 10 },
      { id: "fe2", desc: "Condomínio e Internet", value: 450, dueDay: 15 },
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
        desc: "Supermercado Semanal",
        cat: "alimentacao",
        value: 450.0,
        date: today,
        person: "Alex",
        paid: true,
      },
      {
        id: "t2",
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
      { id: "c1", name: "Nubank Ultravioleta", limit: 5000, used: 360, dueDay: 15 },
    ],
    installments: [
      { id: "i1", name: "Notebook", current: 3, total: 10, value: 360, dueDay: 20 },
    ],
    financing: [
      {
        id: "f1",
        name: "Financiamento do Carro",
        remaining: 28000,
        installmentValue: 976.31,
        dueDay: 25,
      },
    ],
    savings: [
      { id: "s1", name: "Reserva de Emergência", value: 11530 },
      { id: "s2", name: "Caixinha Viagem", value: 3200 },
    ],
  };
}

export default function DashboardClient({
  initialCouple,
  initialTransactions,
}) {
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
  const [person, setPerson] = useState("");
  const [date, setDate] = useState(getToday());
  const [paid, setPaid] = useState(false);

  // Form Planejamento
  const [editingBudgets, setEditingBudgets] = useState({});
  const [newFixedIncDesc, setNewFixedIncDesc] = useState("");
  const [newFixedIncVal, setNewFixedIncVal] = useState("");
  const [newFixedExpDesc, setNewFixedExpDesc] = useState("");
  const [newFixedExpVal, setNewFixedExpVal] = useState("");
  const [newFixedExpDueDay, setNewFixedExpDueDay] = useState("");

  // Forms na Aba Mais
  const [newSavDesc, setNewSavDesc] = useState("");
  const [newSavVal, setNewSavVal] = useState("");

  const [newCardName, setNewCardName] = useState("");
  const [newCardUsed, setNewCardUsed] = useState("");
  const [newCardDueDay, setNewCardDueDay] = useState("");

  const [newInstName, setNewInstName] = useState("");
  const [newInstCurr, setNewInstCurr] = useState("");
  const [newInstTot, setNewInstTot] = useState("");
  const [newInstVal, setNewInstVal] = useState("");
  const [newInstDueDay, setNewInstDueDay] = useState("");

  const [newFinName, setNewFinName] = useState("");
  const [newFinRem, setNewFinRem] = useState("");
  const [newFinVal, setNewFinVal] = useState("");
  const [newFinDueDay, setNewFinDueDay] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("app-financas-v6");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (initialTransactions && initialTransactions.length > 0) {
          parsed.transactions = initialTransactions.map(t => ({
            ...t,
            value: Number(t.value),
            date: t.date ? new Date(t.date).toISOString().split("T")[0] : getToday()
          }));
        }
        if (initialCouple) {
          parsed.couple = {
            name: initialCouple.name || "Bia & Alex",
            person1: "Bia",
            person2: "Alex"
          };
        }
        setState(parsed);
        setEditingBudgets(parsed.budgets || {});
        setPerson(parsed.couple?.person1 || "Bia");
      } catch {
        const init = seedState();
        setState(init);
        setEditingBudgets(init.budgets);
        setPerson(init.couple.person1);
      }
    } else {
      const init = seedState();
      if (initialTransactions && initialTransactions.length > 0) {
        init.transactions = initialTransactions.map(t => ({
          ...t,
          value: Number(t.value),
          date: t.date ? new Date(t.date).toISOString().split("T")[0] : getToday()
        }));
      }
      if (initialCouple) {
        init.couple = {
          name: initialCouple.name || "Bia & Alex",
          person1: "Bia",
          person2: "Alex"
        };
      }
      setState(init);
      setEditingBudgets(init.budgets);
      setPerson(init.couple.person1);
      localStorage.setItem("app-financas-v6", JSON.stringify(init));
    }
  }, [initialTransactions, initialCouple]);

  const saveState = (newState) => {
    setState(newState);
    try {
      localStorage.setItem("app-financas-v6", JSON.stringify(newState));
    } catch (e) {
      console.error("Erro ao salvar dados:", e);
    }
  };

  const handleClearData = () => {
    if (confirm("Deseja zerar todos os lançamentos e dados cadastrados?")) {
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

  const convertToTransaction = (itemDesc, itemVal, itemType = "expense", category = "outros") => {
    const newTx = {
      id: uid(),
      type: itemType,
      desc: itemDesc,
      cat: category,
      value: itemVal,
      date: getToday(),
      person: state.couple?.person1 || "Bia",
      paid: true,
    };
    const updatedTransactions = [newTx, ...(state.transactions || [])];
    saveState({ ...state, transactions: updatedTransactions });
    alert(`"${itemDesc}" foi adicionado aos Lançamentos como Pago!`);
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!desc.trim() || !value) return;

    const parsedVal = parseFloat(value.toString().replace(",", "."));
    if (isNaN(parsedVal) || parsedVal <= 0) {
      alert("Por favor, informe um valor numérico válido.");
      return;
    }

    const newTx = {
      id: uid(),
      type,
      desc: desc.trim(),
      cat,
      value: parsedVal,
      date: date || getToday(),
      person: person || state.couple?.person1 || "Bia",
      paid: Boolean(paid),
    };

    const updatedTransactions = [newTx, ...(state.transactions || [])];
    const newState = { ...state, transactions: updatedTransactions };

    saveState(newState);

    setDesc("");
    setValue("");
    setPaid(false);
  };

  const togglePaid = (id) => {
    const updated = (state.transactions || []).map((t) =>
      t.id === id ? { ...t, paid: !t.paid } : t
    );
    saveState({ ...state, transactions: updated });
  };

  const deleteTx = (id) => {
    const updated = (state.transactions || []).filter((t) => t.id !== id);
    saveState({ ...state, transactions: updated });
  };

  const handleAddFixedIncome = (e) => {
    e.preventDefault();
    if (!newFixedIncDesc.trim() || !newFixedIncVal) return;
    const parsedVal = parseFloat(newFixedIncVal.toString().replace(",", "."));
    if (isNaN(parsedVal)) return;

    const item = {
      id: uid(),
      desc: newFixedIncDesc.trim(),
      value: parsedVal,
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
      fixedIncomes: (state.fixedIncomes || []).filter((i) => i.id !== id),
    });
  };

  const handleAddFixedExpense = (e) => {
    e.preventDefault();
    if (!newFixedExpDesc.trim() || !newFixedExpVal) return;
    const parsedVal = parseFloat(newFixedExpVal.toString().replace(",", "."));
    if (isNaN(parsedVal)) return;

    const item = {
      id: uid(),
      desc: newFixedExpDesc.trim(),
      value: parsedVal,
      dueDay: parseInt(newFixedExpDueDay) || null,
    };
    saveState({
      ...state,
      fixedExpenses: [...(state.fixedExpenses || []), item],
    });
    setNewFixedExpDesc("");
    setNewFixedExpVal("");
    setNewFixedExpDueDay("");
  };

  const handleDeleteFixedExpense = (id) => {
    saveState({
      ...state,
      fixedExpenses: (state.fixedExpenses || []).filter((i) => i.id !== id),
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

  const handleAddSavings = (e) => {
    e.preventDefault();
    if (!newSavDesc.trim() || !newSavVal) return;
    const parsedVal = parseFloat(newSavVal.toString().replace(",", "."));
    if (isNaN(parsedVal)) return;

    const item = { id: uid(), name: newSavDesc.trim(), value: parsedVal };
    saveState({ ...state, savings: [...(state.savings || []), item] });
    setNewSavDesc("");
    setNewSavVal("");
  };

  const handleDeleteSavings = (id) => {
    saveState({
      ...state,
      savings: (state.savings || []).filter((s) => s.id !== id),
    });
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCardName.trim() || !newCardUsed) return;
    const parsedVal = parseFloat(newCardUsed.toString().replace(",", "."));
    if (isNaN(parsedVal)) return;

    const item = {
      id: uid(),
      name: newCardName.trim(),
      used: parsedVal,
      dueDay: parseInt(newCardDueDay) || null,
    };
    saveState({ ...state, cards: [...(state.cards || []), item] });
    setNewCardName("");
    setNewCardUsed("");
    setNewCardDueDay("");
  };

  const handleDeleteCard = (id) => {
    saveState({
      ...state,
      cards: (state.cards || []).filter((c) => c.id !== id),
    });
  };

  const handleAddInstallment = (e) => {
    e.preventDefault();
    if (!newInstName.trim() || !newInstVal) return;
    const parsedVal = parseFloat(newInstVal.toString().replace(",", "."));
    if (isNaN(parsedVal)) return;

    const item = {
      id: uid(),
      name: newInstName.trim(),
      current: parseInt(newInstCurr) || 1,
      total: parseInt(newInstTot) || 1,
      value: parsedVal,
      dueDay: parseInt(newInstDueDay) || null,
    };
    saveState({
      ...state,
      installments: [...(state.installments || []), item],
    });
    setNewInstName("");
    setNewInstCurr("");
    setNewInstTot("");
    setNewInstVal("");
    setNewInstDueDay("");
  };

  const handleDeleteInstallment = (id) => {
    saveState({
      ...state,
      installments: (state.installments || []).filter((i) => i.id !== id),
    });
  };

  const handleAddFinancing = (e) => {
    e.preventDefault();
    if (!newFinName.trim() || !newFinRem) return;
    const parsedRem = parseFloat(newFinRem.toString().replace(",", "."));
    const parsedVal = parseFloat(newFinVal.toString().replace(",", ".")) || 0;
    if (isNaN(parsedRem)) return;

    const item = {
      id: uid(),
      name: newFinName.trim(),
      remaining: parsedRem,
      installmentValue: parsedVal,
      dueDay: parseInt(newFinDueDay) || null,
    };
    saveState({ ...state, financing: [...(state.financing || []), item] });
    setNewFinName("");
    setNewFinRem("");
    setNewFinVal("");
    setNewFinDueDay("");
  };

  const handleDeleteFinancing = (id) => {
    saveState({
      ...state,
      financing: (state.financing || []).filter((f) => f.id !== id),
    });
  };

  const fin = useMemo(() => {
    if (!state) return null;
    const today = getToday();

    const transactions = state.transactions || [];
    const fixedIncomes = state.fixedIncomes || [];
    const fixedExpenses = state.fixedExpenses || [];
    const cards = state.cards || [];
    const installments = state.installments || [];
    const financing = state.financing || [];
    const savings = state.savings || [];

    const paidIncomeTx = transactions
      .filter((t) => t.type === "income" && t.paid)
      .reduce((s, t) => s + (Number(t.value) || 0), 0);

    const pendingIncomeTx = transactions
      .filter((t) => t.type === "income" && !t.paid)
      .reduce((s, t) => s + (Number(t.value) || 0), 0);

    const totalFixedIncome = fixedIncomes.reduce(
      (s, i) => s + (Number(i.value) || 0),
      0
    );

    const totalIncomeProjected = paidIncomeTx + pendingIncomeTx + totalFixedIncome;

    const paidExpenseTx = transactions
      .filter((t) => t.type === "expense" && t.paid)
      .reduce((s, t) => s + (Number(t.value) || 0), 0);

    const pendingExpenseTx = transactions
      .filter((t) => t.type === "expense" && !t.paid)
      .reduce((s, t) => s + (Number(t.value) || 0), 0);

    const totalFixedExpenses = fixedExpenses.reduce(
      (s, i) => s + (Number(i.value) || 0),
      0
    );

    const totalCards = cards.reduce(
      (s, i) => s + (Number(i.used) || 0),
      0
    );

    const totalInstallments = installments.reduce(
      (s, i) => s + (Number(i.value) || 0),
      0
    );

    const totalFinancing = financing.reduce(
      (s, i) => s + (Number(i.installmentValue) || 0),
      0
    );

    const totalPlanningAndMoreExpenses =
      totalFixedExpenses + totalCards + totalInstallments + totalFinancing;

    const totalUpcomingExpenses = pendingExpenseTx + totalPlanningAndMoreExpenses;

    const totalExpensesAllMonth = paidExpenseTx + totalUpcomingExpenses;

    const currentBalance = paidIncomeTx - paidExpenseTx;

    const projectedBalance = totalIncomeProjected - totalExpensesAllMonth;

    const overdueExpenses = transactions.filter(
      (t) => t.type === "expense" && !t.paid && t.date < today
    );

    const totalSavings = savings.reduce(
      (s, i) => s + (Number(i.value) || 0),
      0
    );

    const attentionPoints = [];

    if (overdueExpenses.length > 0) {
      const sumOverdue = overdueExpenses.reduce(
        (s, i) => s + (Number(i.value) || 0),
        0
      );
      attentionPoints.push({
        type: "danger",
        title: "Contas em Atraso",
        text: `Você possui ${overdueExpenses.length} lançamento(s) em atraso somando ${brl(sumOverdue)}. Priorize a quitação para evitar cobrança de juros.`,
      });
    }

    if (totalExpensesAllMonth > totalIncomeProjected && totalIncomeProjected > 0) {
      const diff = totalExpensesAllMonth - totalIncomeProjected;
      attentionPoints.push({
        type: "danger",
        title: "Gastos Além do Previsto",
        text: `Suas despesas totais (${brl(
          totalExpensesAllMonth
        )}) superam a receita estimada (${brl(
          totalIncomeProjected
        )}) em ${brl(diff)}.`,
      });
    } else if (totalUpcomingExpenses > currentBalance && currentBalance >= 0) {
      attentionPoints.push({
        type: "warning",
        title: "Atenção ao Saldo Disponível",
        text: `Suas saídas e contas previstas (${brl(
          totalUpcomingExpenses
        )}) superam o saldo atual em conta (${brl(
          currentBalance
        )}).`,
      });
    }

    const debtTotal = totalCards + totalInstallments + totalFinancing;
    if (totalFixedIncome > 0 && debtTotal > totalFixedIncome * 0.4) {
      const perc = Math.round((debtTotal / totalFixedIncome) * 100);
      attentionPoints.push({
        type: "warning",
        title: "Alerta de Endividamento",
        text: `Cartões, parcelas e financiamentos somam ${brl(
          debtTotal
        )}, comprometendo ${perc}% da renda fixa total.`,
      });
    }

    if (attentionPoints.length === 0) {
      attentionPoints.push({
        type: "success",
        title: "Finanças Sob Controle",
        text: `Tudo equilibrado! O saldo estimado para o fim do mês é de ${brl(
          projectedBalance
        )}.`,
      });
    }

    return {
      currentBalance,
      projectedBalance,
      paidIncomeTx,
      pendingIncomeTx,
      totalFixedIncome,
      totalIncomeProjected,
      paidExpenseTx,
      pendingExpenseTx,
      totalFixedExpenses,
      totalCards,
      totalInstallments,
      totalFinancing,
      totalPlanningAndMoreExpenses,
      totalUpcomingExpenses,
      totalExpensesAllMonth,
      overdueExpenses,
      totalSavings,
      attentionPoints,
    };
  }, [state]);

  const filteredTransactions = useMemo(() => {
    if (!state) return [];
    const list = state.transactions || [];
    if (txFilter === "all") return list;
    return list.filter((t) => t.type === txFilter);
  }, [state, txFilter]);

  if (!state || !fin)
    return <div className="p-8 text-center text-gray-500">Carregando...</div>;

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-[#F5F6F4] text-gray-800 font-sans">
      {/* CABEÇALHO */}
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
          Financeiro Neon
        </div>
      </div>

      {/* ABA 1: INÍCIO */}
      {tab === "home" && (
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">
                  Saldo Realizado Atual
                </div>
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
                <div className="text-xs text-gray-500">Saldo Previsto (Fim Mês)</div>
                <div
                  className={`text-base font-bold ${
                    fin.projectedBalance >= 0
                      ? "text-emerald-700"
                      : "text-red-600"
                  }`}
                >
                  {brl(fin.projectedBalance)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Renda Total Prevista</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {brl(fin.totalIncomeProjected)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                  <TrendingDown size={18} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Saídas Previstas Totais</div>
                  <div className="text-sm font-semibold text-red-600">
                    -{brl(fin.totalUpcomingExpenses)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="font-bold text-xs text-gray-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Layers size={15} className="text-emerald-600" />
                Origem dos Compromissos e Contas
              </span>
              <span className="text-[10px] text-gray-400">Visão Geral</span>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-600">• Lançamentos Pendentes</span>
                <span className="font-semibold text-gray-800">
                  {brl(fin.pendingExpenseTx)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-600">• Contas Fixas (Planejamento)</span>
                <span className="font-semibold text-gray-800">
                  {brl(fin.totalFixedExpenses)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-600">• Faturas Cartão (Mais)</span>
                <span className="font-semibold text-gray-800">
                  {brl(fin.totalCards)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-600">• Compras Parceladas (Mais)</span>
                <span className="font-semibold text-gray-800">
                  {brl(fin.totalInstallments)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-600">• Financiamentos (Mais)</span>
                <span className="font-semibold text-gray-800">
                  {brl(fin.totalFinancing)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 bg-emerald-50 px-2 rounded-lg text-emerald-900 font-semibold mt-2">
                <span className="flex items-center gap-1">
                  <PiggyBank size={14} /> Dinheiro Guardado / Reserva:
                </span>
                <span>{brl(fin.totalSavings)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-gray-800 border-b border-gray-100 pb-2">
              <AlertCircle size={18} className="text-amber-500" />
              <span>Pontos de Atenção</span>
            </div>
            <div className="space-y-2 pt-1">
              {fin.attentionPoints.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-xs leading-relaxed flex items-start gap-2.5 ${
                    item.type === "danger"
                      ? "bg-red-50 text-red-900 border border-red-100"
                      : item.type === "warning"
                      ? "bg-amber-50 text-amber-900 border border-amber-100"
                      : "bg-emerald-50 text-emerald-900 border border-emerald-100"
                  }`}
                >
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold mb-0.5">{item.title}</div>
                    <div>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                      <div className="text-red-500">Venceu em: {tx.date}</div>
                    </div>
                    <div className="font-bold text-red-600">
                      {brl(tx.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 2: LANÇAMENTOS */}
      {tab === "lancamentos" && (
        <div className="p-4 space-y-4">
          <h1 className="text-2xl font-bold">Lançamentos</h1>

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
                  type="text"
                  placeholder="Valor (Ex: 150,00)"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-800"
                />
              </div>

              <input
                type="text"
                placeholder="Descrição (Ex: Supermercado)"
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

          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setTxFilter("all")}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                txFilter === "all"
                  ? "bg-[#1B4332] text-white"
                  : "bg-white border text-gray-600"
              }`}
            >
              Todos ({state.transactions?.length || 0})
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
          </div>

          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 bg-white rounded-2xl border border-gray-200">
                Nenhum lançamento encontrado.
              </div>
            ) : (
              filteredTransactions.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-3.5 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm"
                >
                  <div>
                    <div className="font-semibold text-sm text-gray-800">
                      {t.desc}
                    </div>
                    <div className="text-xs text-gray-400">
                      {CATS[t.cat] || "Geral"} • {t.date} • {t.person} •{" "}
                      <span
                        className={
                          t.paid
                            ? "text-emerald-600 font-medium"
                            : "text-amber-600 font-medium"
                        }
                      >
                        {t.paid ? "pago" : "pendente"}
                      </span>
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
                        className="text-[11px] text-gray-500 underline hover:text-gray-800"
                      >
                        {t.paid ? "marcar pendente" : "marcar pago"}
                      </button>
                    </div>
                    <button
                      onClick={() => deleteTx(t.id)}
                      className="text-gray-300 hover:text-red-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ABA 3: PLANEJAMENTO */}
      {tab === "planejamento" && (
        <div className="p-4 space-y-4">
          <h1 className="text-2xl font-bold">Planejamento</h1>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h2 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
              <Wallet size={16} className="text-emerald-600" /> Salários e Rendas Fixas
            </h2>
            <form onSubmit={handleAddFixedIncome} className="flex gap-2 text-sm">
              <input
                type="text"
                placeholder="Ex: Salário Bia"
                value={newFixedIncDesc}
                onChange={(e) => setNewFixedIncDesc(e.target.value)}
                className="flex-1 p-2 border rounded-xl"
              />
              <input
                type="text"
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
                  className="flex justify-between items-center text-xs py-1.5 border-b border-gray-100"
                >
                  <span>{item.desc}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-600">
                      {brl(item.value)}
                    </span>
                    <button
                      title="Lançar como receita paga"
                      onClick={() => convertToTransaction(item.desc, item.value, "income", "outros")}
                      className="text-emerald-600 hover:text-emerald-800 p-1"
                    >
                      <ArrowRightCircle size={15} />
                    </button>
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

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h2 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
              <Landmark size={16} className="text-red-600" /> Contas e Despesas Fixas
            </h2>
            <form
              onSubmit={handleAddFixedExpense}
              className="grid grid-cols-3 gap-2 text-sm"
            >
              <input
                type="text"
                placeholder="Ex: Aluguel"
                value={newFixedExpDesc}
                onChange={(e) => setNewFixedExpDesc(e.target.value)}
                className="p-2 border rounded-xl col-span-3"
              />
              <input
                type="text"
                placeholder="Valor R$"
                value={newFixedExpVal}
                onChange={(e) => setNewFixedExpVal(e.target.value)}
                className="p-2 border rounded-xl col-span-2"
              />
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Dia Venc."
                value={newFixedExpDueDay}
                onChange={(e) => setNewFixedExpDueDay(e.target.value)}
                className="p-2 border rounded-xl text-center"
              />
              <button
                type="submit"
                className="py-2.5 bg-[#1B4332] text-white rounded-xl font-semibold text-xs col-span-3"
              >
                + Adicionar Conta Fixa
              </button>
            </form>

            <div className="space-y-1 pt-2">
              {(state.fixedExpenses || []).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-xs py-1.5 border-b border-gray-100"
                >
                  <div>
                    <div className="font-medium text-gray-800">{item.desc}</div>
                    <div className="text-gray-400">
                      {item.dueDay
                        ? `Vence dia ${item.dueDay}`
                        : "Sem dia de vencimento"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-red-600">
                      {brl(item.value)}
                    </span>
                    <button
                      title="Lançar como despesa paga"
                      onClick={() => convertToTransaction(item.desc, item.value, "expense", "moradia")}
                      className="text-emerald-600 hover:text-emerald-800 p-1"
                    >
                      <ArrowRightCircle size={15} />
                    </button>
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
                type="text"
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
                  className="flex justify-between items-center text-xs py-1.5 border-b border-gray-100"
                >
                  <span>{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-600">
                      {brl(item.value)}
                    </span>
                    <button
                      onClick={() => handleDeleteSavings(item.id)}
                      className="text-gray-300 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
            <h2 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
              <CreditCard size={16} className="text-blue-600" /> Cartões de
              Crédito
            </h2>
            <form onSubmit={handleAddCard} className="grid grid-cols-3 gap-2 text-sm">
              <input
                type="text"
                placeholder="Nome do Cartão"
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
                className="p-2 border rounded-xl col-span-3"
              />
              <input
                type="text"
                placeholder="Fatura R$"
                value={newCardUsed}
                onChange={(e) => setNewCardUsed(e.target.value)}
                className="p-2 border rounded-xl col-span-2"
              />
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Dia Venc."
                value={newCardDueDay}
                onChange={(e) => setNewCardDueDay(e.target.value)}
                className="p-2 border rounded-xl text-center"
              />
              <button
                type="submit"
                className="py-2 bg-[#1B4332] text-white rounded-xl font-semibold col-span-3 text-xs"
              >
                + Adicionar Cartão
              </button>
            </form>

            <div className="space-y-1 pt-1">
              {(state.cards || []).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-xs py-1.5 border-b border-gray-100"
                >
                  <div>
                    <div className="font-semibold text-gray-800">{item.name}</div>
                    <div className="text-gray-400">
                      {item.dueDay
                        ? `Vencimento fatura: dia ${item.dueDay}`
                        : "Sem dia de vencimento"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">
                      {brl(item.used)}
                    </span>
                    <button
                      title="Lançar fatura paga"
                      onClick={() => convertToTransaction(`Fatura ${item.name}`, item.used, "expense", "outros")}
                      className="text-emerald-600 hover:text-emerald-800 p-1"
                    >
                      <ArrowRightCircle size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(item.id)}
                      className="text-gray-300 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                placeholder="Item (Ex: TV 55')"
                value={newInstName}
                onChange={(e) => setNewInstName(e.target.value)}
                className="p-2 border rounded-xl col-span-2"
              />
              <input
                type="number"
                placeholder="Parc. Atual"
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
                type="text"
                placeholder="Valor R$/mês"
                value={newInstVal}
                onChange={(e) => setNewInstVal(e.target.value)}
                className="p-2 border rounded-xl"
              />
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Dia Vencimento"
                value={newInstDueDay}
                onChange={(e) => setNewInstDueDay(e.target.value)}
                className="p-2 border rounded-xl"
              />
              <button
                type="submit"
                className="py-2 bg-[#1B4332] text-white rounded-xl font-semibold col-span-2 text-xs"
              >
                + Adicionar Parcelamento
              </button>
            </form>

            <div className="space-y-1 pt-1">
              {(state.installments || []).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-xs py-1.5 border-b border-gray-100"
                >
                  <div>
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-gray-400">
                      Parc. {item.current}/{item.total}
                      {item.dueDay ? ` • Vence dia ${item.dueDay}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">
                      {brl(item.value)}/mês
                    </span>
                    <button
                      title="Lançar parcela paga"
                      onClick={() => convertToTransaction(`Parcela ${item.name} (${item.current}/${item.total})`, item.value, "expense", "compras")}
                      className="text-emerald-600 hover:text-emerald-800 p-1"
                    >
                      <ArrowRightCircle size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteInstallment(item.id)}
                      className="text-gray-300 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
            <h2 className="font-semibold text-sm text-gray-800">
              Financiamentos e Empréstimos
            </h2>
            <form onSubmit={handleAddFinancing} className="space-y-2 text-sm">
              <input
                type="text"
                placeholder="Nome do Financiamento"
                value={newFinName}
                onChange={(e) => setNewFinName(e.target.value)}
                className="w-full p-2 border rounded-xl"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Saldo Devedor R$"
                  value={newFinRem}
                  onChange={(e) => setNewFinRem(e.target.value)}
                  className="p-2 border rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Parcela R$"
                  value={newFinVal}
                  onChange={(e) => setNewFinVal(e.target.value)}
                  className="p-2 border rounded-xl"
                />
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Dia Venc."
                  value={newFinDueDay}
                  onChange={(e) => setNewFinDueDay(e.target.value)}
                  className="p-2 border rounded-xl text-center"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#1B4332] text-white rounded-xl font-semibold text-xs"
              >
                + Adicionar Financiamento
              </button>
            </form>

            <div className="space-y-1 pt-1">
              {(state.financing || []).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-xs py-1.5 border-b border-gray-100"
                >
                  <div>
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-red-500">
                      Devedor: {brl(item.remaining)}
                      {item.dueDay ? ` • Vence dia ${item.dueDay}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">
                      {brl(item.installmentValue)}/mês
                    </span>
                    <button
                      title="Lançar parcela paga"
                      onClick={() => convertToTransaction(`Financiamento ${item.name}`, item.installmentValue, "expense", "outros")}
                      className="text-emerald-600 hover:text-emerald-800 p-1"
                    >
                      <ArrowRightCircle size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteFinancing(item.id)}
                      className="text-gray-300 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
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
