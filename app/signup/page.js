"use client";
import { useState } from "react";
import Link from "next/link";
import { signup } from "@/actions";

export default function SignupPage() {
  const [mode, setMode] = useState("create");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (formData) => {
    setError("");
    setLoading(true);
    try {
      await signup(formData);
    } catch (err) {
      if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err; // deixa o redirect acontecer
      setError(err.message || "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-1">Criar conta</h1>
        <p className="text-sm text-gray-500 mb-6">
          Comece uma conta de casal do zero, ou entre em uma que seu parceiro(a) já criou.
        </p>

        <div className="flex gap-2 mb-5">
          <button type="button" onClick={() => setMode("create")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold ${mode === "create" ? "bg-brand text-white" : "bg-gray-100 text-gray-600"}`}>
            Criar casal
          </button>
          <button type="button" onClick={() => setMode("join")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold ${mode === "join" ? "bg-brand text-white" : "bg-gray-100 text-gray-600"}`}>
            Entrar com código
          </button>
        </div>

        {error && <div className="text-sm bg-red-50 text-red-700 rounded-lg px-3 py-2 mb-4">{error}</div>}

        <form action={submit} className="space-y-3">
          <input type="hidden" name="mode" value={mode} />
          <input name="name" required placeholder="Seu nome"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-brand" />
          <input name="email" type="email" required placeholder="E-mail"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-brand" />
          <input name="password" type="password" required placeholder="Senha"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-brand" />

          {mode === "create" ? (
            <input name="coupleName" required placeholder="Nome da conta (ex: Beatriz & João)"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-brand" />
          ) : (
            <input name="inviteCode" required placeholder="Código de convite do parceiro(a)"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-brand uppercase" />
          )}

          <button disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brand text-white font-semibold disabled:opacity-50">
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4">
          Já tem conta? <Link href="/login" className="text-brand font-medium">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
