# ai-chat-moderation
The AI chat moderation project is moderating the chat using openAI

# Installation
```
pnpm i
```

# Environment Variables

Make a copy of `.env.sample` in `services/moderation-api` and rename it to `.env.local`

Get an openapi key and place it it in `.env.local`

# Run project
```
pnpm --filter moderation-api dev
pnpm --filter frontend dev
```