"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CardStatus, Channel, Format } from "@prisma/client";
import { hashPassword } from "@/lib/hash";
import { ensureBoardForClient } from "@/lib/board";
import {
  PlanningBriefing,
  generateCaption,
  generatePlanning,
  generateReelsScript
} from "@/lib/openai";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type GeneratedResult = {
  id: string;
  type: string;
  content: string;
  createdAt: string;
};

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autenticado");
  }
  return session.user;
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error("E-mail já cadastrado");
  }
  const passwordHash = await hashPassword(data.password);
  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash
    }
  });
}

export async function createClientAction(data: {
  name: string;
  niche: string;
  country: "PT" | "BR";
  instagramHandle?: string;
  notes?: string;
}) {
  const user = await requireUser();
  const client = await prisma.client.create({
    data: {
      ownerId: user.id,
      name: data.name,
      niche: data.niche,
      country: data.country,
      instagramHandle: data.instagramHandle,
      notes: data.notes
    }
  });
  await ensureBoardForClient(client.id);
  revalidatePath("/dashboard");
  return client.id;
}

export async function generatePlanningAction(
  clientId: string,
  briefing: PlanningBriefing
) {
  const user = await requireUser();
  const client = await prisma.client.findUnique({
    where: { id: clientId, ownerId: user.id },
    include: {
      board: {
        include: { lists: true }
      }
    }
  });
  if (!client || !client.board) {
    throw new Error("Cliente não encontrado");
  }

  const plan = await generatePlanning(briefing);
  if (!plan.posts?.length) {
    throw new Error("A IA não retornou sugestões. Tente novamente.");
  }
  const lists = client.board.lists;

  const firstHalfFeed = lists.find((list) => list.title.includes("1ª QUINZENA – FEED"));
  const firstHalfStories = lists.find((list) => list.title.includes("1ª QUINZENA – STORIES"));
  const secondHalfFeed = lists.find((list) => list.title.includes("2ª QUINZENA – FEED"));
  const secondHalfStories = lists.find((list) => list.title.includes("2ª QUINZENA – STORIES"));
  const otherList = lists.find((list) => list.title.includes("ANÚNCIOS")) ?? lists[0];

  const allowedChannels = ["feed", "stories", "ads", "other"] as const;
  const allowedFormats = ["reels", "carrossel", "estatico", "story", "outro"] as const;
  for (const post of plan.posts) {
    const date = post.date ? new Date(post.date) : undefined;
    const day = date ? date.getDate() : 1;
    const half = day <= 15 ? "first" : "second";
    const channel = allowedChannels.includes(post.channel as any) ? (post.channel as typeof allowedChannels[number]) : "other";
    const formatValue = allowedFormats.includes(post.format as any) ? (post.format as typeof allowedFormats[number]) : "outro";
    let listId = otherList.id;
    if (channel === "feed") {
      listId = half === "first" && firstHalfFeed ? firstHalfFeed.id : secondHalfFeed?.id ?? otherList.id;
    } else if (channel === "stories") {
      listId = half === "first" && firstHalfStories ? firstHalfStories.id : secondHalfStories?.id ?? otherList.id;
    }
    const descriptionLines = [post.shortIdea];
    if (post.suggestedCaption) {
      descriptionLines.push(`Legenda sugerida:\n${post.suggestedCaption}`);
    }
    if (post.suggestedMediaIdea) {
      descriptionLines.push(`Sugestão de mídia: ${post.suggestedMediaIdea}`);
    }
    await prisma.card.create({
      data: {
        listId,
        title: `${date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : "Conteúdo"} – ${post.title}`,
        description: descriptionLines.join("\n\n"),
        date,
        channel,
        format: formatValue,
        goal: post.goal
      }
    });
  }

  revalidatePath(`/clients/${clientId}/board`);
}

export async function updateCardAction(cardId: string, data: {
  title: string;
  description?: string;
  date?: Date | null;
  channel: string;
  format: string;
  goal?: string;
  status: string;
}) {
  const user = await requireUser();
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      list: {
        include: {
          board: {
            include: { client: true }
          }
        }
      }
    }
  });
  if (!card || card.list.board.client.ownerId !== user.id) {
    throw new Error("Card não encontrado");
  }
  await prisma.card.update({
    where: { id: cardId },
    data: {
      title: data.title,
      description: data.description,
      date: data.date ?? null,
      channel: data.channel as Channel,
      format: data.format as Format,
      goal: data.goal,
      status: data.status as CardStatus
    }
  });
  revalidatePath(`/clients/${card.list.board.clientId}/board`);
}

export async function moveCardAction(cardId: string, destinationListId: string) {
  const user = await requireUser();
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      list: {
        include: {
          board: {
            include: { client: true }
          }
        }
      }
    }
  });
  const list = await prisma.list.findUnique({
    where: { id: destinationListId },
    include: {
      board: {
        include: { client: true }
      }
    }
  });
  if (!card || !list || card.list.board.client.ownerId !== user.id || list.board.client.ownerId !== user.id) {
    throw new Error("Sem permissão");
  }
  await prisma.card.update({
    where: { id: cardId },
    data: {
      listId: destinationListId,
      updatedAt: new Date()
    }
  });
  revalidatePath(`/clients/${list.board.clientId}/board`);
}

export async function generateCaptionAction(cardId: string): Promise<GeneratedResult> {
  const user = await requireUser();
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      list: {
        include: {
          board: {
            include: {
              client: true
            }
          }
        }
      },
      generated: true
    }
  });
  if (!card || card.list.board.client.ownerId !== user.id) {
    throw new Error("Card não encontrado");
  }
  const client = card.list.board.client;
  const caption = await generateCaption({
    clientName: client.name,
    niche: client.niche,
    country: client.country as "PT" | "BR",
    channel: card.channel as Channel,
    format: card.format as Format,
    goal: card.goal ?? undefined,
    description: card.description ?? undefined,
    title: card.title,
    notes: client.notes ?? undefined
  });

  const generated = await prisma.generatedContent.create({
    data: {
      cardId,
      type: "caption",
      content: caption
    }
  });
  revalidatePath(`/clients/${client.id}/board`);
  return { id: generated.id, type: generated.type, content: generated.content, createdAt: generated.createdAt.toISOString() };
}

export async function generateReelsScriptAction(cardId: string): Promise<GeneratedResult> {
  const user = await requireUser();
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      list: {
        include: {
          board: {
            include: {
              client: true
            }
          }
        }
      },
      generated: true
    }
  });
  if (!card || card.list.board.client.ownerId !== user.id) {
    throw new Error("Card não encontrado");
  }
  const client = card.list.board.client;
  const script = await generateReelsScript({
    clientName: client.name,
    niche: client.niche,
    country: client.country as "PT" | "BR",
    channel: card.channel as Channel,
    format: card.format as Format,
    goal: card.goal ?? undefined,
    description: card.description ?? undefined,
    title: card.title,
    notes: client.notes ?? undefined
  });

  const generated = await prisma.generatedContent.create({
    data: {
      cardId,
      type: "reels_script",
      content: script
    }
  });
  revalidatePath(`/clients/${client.id}/board`);
  return { id: generated.id, type: generated.type, content: generated.content, createdAt: generated.createdAt.toISOString() };
}
