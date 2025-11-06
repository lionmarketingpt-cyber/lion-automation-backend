"use client";

import { useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import toast from "react-hot-toast";
import ListColumn, { ListView } from "./list-column";
import CardModal, { CardView, ClientSummary, GeneratedContentView } from "./card-modal";
import PlanningAssistantModal from "./planning-assistant-modal";
import { moveCardAction } from "@/app/actions";

export type BoardViewProps = {
  board: {
    id: string;
    name: string;
    lists: ListView[];
  };
  client: ClientSummary;
};

export default function BoardView({ board, client }: BoardViewProps) {
  const [selectedCard, setSelectedCard] = useState<CardView | null>(null);
  const [lists, setLists] = useState(board.lists);

  async function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    setLists((prev) => {
      const updated = prev.map((list) => ({ ...list, cards: [...list.cards] }));
      const sourceList = updated.find((list) => list.id === source.droppableId);
      const destinationList = updated.find((list) => list.id === destination.droppableId);
      if (!sourceList || !destinationList) {
        return prev;
      }
      const [moved] = sourceList.cards.splice(source.index, 1);
      if (!moved) return prev;
      destinationList.cards.splice(destination.index, 0, moved);
      return updated;
    });

    try {
      await moveCardAction(draggableId, destination.droppableId);
      toast.success("Card movido!");
    } catch (error: any) {
      toast.error(error?.message ?? "Não foi possível mover o card");
    }
  }


  function handleCardUpdate(cardId: string, updates: Partial<CardView>) {
    setLists((prev) => prev.map((list) => ({
      ...list,
      cards: list.cards.map((card) => (card.id === cardId ? { ...card, ...updates } : card))
    })));
    setSelectedCard((prev) => (prev && prev.id === cardId ? { ...prev, ...updates } : prev));
  }

  function handleGenerated(cardId: string, generated: GeneratedContentView) {
    setLists((prev) =>
      prev.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
          card.id === cardId ? { ...card, generated: [generated, ...(card.generated ?? [])] } : card
        )
      }))
    );
    setSelectedCard((prev) =>
      prev && prev.id === cardId
        ? { ...prev, generated: [generated, ...(prev.generated ?? [])] }
        : prev
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{client.name}</h2>
          <p className="text-sm text-slate-500">
            Nicho: {client.niche} • Idioma: {client.country === "BR" ? "Português do Brasil" : "Português de Portugal"}
          </p>
        </div>
        <PlanningAssistantModal
          clientId={client.id}
          defaultNiche={client.niche}
          defaultCountry={client.country}
        />
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-6">
          {lists
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((list) => (
              <ListColumn key={list.id} list={list} onSelectCard={(card) => setSelectedCard(card)} />
            ))}
        </div>
      </DragDropContext>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          client={client}
          onClose={() => setSelectedCard(null)}
          onCardUpdate={handleCardUpdate}
          onGenerated={handleGenerated}
        />
      )}
    </div>
  );
}
