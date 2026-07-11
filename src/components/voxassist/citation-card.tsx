import { FileText, ChevronRight } from "lucide-react"
import type { Citation } from "@/lib/contract"

export interface CitationCardProps {
  citation: Citation
  /** 1-based index shown as a reference marker. */
  index?: number
}

/** A single source citation rendered as a compact card. */
export function CitationCard({ citation, index }: CitationCardProps) {
  const segments = citation.headingPath.split(">").map((s) => s.trim()).filter(Boolean)
  const fileName = citation.documentPath.split("/").pop() ?? citation.documentPath

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
        {index != null ? (
          <span className="text-xs font-semibold tabular-nums">{index}</span>
        ) : (
          <FileText className="size-4" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <FileText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="truncate font-mono text-sm font-medium">{fileName}</span>
        </div>

        {segments.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-muted-foreground">
            {segments.map((seg, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3" aria-hidden="true" />}
                <span className="truncate">{seg}</span>
              </span>
            ))}
          </div>
        )}

        <p className="mt-1 truncate text-xs text-muted-foreground/70">
          {citation.documentPath} · owner: {citation.owner}
        </p>
      </div>
    </div>
  )
}
