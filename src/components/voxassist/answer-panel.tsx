"use client"

import { MessageSquareText, Quote, Sparkles } from "lucide-react"
import type { Citation } from "@/lib/contract"
import { CitationCard } from "./citation-card"

export interface AnswerPanelProps {
  /** The question that produced this answer (optional header). */
  question?: string
  /** The answer text; may be partial while streaming. */
  answer: string
  citations: Citation[]
  /** True while tokens are still arriving. */
  streaming?: boolean
  /** True before any request has been made. */
  idle?: boolean
}

/**
 * Renders a streamed answer with a live cursor plus the source citation cards.
 * Feed `answer` incrementally (append deltas) and toggle `streaming`.
 */
export function AnswerPanel({ question, answer, citations, streaming = false, idle = false }: AnswerPanelProps) {
  if (idle && !answer) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <MessageSquareText className="size-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium">Ask a question to get started</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Answers stream in live and every claim is backed by a citation from the source notes.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Sparkles className="size-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold">Answer</h2>
        {streaming && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" aria-hidden="true" />
            Streaming
          </span>
        )}
      </div>

      <div className="p-4">
        {question && (
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            <span className="text-foreground">Q:</span> {question}
          </p>
        )}

        <div className="text-pretty text-[0.95rem] leading-relaxed text-foreground">
          {answer}
          {streaming && (
            <span
              className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-primary align-middle"
              aria-hidden="true"
            />
          )}
        </div>

        {citations.length > 0 && (
          <section className="mt-6" aria-label="Citations">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Quote className="size-3.5" aria-hidden="true" />
              {citations.length} {citations.length === 1 ? "Source" : "Sources"}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {citations.map((citation, i) => (
                <CitationCard key={`${citation.documentPath}-${i}`} citation={citation} index={i + 1} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
