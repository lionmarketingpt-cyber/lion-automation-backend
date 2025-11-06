"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { generatePlanningAction } from "@/app/actions";

export type PlanningAssistantProps = {
  clientId: string;
  defaultNiche: string;
  defaultCountry: "PT" | "BR";
};

export default function PlanningAssistantModal({
  clientId,
  defaultNiche,
  defaultCountry
}: PlanningAssistantProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const niche = form.get("niche")?.toString() ?? defaultNiche;
    const country = (form.get("country")?.toString() ?? defaultCountry) as "PT" | "BR";
    const objective = form.get("objective")?.toString() ?? "";
    const feedPerWeek = Number(form.get("feedPerWeek") ?? 3);
    const reelsPerWeek = Number(form.get("reelsPerWeek") ?? 2);
    const storiesPerWeek = Number(form.get("storiesPerWeek") ?? 3);
    const month = form.get("month")?.toString() ?? "Mês atual";
    const importantDates = form.get("dates")?.toString() ?? "";
    const tone = form.get("tone")?.toString() ?? "leve e informal";
    const notes = form.get("notes")?.toString() ?? "";

    startTransition(async () => {
      try {
        await generatePlanningAction(clientId, {
          niche,
          country,
          objective,
          feedPerWeek,
          reelsPerWeek,
          storiesPerWeek,
          month,
          importantDates,
          tone,
          notes
        });
        toast.success("Planejamento criado! Os cards foram adicionados ao board.");
        setOpen(false);
        router.refresh();
      } catch (error: any) {
        toast.error(error?.message ?? "Não foi possível gerar o planejamento");
      }
    });
  }

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Assistente de Planejamento (IA)
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Assistente de planejamento</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Preencha o briefing para gerar um cronograma completo com a IA.
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
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-600">Nicho / segmento</label>
                  <input
                    name="niche"
                    defaultValue={defaultNiche}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">País / idioma</label>
                  <select
                    name="country"
                    defaultValue={defaultCountry}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <option value="BR">Brasil (PT-BR)</option>
                    <option value="PT">Portugal (PT-PT)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Objetivo do mês</label>
                <input
                  name="objective"
                  placeholder="Ex.: aumentar vendas de combos"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-slate-600">Posts feed / semana</label>
                  <input
                    type="number"
                    name="feedPerWeek"
                    defaultValue={3}
                    min={1}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Reels / semana</label>
                  <input
                    type="number"
                    name="reelsPerWeek"
                    defaultValue={2}
                    min={0}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Sequências stories / semana</label>
                  <input
                    type="number"
                    name="storiesPerWeek"
                    defaultValue={3}
                    min={0}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-600">Período (mês/ano)</label>
                  <input
                    name="month"
                    placeholder="Ex.: Novembro 2024"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Tom de voz</label>
                  <select
                    name="tone"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    defaultValue="leve e informal"
                  >
                    <option value="leve e informal">Leve e informal</option>
                    <option value="técnico e profissional">Técnico e profissional</option>
                    <option value="premium">Premium</option>
                    <option value="motivador">Motivador</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Datas importantes</label>
                <textarea
                  name="dates"
                  rows={3}
                  placeholder="Ex.: 12/06 Dia dos Namorados; 20/11 Consciência Negra"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Observações gerais</label>
                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Detalhes extras sobre campanhas, promoções, produtos..."
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
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
                  {isPending ? "Gerando..." : "Gerar planejamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
