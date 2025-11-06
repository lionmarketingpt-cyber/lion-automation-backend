import Link from "next/link";
import RegisterForm from "@/components/auth/register-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Crie sua conta</h1>
          <p className="mt-2 text-sm text-slate-500">
            Configure seu acesso para começar a planejar conteúdos.
          </p>
        </div>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          Já é cliente? {" "}
          <Link href="/login" className="font-semibold text-primary">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
