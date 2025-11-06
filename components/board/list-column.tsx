"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import CardItem from "./card-item";
import { CardView } from "./card-modal";

export type ListView = {
  id: string;
  title: string;
  order: number;
  cards: CardView[];
};

export default function ListColumn({
  list,
  onSelectCard
}: {
  list: ListView;
  onSelectCard: (card: CardView) => void;
}) {
  return (
    <div className="flex h-full min-w-[280px] flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          {list.title}
        </h3>
        <span className="text-xs font-medium text-slate-400">{list.cards.length} cards</span>
      </div>
      <Droppable droppableId={list.id} type="CARD">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-3 transition ${
              snapshot.isDraggingOver ? "border-primary bg-orange-50/80" : ""
            }`}
          >
            {list.cards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(draggableProvided, draggableSnapshot) => (
                  <CardItem
                    card={card}
                    provided={draggableProvided}
                    snapshot={draggableSnapshot}
                    onClick={() => onSelectCard(card)}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
