"use client";

import { useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClientAction } from "@/app/actions";
import toast from "react-hot-toast";

export default function AddClientDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = form.get("name")?.toString() ?? "";
    const niche = form.get("niche")?.toString() ?? "";
    const country = (form.get("country")?.toString() ?? "BR") as "PT" | "BR";
    const instagramHandle = form.get("instagram")?.toString() || undefined;
    const notes = form.get("notes")?.toString() || undefined;

    startTransition(async () => {
      try {
        await createClientAction({
          name,
          niche,
          country,
          instagramHandle,
          notes
        });
        toast.success("Cliente adicionado!");
        setOpen(false);
        formElement.reset();
        router.refresh();
      } catch (error: any) {
        toast.error(error?.message ?? "Erro ao salvar cliente");
      }
    });
  }

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
      >
        Adicionar cliente
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Novo cliente</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Preencha os dados para criar o board automaticamente.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
              >
                Fechar
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Nome da empresa</label>
                <input
                  name="name"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                  placeholder="Ex.: Padaria do Centro"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Nicho / segmento</label>
                <input
                  name="niche"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                  placeholder="Ex.: Alimentação saudável"
                />
              </div>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-600">País / idioma</label>
                  <select
                    name="country"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    defaultValue="BR"
                  >
                    <option value="BR">Brasil (PT-BR)</option>
                    <option value="PT">Portugal (PT-PT)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-600">Instagram</label>
                  <input
                    name="instagram"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    placeholder="@perfil"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Observações</label>
                <textarea
                  name="notes"
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                  placeholder="Informações adicionais, tom de voz, histórico..."
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
                >
                  {isPending ? "Salvando..." : "Salvar cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
