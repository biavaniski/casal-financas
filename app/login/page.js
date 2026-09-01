"use client";
export const dynamic = 'force-dynamic';
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("E-mail ou senha incorretos.");
    else router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-1">Entrar</h1>
        <p className="text-sm text-gray-500 mb-6">Acesse a conta financeira do casal.</p>

        {params.get("criado") && (
          <div className="text-sm bg-green-50 text-green-700 rounded-lg px-3 py-2 mb-4">
            Conta criada! Faça login para continuar.
          </div>
        )}
        {error && <div className="text-sm bg-red-50 text-red-700 rounded-lg px-3 py-2 mb-4">{error}</div>}

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email" required placeholder="E-mail" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-brand"
          />
          <input
            type="password" required placeholder="Senha" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-brand"
          />
          <button
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brand text-white font-semibold disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4">
          Ainda não tem conta?{" "}
          <Link href="/signup" className="text-brand font-medium">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
