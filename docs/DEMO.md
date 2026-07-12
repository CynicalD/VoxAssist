# Demo script — VoxAssist (≈2 minutes)

## Recording tools

| Step | Tool |
| --- | --- |
| Capture | [OBS Studio](https://obsproject.com/) or [Loom](https://www.loom.com/) |
| Edit / captions | [Descript](https://www.descript.com/) or CapCut |
| Optional deterministic UI take | Playwright stub in [`demo.spec.ts`](./demo.spec.ts) |

## Happy-path narration

1. **Open the app** — VoxAssist branding. “Personal-KB RAG over markdown notes.”
2. **Sign in** — type a username (fake auth) or Clerk persona. Show the signed-in owner in the header.
3. **Self ask** — e.g. “What is my stack?” → Ask. Show streaming tokens + citation cards.
4. **Friend ask** — target another user (seeded: `alex` / `priya` / `marcus`, or a teammate). Ask “What’s their stack?” Note only **shared** notes are searchable.
5. **Plan** — switch to Plan, e.g. “Ship a RAG demo this weekend” → Draft plan. Show markdown brief + download.
6. **Optional** — upload a short `.md`, or play TTS read-aloud if ElevenLabs is configured.
7. **Close** — “Ask and plan, grounded in real notes — Atlas + Voyage + Claude on DigitalOcean.”

## Checklist before recording

- [ ] DO app healthy (or local `npm run dev` with real keys)
- [ ] Atlas seeded (`npm run seed` → [`seed/`](../seed))
- [ ] `USE_MOCK_AI=false` for the live demo (mocks only if you must)
- [ ] Friend targets have `shared: true` notes
- [ ] If using Clerk: origins include the deploy URL; `CLERK_OWNER_MAP` set
- [ ] Browser zoom 110–125%; hide bookmarks bar

## Optional Playwright walkthrough

```bash
npx playwright install chromium
npx playwright test docs/demo.spec.ts --headed
```

Requires `DEMO_BASE_URL` and credentials/storage state if you extend the stub.
