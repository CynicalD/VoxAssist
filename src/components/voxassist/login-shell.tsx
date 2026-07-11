"use client"

import type React from "react"
import { useState } from "react"
import { AudioLines, ArrowRight, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface LoginShellProps {
  /** Called with the entered credentials. Wire this to Clerk / your auth backend. */
  onSubmit?: (credentials: { username: string; password: string }) => void | Promise<void>
  /** Render a custom auth widget (e.g. Clerk's <SignIn />) instead of the built-in form. */
  children?: React.ReactNode
  loading?: boolean
  error?: string
}

/**
 * Branded split-screen auth shell for VoxAssist.
 * Presentational only — pass `onSubmit` to connect it to Clerk or your API,
 * or pass `children` to drop in a third-party auth widget.
 */
export function LoginShell({ onSubmit, children, loading = false, error }: LoginShellProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit?.({ username, password })
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2.5">
          <AudioLines className="size-6" aria-hidden="true" />
          <span className="text-lg font-semibold tracking-tight">VoxAssist</span>
        </div>

        <div className="max-w-md space-y-4">
          <h1 className="text-pretty text-3xl font-semibold leading-tight">
            Ask your knowledge base out loud. Get grounded, cited answers back.
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-primary-foreground/80">
            A voice-first RAG assistant over your notes. Every claim is traced back to the source
            note, and you can scope queries to your own vault or a teammate&apos;s shared one.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
          <ShieldCheck className="size-4" aria-hidden="true" />
          <span>Cross-user queries only ever surface shared notes.</span>
        </div>

        {/* Decorative concentric rings, purely aesthetic */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full border border-primary-foreground/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-10 size-80 rounded-full border border-primary-foreground/10"
        />
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <AudioLines className="size-6 text-primary" aria-hidden="true" />
            <span className="text-lg font-semibold tracking-tight">VoxAssist</span>
          </div>

          <div className="mb-8 space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to query your knowledge base.</p>
          </div>

          {children ?? (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  placeholder="momen"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
                {!loading && <ArrowRight className="size-4" aria-hidden="true" />}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Protected by session auth. By continuing you agree to the demo terms.
          </p>
        </div>
      </main>
    </div>
  )
}
