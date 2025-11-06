import BoardView from "@/components/board/board-view";
import { auth } from "@/lib/auth";
import { ensureBoardForClient } from "@/lib/board";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";

export default async function ClientBoardPage({
  params
}: {
  params: { clientId: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const client = await prisma.client.findFirst({
    where: { id: params.clientId, ownerId: session.user.id },
    include: {
      board: {
        include: {
          lists: {
            include: {
              cards: {
                include: {
                  generated: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!client) {
    notFound();
  }

  await ensureBoardForClient(client.id);

  const board = client.board ??
    (await prisma.board.findUnique({
      where: { clientId: client.id },
      include: {
        lists: {
          include: {
            cards: {
              include: { generated: true }
            }
          }
        }
      }
    }));

  if (!board) {
    notFound();
  }

  const serializedBoard = {
    id: board.id,
    name: board.name,
    lists: board.lists
      .sort((a, b) => a.order - b.order)
      .map((list) => ({
        id: list.id,
        title: list.title,
        order: list.order,
        cards: list.cards
          .sort((a, b) => (a.date && b.date ? a.date.getTime() - b.date.getTime() : 0))
          .map((card) => ({
            id: card.id,
            title: card.title,
            description: card.description,
            date: card.date ? card.date.toISOString() : null,
            channel: card.channel,
            format: card.format,
            goal: card.goal,
            status: card.status,
            listId: card.listId,
            generated: card.generated
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((item) => ({
                id: item.id,
                type: item.type,
                content: item.content,
                createdAt: item.createdAt.toISOString()
              }))
          }))
      })
  };

  const clientSummary = {
    id: client.id,
    name: client.name,
    niche: client.niche,
    country: client.country as "PT" | "BR",
    notes: client.notes ?? undefined
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl space-y-8 p-6">
      <BoardView board={serializedBoard} client={clientSummary} />
    </div>
  );
}
