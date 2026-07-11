"use client"

import type React from "react"
import { useMemo } from "react"
import { Download, FileText, Loader2, ClipboardList } from "lucide-react"
import type { PlanResponse } from "@/lib/contract"
import { Button } from "@/components/ui/button"
import { CitationCard } from "./citation-card"

export interface PlanPanelProps {
  plan: PlanResponse | null
  loading?: boolean
  /** Title used for the downloaded file name (defaults to the plan's markdownPath or "plan"). */
  title?: string
}

/** Renders a generated plan brief with citations and a "Download .md" action. */
export function PlanPanel({ plan, loading = false, title }: PlanPanelProps) {
  const fileName = useMemo(() => {
    const base =
      title ??
      plan?.markdownPath?.split("/").pop()?.replace(/\.md$/, "") ??
      "voxassist-plan"
    return `${slugify(base)}.md`
  }, [title, plan?.markdownPath])

  function downloadMarkdown() {
    if (!plan) return
    const blob = new Blob([plan.brief], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
        <Loader2 className="mb-3 size-6 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm font-medium">Drafting your plan…</p>
        <p className="mt-1 text-sm text-muted-foreground">Grounding each section in your notes.</p>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <ClipboardList className="size-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium">No plan yet</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Switch the prompt to Plan mode and describe an idea to generate a downloadable brief.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <FileText className="size-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold">Plan brief</h2>
        <Button size="sm" variant="outline" onClick={downloadMarkdown} className="ml-auto">
          <Download className="size-4" aria-hidden="true" />
          Download .md
        </Button>
      </div>

      <div className="p-4">
        <Markdown source={plan.brief} />

        {plan.citations.length > 0 && (
          <section className="mt-6" aria-label="Citations">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {plan.citations.length} {plan.citations.length === 1 ? "Source" : "Sources"}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {plan.citations.map((citation, i) => (
                <CitationCard key={`${citation.documentPath}-${i}`} citation={citation} index={i + 1} />
              ))}
            </div>
          </section>
        )}

        {plan.markdownPath && (
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            saved to {plan.markdownPath}
          </p>
        )}
      </div>
    </div>
  )
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "plan"
  )
}

/** Minimal, dependency-free markdown renderer for the plan brief. */
function Markdown({ source }: { source: string }) {
  const blocks = useMemo(() => parseMarkdown(source), [source])
  return (
    <div className="space-y-2 text-[0.95rem] leading-relaxed text-foreground">
      {blocks.map((block, i) => {
        if (block.type === "h1")
          return (
            <h3 key={i} className="text-lg font-semibold tracking-tight">
              {inline(block.text)}
            </h3>
          )
        if (block.type === "h2")
          return (
            <h4 key={i} className="mt-4 text-base font-semibold">
              {inline(block.text)}
            </h4>
          )
        if (block.type === "h3")
          return (
            <h5 key={i} className="mt-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {inline(block.text)}
            </h5>
          )
        if (block.type === "ul")
          return (
            <ul key={i} className="ml-4 list-disc space-y-1 text-muted-foreground">
              {block.items.map((item, j) => (
                <li key={j}>{inline(item)}</li>
              ))}
            </ul>
          )
        if (block.type === "ol")
          return (
            <ol key={i} className="ml-4 list-decimal space-y-1 text-muted-foreground">
              {block.items.map((item, j) => (
                <li key={j}>{inline(item)}</li>
              ))}
            </ol>
          )
        if (block.type === "p")
          return (
            <p key={i} className="text-muted-foreground">
              {inline(block.text)}
            </p>
          )
        return null
      })}
    </div>
  )
}

type Block =
  | { type: "h1" | "h2" | "h3" | "p"; text: string }
  | { type: "ul" | "ol"; items: string[] }

function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n")
  const blocks: Block[] = []
  let list: { type: "ul" | "ol"; items: string[] } | null = null

  const flush = () => {
    if (list) {
      blocks.push(list)
      list = null
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (!line.trim()) {
      flush()
      continue
    }
    if (line.startsWith("### ")) {
      flush()
      blocks.push({ type: "h3", text: line.slice(4) })
    } else if (line.startsWith("## ")) {
      flush()
      blocks.push({ type: "h2", text: line.slice(3) })
    } else if (line.startsWith("# ")) {
      flush()
      blocks.push({ type: "h1", text: line.slice(2) })
    } else if (/^[-*]\s+/.test(line)) {
      if (!list || list.type !== "ul") {
        flush()
        list = { type: "ul", items: [] }
      }
      list.items.push(line.replace(/^[-*]\s+/, ""))
    } else if (/^\d+\.\s+/.test(line)) {
      if (!list || list.type !== "ol") {
        flush()
        list = { type: "ol", items: [] }
      }
      list.items.push(line.replace(/^\d+\.\s+/, ""))
    } else {
      flush()
      blocks.push({ type: "p", text: line.replace(/^_(.*)_$/, "$1") })
    }
  }
  flush()
  return blocks
}

/** Render inline **bold** and `code` spans. */
function inline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      )
    return <span key={i}>{part}</span>
  })
}
