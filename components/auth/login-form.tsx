"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = form.get("email")?.toString() ?? "";
    const password = form.get("password")?.toString() ?? "";
    try {
      setLoading(true);
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });
      if (result?.error) {
        toast.error("Credenciais inválidas");
        return;
      }
      toast.success("Bem-vindo de volta!");
      router.replace("/dashboard");
    } catch (error) {
      toast.error("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-600">E-mail</label>
        <input
          type="email"
          name="email"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/40"
          placeholder="voce@empresa.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600">Senha</label>
        <input
          type="password"
          name="password"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/40"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-3 text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
