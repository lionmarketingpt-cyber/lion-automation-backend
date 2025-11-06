import Link from "next/link";
import LoginForm from "@/components/auth/login-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Bem-vindo ao Lion Board</h1>
          <p className="mt-2 text-sm text-slate-500">
            Faça login para acessar seus clientes e quadros de marketing.
          </p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          Ainda não tem conta? {" "}
          <Link href="/register" className="font-semibold text-primary">
            Crie sua conta
          </Link>
        </p>
        <div className="mt-6 rounded-lg bg-slate-100 p-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-600">Usuário de demonstração</p>
          <p>Email: admin@lionboard.test</p>
          <p>Senha: admin123</p>
        </div>
      </div>
    </div>
  );
}
