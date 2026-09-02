"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
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
   UTILITÁRIOS
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

const getToday = () => new Date().toISOString().split("T")[0];

export default function DashboardClient({
  initialCouple,
  initialTransactions = [],
  initialAccounts = [],
  initialCategories = [],
}) {
  const [tab, setTab] = useState("home");
  const [isPending, startTransition] = useTransition();

  // Estados locais sincronizados com os dados vindos do Servidor (Banco Neon)
  const [transactions, setTransactions] = useState(initialTransactions);
  const [couple, setCouple] = useState(
    initialCouple || { name: "Bia & Alex", person1: "Bia", person2: "Alex" }
  );

  // Outros estados locais para simulações e abas que podem ser integradas ao banco futuramente
  const [fixedIncomes, setFixedIncomes] = useState([
    { id: "fi1", desc: "Salário Bia", value: 4500 },
    { id: "fi2", desc: "Salário Alex", value: 5000 },
  ]);
  const [fixedExpenses, setFixedExpenses] = useState([
    { id: "fe1", desc: "Aluguel", value: 2200, dueDay: 10 },
    { id: "fe2", desc: "Condomínio e Internet", value: 450, dueDay: 15 },
  ]);
  const [budgets, setBudgets] = useState({
    alimentacao: 1500,
    transporte: 800,
    lazer: 500,
    compras: 600,
    moradia: 2200,
  });
  const [cards, setCards] = useState([
    { id: "c1", name: "Nubank Ultravioleta", limit: 5000, used: 360, dueDay: 15 },
  ]);
  const [installments, setInstallments] = useState([
    { id: "i1", name: "Notebook", current: 3, total: 10, value: 360, dueDay: 20 },
  ]);
  const [financing, setFinancing] = useState([
    {
      id: "f1",
      name: "Financiamento do Carro",
      remaining: 28000,
      installmentValue: 976.31,
      dueDay: 25,
    },
  ]);
  const [savings, setSavings] = useState([
    { id: "s1", name: "Reserva de Emergência", value: 11530 },
    { id: "s2", name: "Caixinha Viagem", value: 3200 },
  ]);

  // Nome do Casal
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(couple.name);

  // Filtro de Lançamentos
  const [txFilter, setTxFilter] = useState("all");

  // Form Lançamento
  const [type, setType] = useState("expense");
  const [value, setValue] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("alimentacao");
  const [person, setPerson] = useState(couple.person1 || "Bia");
  const [date, setDate] = useState(getToday());
  const [paid, setPaid] = useState(false);

  // Form Planejamento
  const [editingBudgets, setEditingBudgets] = useState(budgets);
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

  const handleSaveCoupleName = () => {
    if (!tempName.trim()) return;
    const parts = tempName.split("&").map((s) => s.trim());
    setCouple({
      name: tempName,
      person1: parts[0] || "Bia",
      person2: parts[1] || "Alex",
    });
    setIsEditingName(false);
    // Aqui você chamaria a Server Action para atualizar no banco Neon
  };

  const handleClearData = () => {
    if (confirm("Deseja limpar os registros da tela?")) {
      setTransactions([]);
    }
  };

  const convertToTransaction = (itemDesc, itemVal, itemType = "expense", category = "outros") => {
    const newTx = {
      id: Math.random().toString(36).slice(2, 10),
      type: itemType,
      desc: itemDesc,
      cat: category,
      value: itemVal,
      date: getToday(),
      person: couple.person1 || "Bia",
      paid: true,
    };
    setTransactions([newTx, ...transactions]);
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
      id: Math.random().toString(36).slice(2, 10),
      type,
      desc: desc.trim(),
      cat,
      value: parsedVal,
      date: date || getToday(),
      person: person || couple.person1 || "Bia",
      paid: Boolean(paid),
    };

    startTransition(() => {
      setTransactions([newTx, ...transactions]);
      // CHAMADA DA SERVER ACTION AQUI PARA GRAVAR NO BANCO NEON:
      // ex: await createTransactionAction(newTx);
    });

    setDesc("");
    setValue("");
    setPaid(false);
  };

  const togglePaid = (id) => {
    setTransactions(
      transactions.map((t) => (t.id === id ? { ...t, paid: !t.paid } : t))
    );
  };

  const deleteTx = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    // CHAMADA DA SERVER ACTION PARA DELETAR DO BANCO NEON:
    // ex: await deleteTransactionAction(id);
  };

  const handleAddFixedIncome = (e) => {
    e.preventDefault();
    if (!newFixedIncDesc.trim() || !newFixedIncVal) return;
    const parsedVal = parseFloat(newFixedIncVal.toString().replace(",", "."));
    if (isNaN(parsedVal)) return;

    setFixedIncomes([
      ...fixedIncomes,
      { id: Math.random().toString(36).slice(2, 10), desc: newFixedIncDesc.trim(), value: parsedVal },
    ]);
    setNewFixedIncDesc("");
    setNewFixedIncVal("");
  };

  const handleDeleteFixedIncome = (id) => {
    setFixedIncomes(fixedIncomes.filter((i) => i.id !== id));
  };

  const handleAddFixedExpense = (e) => {
    e.preventDefault();
    if (!newFixedExpDesc.trim() || !newFixedExpVal) return;
    const parsedVal = parseFloat(newFixedExpVal.toString().replace(",", "."));
    if (isNaN(parsedVal)) return;

    setFixedExpenses([
      ...fixedExpenses,
      {
        id: Math.random().toString(36).slice(2, 10),
        desc: newFixedExpDesc.trim(),
        value: parsedVal,
        dueDay: parseInt(newFixedExpDueDay) || null,
      },
    ]);
    setNewFixedExpDesc("");
    setNewFixedExpVal("");
    setNewFixedExpDueDay("");
  };

  const handleDeleteFixedExpense = (id) => {
    setFixedExpenses(fixedExpenses.filter((i) => i.id !== id));
  };

  const handleBudgetChange = (catKey, val) => {
    setEditingBudgets({ ...editingBudgets, [catKey]: parseFloat(val) || 0 });
  };

  const handleSaveBudgets = () => {
    setBudgets(editingBudgets);
    alert("Orçamentos salvos com sucesso!");
  };

  const handleAddSavings = (e) => {
    e.preventDefault();
    if (!newSavDesc.trim() || !newSavVal) return;
    const parsedVal = parseFloat(newSavVal.toString().replace(",", "."));
    if (isNaN(parsedVal)) return;

    setSavings([...savings, { id: Math.random().toString(36).slice(2, 10), name: newSavDesc.trim(), value: parsedVal }]);
    setNewSavDesc("");
    setNewSavVal("");
  };

  const handleDeleteSavings = (id) => {
    setSavings(savings.filter((s) => s.id !== id));
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCardName.trim() || !newCardUsed) return;
    const parsedVal = parseFloat(newCardUsed.toString().replace(",", "."));
    if (isNaN(parsedVal)) return;

    setCards([
      ...cards,
      {
        id: Math.random().toString(36).slice(2, 10),
        name: newCardName.trim(),
        used: parsedVal,
        dueDay: parseInt(newCardDueDay) || null,
      },
    ]);
    setNewCardName("");
    setNewCardUsed("");
    setNewCardDueDay("");
  };

  const handleDeleteCard = (id) => {
    setCards(cards.filter((c) => c.id !== id));
  };

  const handleAddInstallment = (e) => {
    e.preventDefault();
    if (!newInstName.trim() || !newInstVal) return;
    const parsedVal = parseFloat(newInstVal.toString().replace(",", "."));
    if (isNaN(parsedVal)) return;

    setInstallments([
      ...installments,
      {
        id: Math.random().toString(36).slice(2, 10),
        name: newInstName.trim(),
        current: parseInt(newInstCurr) || 1,
        total: parseInt(newInstTot) || 1,
        value: parsedVal,
        dueDay: parseInt(newInstDueDay) || null,
      },
    ]);
    setNewInstName("");
    setNewInstCurr("");
    setNewInstTot("");
    setNewInstVal("");
    setNewInstDueDay("");
  };

  const handleDeleteInstallment = (id) => {
    setInstallments(installments.filter((i) => i.id !== id));
  };

  const handleAddFinancing = (e) => {
    e.preventDefault();
    if (!newFinName.trim() || !newFinRem) return;
    const parsedRem = parseFloat(newFinRem.toString().replace(",", "."));
    const parsedVal = parseFloat(newFinVal.toString().replace(",", ".")) || 0;
    if (isNaN(parsedRem)) return;

    setFinancing([
      ...financing,
      {
        id: Math.random().toString(36).slice(2, 10),
        name: newFinName.trim(),
        remaining: parsedRem,
        installmentValue: parsedVal,
        dueDay: parseInt(newFinDueDay) || null,
      },
    ]);
    setNewFinName("");
    setNewFinRem("");
    setNewFinVal("");
    setNewFinDueDay("");
  };

  const handleDeleteFinancing = (id) => {
    setFinancing(financing.filter((f) => f.id !== id));
  };

  const fin = useMemo(() => {
    const today = getToday();

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

    const totalCards = cards.reduce((s, i) => s + (Number(i.used) || 0), 0);
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

    const totalSavings = savings.reduce((s, i) => s + (Number(i.value) || 0), 0);

    const attentionPoints = [];
    if (overdueExpenses.length > 0) {
      const sumOverdue = overdueExpenses.reduce(
        (s, i) => s + (Number(i.value) || 0),
        0
      );
      attentionPoints.push({
        type: "danger",
        title: "Contas em Atraso",
        text: `Você possui ${overdueExpenses.length} lançamento(s) em atraso somando ${brl(sumOverdue)}.`,
      });
    }

    if (attentionPoints.length === 0) {
      attentionPoints.push({
        type: "success",
        title: "Finanças Sob Controle",
        text: `Tudo equilibrado! Saldo estimado para o fim do mês: ${brl(projectedBalance)}.`,
      });
    }

    return {
      currentBalance,
      projectedBalance,
      totalIncomeProjected,
      paidExpenseTx,
      pendingExpenseTx,
      totalFixedExpenses,
      totalCards,
      totalInstallments,
      totalFinancing,
      totalUpcomingExpenses,
      totalExpensesAllMonth,
      overdueExpenses,
      totalSavings,
      attentionPoints,
    };
  }, [transactions, fixedIncomes, fixedExpenses, cards, installments, financing, savings]);

  const filteredTransactions = useMemo(() => {
    if (txFilter === "all") return transactions;
    return transactions.filter((t) => t.type === txFilter);
  }, [transactions, txFilter]);

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-[#F5F6F4] text-gray-800 font-sans">
      {/* CABEÇALHO */}
      <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Casal
          </span>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">
            {couple.name}
          </h2>
        </div>
        <div className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-medium">
          Neon Sincronizado
        </div>
      </div>

      {/* ABA 1: INÍCIO */}
      {tab === "home" && (
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Saldo Realizado Atual</div>
                <div
                  className={`text-3xl font-bold ${
                    fin.currentBalance >= 0 ? "text-[#2F8F5B]" : "text-[#B3261E]"
                  }`}
                >
                  {brl(fin.currentBalance)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Saldo Previsto</div>
                <div
                  className={`text-base font-bold ${
                    fin.projectedBalance >= 0 ? "text-emerald-700" : "text-red-600"
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
                  <div className="text-xs text-gray-500">Renda Prevista</div>
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
                  <div className="text-xs text-gray-500">Saídas Previstas</div>
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
                <Layers size={15} className="text-emerald-600" /> Origem das Contas
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-600">• Lançamentos Pendentes</span>
                <span className="font-semibold text-gray-800">{brl(fin.pendingExpenseTx)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-600">• Contas Fixas</span>
                <span className="font-semibold text-gray-800">{brl(fin.totalFixedExpenses)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-600">• Faturas Cartão</span>
                <span className="font-semibold text-gray-800">{brl(fin.totalCards)}</span>
              </div>
              <div className="flex justify-between items-center py-1 bg-emerald-50 px-2 rounded-lg text-emerald-900 font-semibold mt-2">
                <span className="flex items-center gap-1">
                  <PiggyBank size={14} /> Reserva:
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
                <div key={idx} className="p-3 rounded-xl text-xs bg-emerald-50 text-emerald-900 border border-emerald-100 flex items-start gap-2.5">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold mb-0.5">{item.title}</div>
                    <div>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: LANÇAMENTOS */}
      {tab === "lancamentos" && (
        <div className="p-4 space-y-4">
          <h1 className="text-2xl font-bold">Lançamentos</h1>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h2 className="font-semibold text-sm text-gray-800">Novo Lançamento</h2>

            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-800"
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Entrada (Receita)</option>
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
                    <option key={k} value={k}>{label}</option>
                  ))}
                </select>

                <select
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-800"
                >
                  <option value={couple.person1}>{couple.person1}</option>
                  <option value={couple.person2}>{couple.person2}</option>
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
                  <label htmlFor="paid" className="text-xs text-gray-700">Pago</label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-[#1B4332] text-white rounded-xl font-semibold text-sm shadow hover:bg-[#123023] transition"
              >
                {isPending ? "Salvando no Banco..." : "Salvar Lançamento"}
              </button>
            </form>
          </div>

          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 bg-white rounded-2xl border border-gray-200">
                Nenhum lançamento encontrado.
              </div>
            ) : (
              filteredTransactions.map((t) => (
                <div key={t.id} className="bg-white p-3.5 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm">
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{t.desc}</div>
                    <div className="text-xs text-gray-400">
                      {CATS[t.cat] || "Geral"} • {t.date} • <span className={t.paid ? "text-emerald-600" : "text-amber-600"}>{t.paid ? "pago" : "pendente"}</span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className={`text-sm font-bold ${t.type === "income" ? "text-[#2F8F5B]" : "text-[#B3261E]"}`}>
                        {t.type === "income" ? "+" : "-"}{brl(t.value)}
                      </div>
                      <button onClick={() => togglePaid(t.id)} className="text-[11px] text-gray-500 underline">
                        {t.paid ? "marcar pendente" : "marcar pago"}
                      </button>
                    </div>
                    <button onClick={() => deleteTx(t.id)} className="text-gray-300 hover:text-red-500 p-1">
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
                placeholder="Ex: Salário"
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
              <button type="submit" className="p-2 bg-[#1B4332] text-white rounded-xl">
                <Plus size={16} />
              </button>
            </form>
            <div className="space-y-1">
              {fixedIncomes.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-100">
                  <span>{item.desc}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-600">{brl(item.value)}</span>
                    <button onClick={() => convertToTransaction(item.desc, item.value, "income", "outros")} className="text-emerald-600 p-1">
                      <ArrowRightCircle size={15} />
                    </button>
                    <button onClick={() => handleDeleteFixedIncome(item.id)} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: MAIS */}
      {tab === "mais" && (
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Mais</h1>
            <button onClick={handleClearData} className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
              Limpar tela
            </button>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2">
            <div className="text-xs text-gray-500 font-medium">Nome do Casal</div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-base">{couple.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* NAVEGAÇÃO INFERIOR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center max-w-md mx-auto z-40">
        <button onClick={() => setTab("home")} className={`flex flex-col items-center gap-1 ${tab === "home" ? "text-[#1B4332]" : "text-gray-400"}`}>
          <Home size={20} />
          <span className="text-[10px]">Início</span>
        </button>
        <button onClick={() => setTab("lancamentos")} className={`flex flex-col items-center gap-1 ${tab === "lancamentos" ? "text-[#1B4332]" : "text-gray-400"}`}>
          <ListChecks size={20} />
          <span className="text-[10px]">Lançamentos</span>
        </button>
        <button onClick={() => setTab("lancamentos")} className="w-12 h-12 bg-[#1B4332] text-white rounded-full flex items-center justify-center -mt-5 shadow-lg">
          <Plus size={24} />
        </button>
        <button onClick={() => setTab("planejamento")} className={`flex flex-col items-center gap-1 ${tab === "planejamento" ? "text-[#1B4332]" : "text-gray-400"}`}>
          <CalendarDays size={20} />
          <span className="text-[10px]">Planejamento</span>
        </button>
        <button onClick={() => setTab("mais")} className={`flex flex-col items-center gap-1 ${tab === "mais" ? "text-[#1B4332]" : "text-gray-400"}`}>
          <MoreHorizontal size={20} />
          <span className="text-[10px]">Mais</span>
        </button>
      </div>
    </div>
  );
}
