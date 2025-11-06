import { prisma } from "./prisma";

export const DEFAULT_LISTS = [
  { title: "COMECE AQUI", order: 1 },
  { title: "1ª QUINZENA – FEED", order: 2 },
  { title: "1ª QUINZENA – STORIES", order: 3 },
  { title: "2ª QUINZENA – FEED", order: 4 },
  { title: "2ª QUINZENA – STORIES", order: 5 },
  { title: "ANÚNCIOS / TRÁFEGO", order: 6 },
  { title: "RELATÓRIOS", order: 7 }
];

export async function ensureBoardForClient(clientId: string) {
  const existing = await prisma.board.findUnique({
    where: { clientId },
    include: { lists: true }
  });
  if (existing) {
    if (existing.lists.length === 0) {
      await prisma.list.createMany({
        data: DEFAULT_LISTS.map((list) => ({
          boardId: existing.id,
          title: list.title,
          order: list.order
        }))
      });
    }
    await ensureIntroCards(existing.id);
    return existing;
  }

  const createdBoard = await prisma.board.create({
    data: {
      clientId,
      name: "Board de Conteúdo",
      lists: {
        create: DEFAULT_LISTS.map((list) => ({
          title: list.title,
          order: list.order
        }))
      }
    },
    include: { lists: true }
  });

  await ensureIntroCards(createdBoard.id);

  return createdBoard;
}

async function ensureIntroCards(boardId: string) {
  const list = await prisma.list.findFirst({
    where: { boardId, title: "COMECE AQUI" }
  });
  if (!list) return;

  const cards = await prisma.card.findMany({ where: { listId: list.id } });
  if (cards.length > 0) return;

  await prisma.card.createMany({
    data: [
      {
        listId: list.id,
        title: "Briefing do Cliente",
        description:
          "Use este card para registrar o resumo do cliente, público e diferenciais.",
        goal: "Contexto geral"
      },
      {
        listId: list.id,
        title: "Planejamento Estratégico",
        description:
          "Centralize aqui as diretrizes de conteúdo, pilares e campanhas do mês.",
        goal: "Visão estratégica"
      }
    ]
  });
}
