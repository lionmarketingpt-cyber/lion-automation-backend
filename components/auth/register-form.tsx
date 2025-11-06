"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions";

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get("name")?.toString() ?? "";
    const email = form.get("email")?.toString() ?? "";
    const password = form.get("password")?.toString() ?? "";
    try {
      setLoading(true);
      await registerUser({ name, email, password });
      toast.success("Cadastro realizado! Faça login.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-600">Nome</label>
        <input
          type="text"
          name="name"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/40"
          placeholder="Nome completo"
        />
      </div>
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
          placeholder="Defina uma senha segura"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-3 text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Enviando..." : "Criar conta"}
      </button>
    </form>
  );
}
