# VoxAssist

Personal knowledge-base RAG for **ask** + **plan**, with citations, Clerk auth, and optional friend-scope queries over shared notes.

Team **Void Stars** · [CynicalD/VoxAssist](https://github.com/CynicalD/VoxAssist)

## Quick start

```bash
cp .env.example .env   # set Clerk keys; USE_MOCK_AI=true for local mocks
npm install
npm run dev
```

```bash
npm run ingest -- --vault ./sample-vault --as momen
```

## Deploy (DigitalOcean App Platform)

Deploy from GitHub so App Platform builds and runs this Next.js service on port **3000**.

### Option A — App Spec (`deploy/app.yaml`)

1. Push your branch (default in the spec: `lane/app`).
2. In [DigitalOcean App Platform](https://cloud.digitalocean.com/apps) → **Create App** → connect the `CynicalD/VoxAssist` GitHub repo (or paste the spec).
3. Use **App Spec** and point at / upload `deploy/app.yaml`, or run:
   ```bash
   doctl apps create --spec deploy/app.yaml
   ```
4. Open the app → **Settings** → **App-Level Environment Variables** and set secrets (mark as encrypted):

   | Variable | Notes |
   | --- | --- |
   | `MONGODB_URI` | Atlas connection string |
   | `VOYAGE_API_KEY` | Embeddings |
   | `GEMINI_API_KEY` | `ask` generation |
   | `ANTHROPIC_BASE_URL` | DO Gradient / Anthropic base |
   | `ANTHROPIC_API_KEY` | `plan` generation |
   | `CLERK_SECRET_KEY` | Server auth |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | **Build + runtime** (client bundle) |
   | `USE_MOCK_AI` | `"true"` until real AI modules are wired |

5. In Clerk, add the DO app URL to allowed origins / redirect URLs.
6. Redeploy. Happy path: `USE_MOCK_AI=true` → sign in → Ask / Plan in the UI.

Build command: `npm run build` · Run command: `npm start` · HTTP port: `3000`.

### Option B — Dockerfile (optional)

```bash
docker build -f deploy/Dockerfile -t voxassist \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... \
  --build-arg USE_MOCK_AI=true \
  .

docker run --rm -p 3000:3000 --env-file .env voxassist
```

You can also point App Platform at `deploy/Dockerfile` instead of the Node buildpack.

## License

See [LICENSE](./LICENSE).
