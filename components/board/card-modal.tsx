"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  generateCaptionAction,
  generateReelsScriptAction,
  updateCardAction
} from "@/app/actions";

export type GeneratedContentView = {
  id: string;
  type: string;
  content: string;
  createdAt: string;
};

export type CardView = {
  id: string;
  title: string;
  description?: string | null;
  date?: string | null;
  channel: string;
  format: string;
  goal?: string | null;
  status: string;
  listId: string;
  generated: GeneratedContentView[];
};

export type ClientSummary = {
  id: string;
  name: string;
  niche: string;
  country: "PT" | "BR";
  notes?: string | null;
};

const channelOptions = [
  { value: "feed", label: "Feed" },
  { value: "stories", label: "Stories" },
  { value: "ads", label: "Anúncios" },
  { value: "other", label: "Outro" }
];

const formatOptions = [
  { value: "reels", label: "Reels" },
  { value: "carrossel", label: "Carrossel" },
  { value: "estatico", label: "Estático" },
  { value: "story", label: "Story" },
  { value: "outro", label: "Outro" }
];

const statusOptions = [
  { value: "planejado", label: "Planejado" },
  { value: "aprovado", label: "Aprovado" },
  { value: "postado", label: "Postado" }
];

export default function CardModal({
  card,
  client,
  onClose,
  onCardUpdate,
  onGenerated
}: {
  card: CardView;
  client: ClientSummary;
  onClose: () => void;
  onCardUpdate: (cardId: string, updates: Partial<CardView>) => void;
  onGenerated: (cardId: string, generated: GeneratedContentView) => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [date, setDate] = useState(card.date ? card.date.substring(0, 10) : "");
  const [channel, setChannel] = useState(card.channel);
  const [format, setFormat] = useState(card.format);
  const [goal, setGoal] = useState(card.goal ?? "");
  const [status, setStatus] = useState(card.status);
  const [isPending, startTransition] = useTransition();
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generated, setGenerated] = useState(card.generated);
  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description ?? "");
    setDate(card.date ? card.date.substring(0, 10) : "");
    setChannel(card.channel);
    setFormat(card.format);
    setGoal(card.goal ?? "");
    setStatus(card.status);
    setGenerated(card.generated);
  }, [card]);


  function handleSave() {
    startTransition(async () => {
      try {
        await updateCardAction(card.id, {
          title,
          description,
          date: date ? new Date(date) : null,
          channel,
          format,
          goal,
          status
        });
        onCardUpdate(card.id, {
          title,
          description,
          date: date ? new Date(date).toISOString() : null,
          channel,
          format,
          goal,
          status
        });
        toast.success("Card atualizado");
        router.refresh();
        onClose();
      } catch (error: any) {
        toast.error(error?.message ?? "Erro ao salvar card");
      }
    });
  }

  async function handleCaption() {
    try {
      setIsGeneratingCaption(true);
      const generatedItem = await generateCaptionAction(card.id);
      setGenerated((prev) => [generatedItem, ...prev]);
      onGenerated(card.id, generatedItem);
      toast.success("Legenda gerada!");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message ?? "Falha ao gerar legenda");
    } finally {
      setIsGeneratingCaption(false);
    }
  }

  async function handleScript() {
    try {
      setIsGeneratingScript(true);
      const generatedItem = await generateReelsScriptAction(card.id);
      setGenerated((prev) => [generatedItem, ...prev]);
      onGenerated(card.id, generatedItem);
      toast.success("Roteiro gerado!");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message ?? "Falha ao gerar roteiro");
    } finally {
      setIsGeneratingScript(false);
    }
  }

  function copyContent(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Editar card</h2>
            <p className="text-sm text-slate-500">
              Ajuste informações e peça ajuda da IA para acelerar o conteúdo.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
          >
            Fechar
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Título</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-600">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Objetivo</label>
                <input
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  placeholder="Engajamento, vendas..."
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-slate-600">Canal</label>
                <select
                  value={channel}
                  onChange={(event) => setChannel(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                >
                  {channelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Formato</label>
                <select
                  value={format}
                  onChange={(event) => setFormat(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                >
                  {formatOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Descrição / briefing do card</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={8}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                placeholder="Detalhe a ideia do conteúdo, pontos-chave e chamadas."
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
              >
                {isPending ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-700">Assistentes de IA</h3>
              <p className="mt-2 text-xs text-slate-500">
                Usamos o contexto do card e do cliente para gerar textos automaticamente.
              </p>
              <div className="mt-4 space-y-3">
                <button
                  onClick={handleCaption}
                  disabled={isGeneratingCaption}
                  className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
                >
                  {isGeneratingCaption ? "Gerando legenda..." : "Gerar legenda com IA"}
                </button>
                <button
                  onClick={handleScript}
                  disabled={isGeneratingScript}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
                >
                  {isGeneratingScript ? "Gerando roteiro..." : "Gerar roteiro de Reels"}
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-700">Conteúdos gerados</h3>
              {generated.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">
                  Nenhum conteúdo gerado ainda. Use os botões acima para criar automaticamente.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {generated.map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase text-primary">
                          {item.type === "caption" && "Legenda"}
                          {item.type === "reels_script" && "Roteiro de Reels"}
                          {item.type === "planning" && "Planejamento"}
                        </span>
                        <button
                          onClick={() => copyContent(item.content)}
                          className="text-xs font-medium text-primary"
                        >
                          Copiar
                        </button>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-xs text-slate-600">{item.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
