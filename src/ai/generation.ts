// Real IGenerator — split providers.
// `ask`  → Gemini (config.askModel / gemini-2.5-flash), grounded answer + citations.
// `plan` → Claude Opus (config.planModel), personalized project brief.
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import type {
  AskResponse,
  IGenerator,
  PlanResponse,
  RetrievalResult,
} from "../contract/types";
import { config } from "../lib/config";

/** Per-chunk char cap when building context (keeps prompts lean). */
const CHUNK_CHAR_CAP = 1500;

function getAnthropicClient(): Anthropic {
  return new Anthropic({
    apiKey: config.anthropicApiKey,
    ...(process.env.ANTHROPIC_BASE_URL
      ? { baseURL: process.env.ANTHROPIC_BASE_URL }
      : {}),
  });
}

function getGeminiClient(): GoogleGenAI {
  if (!config.geminiApiKey) {
    throw new Error("Missing env var GEMINI_API_KEY (see .env.example)");
  }
  return new GoogleGenAI({ apiKey: config.geminiApiKey });
}

/** Format retrieval context as numbered blocks the model can cite as [n]. */
function contextBlock(context: RetrievalResult): string {
  if (context.chunks.length === 0) return "(no context retrieved)";
  return context.chunks
    .map((c, i) => {
      const body =
        c.content.length > CHUNK_CHAR_CAP
          ? `${c.content.slice(0, CHUNK_CHAR_CAP)}…`
          : c.content;
      return `[${i + 1}] (${c.documentPath} › ${c.headingPath}, owner: ${c.owner})\n${body}`;
    })
    .join("\n\n");
}

function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

const ASK_SYSTEM = `You are VoxAssist, answering questions about a person from their own notes.
Rules:
- Answer ONLY from the numbered context blocks. Do not invent facts.
- Cite blocks inline like [1] or [2][3] right after the claims they support.
- If the context doesn't contain the answer, say so plainly.
- Be concise and direct.`;

const PLAN_SYSTEM = `You are VoxAssist, writing a personalized project brief.
You receive an idea plus numbered context blocks describing the person's real stack, style, and past work.
Write a markdown brief with these sections:
# <Project name>
## Overview — the idea in their terms
## Recommended stack — grounded in what THEY already know (cite blocks like [1])
## Architecture — concise, concrete
## Milestones — a short ordered build plan
## Risks & unknowns
Ground every stack/style choice in the context where possible, citing [n]. Where the context is silent, prefer boring, mainstream choices and say why.`;

export class Generator implements IGenerator {
  async ask(question: string, context: RetrievalResult): Promise<AskResponse> {
    const ai = getGeminiClient();
    const res = await ai.models.generateContent({
      model: config.askModel,
      contents: `Context:\n\n${contextBlock(context)}\n\nQuestion: ${question}`,
      config: {
        systemInstruction: ASK_SYSTEM,
        maxOutputTokens: 1024,
      },
    });
    return { answer: res.text ?? "", citations: context.citations };
  }

  async plan(idea: string, context: RetrievalResult): Promise<PlanResponse> {
    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: config.planModel,
      max_tokens: 4000,
      system: PLAN_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Context about the person:\n\n${contextBlock(context)}\n\nProject idea: ${idea}`,
        },
      ],
    });
    return { brief: textOf(message), citations: context.citations };
  }
}

export function createGenerator(): IGenerator {
  return new Generator();
}
