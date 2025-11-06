import AddClientDialog from "@/components/add-client-dialog";
import ClientCard from "@/components/client-card";
import LogoutButton from "@/components/logout-button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const clients = await prisma.client.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="mx-auto min-h-screen max-w-6xl p-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Seus clientes</h1>
          <p className="text-sm text-slate-500">
            Cadastre novos negócios e abra o quadro de planejamento em um clique.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AddClientDialog />
          <LogoutButton />
        </div>
      </header>

      {clients.length === 0 ? (
        <div className="mt-12 rounded-2xl bg-white p-12 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">Comece adicionando seu primeiro cliente</h2>
          <p className="mt-2 text-sm text-slate-500">
            Cada cliente ganha um board com listas prontas para organizar o mês.
          </p>
          <div className="mt-6">
            <AddClientDialog />
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}
