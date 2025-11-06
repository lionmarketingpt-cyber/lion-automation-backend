"use client";

import { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { CardView } from "./card-modal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CardItem({
  card,
  provided,
  snapshot,
  onClick
}: {
  card: CardView;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  onClick: () => void;
}) {
  const dateLabel = card.date ? format(new Date(card.date), "dd MMM", { locale: ptBR }) : null;

  const badgeClass =
    card.status === "postado"
      ? "bg-emerald-100 text-emerald-700"
      : card.status === "aprovado"
      ? "bg-sky-100 text-sky-700"
      : "bg-amber-100 text-amber-700";

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={onClick}
      className={`group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        snapshot.isDragging ? "border-primary shadow-lg" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{card.title}</p>
          {dateLabel && <p className="mt-1 text-xs text-slate-500">{dateLabel}</p>}
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${badgeClass}`}>
          {card.status}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium uppercase text-slate-500">
        <span className="rounded-full bg-slate-100 px-2 py-1">Canal: {card.channel}</span>
        <span className="rounded-full bg-slate-100 px-2 py-1">Formato: {card.format}</span>
      </div>
      {card.description && (
        <p className="mt-3 text-ellipsis overflow-hidden text-xs text-slate-500">{card.description}</p>
      )}
    </div>
  );
}
