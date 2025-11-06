import OpenAI from "openai";

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

export type PlanningBriefing = {
  niche: string;
  country: "PT" | "BR";
  objective: string;
  feedPerWeek: number;
  reelsPerWeek: number;
  storiesPerWeek: number;
  month: string;
  importantDates?: string;
  tone: string;
  notes?: string;
};

export type PlanningPost = {
  date: string;
  channel: "feed" | "stories" | "ads" | "other";
  format: "reels" | "carrossel" | "estatico" | "story" | "outro";
  title: string;
  shortIdea: string;
  goal: string;
  suggestedCaption?: string;
  suggestedMediaIdea?: string;
};

export type PlanningResponse = {
  posts: PlanningPost[];
};

export type CardContext = {
  clientName: string;
  niche: string;
  country: "PT" | "BR";
  channel: string;
  format: string;
  goal?: string;
  description?: string;
  title: string;
  notes?: string;
};

function ensureKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada");
  }
}

export async function generatePlanning(
  briefing: PlanningBriefing
): Promise<PlanningResponse> {
  ensureKey();
  const locale = briefing.country === "PT" ? "pt-PT" : "pt-BR";
  const instructions = `Você é um estrategista de marketing que cria planejamentos de conteúdo para redes sociais. Utilize o português ${locale} e produza respostas em JSON válido. Respeite as quantidades semanais sugeridas.`;

  const input = `INSTRUÇÕES:\n${instructions}\n\nBRIEFING:\n${JSON.stringify(briefing, null, 2)}\n\nFORMATO DE RESPOSTA:\n{\n  "posts": [\n    {\n      "date": "YYYY-MM-DD",\n      "channel": "feed|stories|ads|other",\n      "format": "reels|carrossel|estatico|story|outro",\n      "title": "título curto",\n      "shortIdea": "Resumo de 1-2 frases",\n      "goal": "objetivo",\n      "suggestedCaption": "rascunho",\n      "suggestedMediaIdea": "ideia visual"\n    }\n  ]\n}`;

  const response = await openaiClient.responses.create({
    model: DEFAULT_MODEL,
    input
  });

  const text = response.output_text ?? "";
  try {
    const parsed = JSON.parse(text) as PlanningResponse;
    return parsed;
  } catch (error) {
    console.error("Falha ao interpretar resposta da OpenAI", error, text);
    throw new Error("Não foi possível gerar o planejamento automaticamente. Tente novamente.");
  }
}

export async function generateCaption(card: CardContext) {
  ensureKey();
  const locale = card.country === "PT" ? "pt-PT" : "pt-BR";
  const prompt = `Crie uma legenda para Instagram no idioma ${locale}.\nContexto do cliente: ${card.niche}.\nCanal: ${card.channel}. Formato: ${card.format}. Objetivo: ${card.goal ?? "sem objetivo definido"}.\nTítulo do card: ${card.title}.\nDescrição atual: ${card.description ?? "sem descrição"}.\nNotas adicionais: ${card.notes ?? ""}.\nEstruture com abertura envolvente, desenvolvimento e CTA final.`;

  const response = await openaiClient.responses.create({
    model: DEFAULT_MODEL,
    input: prompt
  });

  return response.output_text ?? "";
}

export async function generateReelsScript(card: CardContext) {
  ensureKey();
  const locale = card.country === "PT" ? "pt-PT" : "pt-BR";
  const prompt = `Crie um roteiro de Reels para Instagram no idioma ${locale}.\nCliente: ${card.clientName}. Nicho: ${card.niche}.\nFormato: ${card.format}. Objetivo: ${card.goal ?? "não informado"}.\nTítulo do card: ${card.title}.\nDescrição existente: ${card.description ?? "sem detalhes"}.\nForneça: gancho inicial, tópicos principais (bullet points), sugestões de cenas e CTA final.`;

  const response = await openaiClient.responses.create({
    model: DEFAULT_MODEL,
    input: prompt
  });

  return response.output_text ?? "";
}
